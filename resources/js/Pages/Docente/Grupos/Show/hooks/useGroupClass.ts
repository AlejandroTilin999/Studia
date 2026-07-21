import { useState, useEffect, useMemo } from 'react';
import { usePage, router } from '@inertiajs/react';
import axios from 'axios';
import {
    Criterion,
    Task,
    ParcialConfig,
    StudentGrade,
    MOCK_STUDENTS,
    DEFAULT_CRITERIA,
    PARCIALES
} from '../services/constants';
import {
    getLoadById,
    getLoadByParams,
    getGroupDefaultThemeKey
} from '../services/loadService';
import { COLOR_THEMES } from '../../ColorThemes';
import { SwalHelper } from '@/utils/SwalHelper';

function storageKey(grupo: string, materia: string, parcial: number) {
    return `studia:docente:${grupo}:${materia}:parcial${parcial}:config`;
}

function loadConfig(grupo: string, materia: string, parcial: number): ParcialConfig | null {
    try {
        const raw = localStorage.getItem(storageKey(grupo, materia, parcial));
        if (!raw) return null;
        return JSON.parse(raw) as ParcialConfig;
    } catch {
        return null;
    }
}

function saveConfig(grupo: string, materia: string, parcial: number, config: ParcialConfig) {
    localStorage.setItem(storageKey(grupo, materia, parcial), JSON.stringify(config));
}

export type Screen = 'parciales' | 'wizard' | 'grades';

export function useGroupClass() {
    const { classInfo } = usePage().props as any;

    // 1. Resolver grupo, materia e ID de carga académica
    const [loadId, setLoadId] = useState<string | null>(null);
    const [grupo, setGrupo] = useState('');
    const [materia, setMateria] = useState('');
    const [especialidad, setEspecialidad] = useState('');
    const [semestre, setSemestre] = useState('');
    const [themeKey, setThemeKey] = useState<string>('blue');
    const [showPaletteMenu, setShowPaletteMenu] = useState(false);
    const [students, setStudents] = useState<any[]>(() => {
        return classInfo?.alumnos || MOCK_STUDENTS;
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const queryId = params.get('id');

        if (classInfo) {
            setLoadId(classInfo.id);
            setGrupo(classInfo.nombre_grupo);
            setMateria(classInfo.nombre_materia);
            setEspecialidad(classInfo.especialidad);
            setSemestre(classInfo.semestre);
            if (classInfo.alumnos) {
                setStudents(classInfo.alumnos);
            }
            return;
        }

        if (!queryId) {
            router.visit('/docente');
            return;
        }
    }, [classInfo]);

    // 2. Control del tema visual (Sincronizado con el servidor)
    useEffect(() => {
        if (!loadId) return;

        // Intentar obtener de cache local primero para rapidez, pero el servidor manda
        const stored = localStorage.getItem(`studia:docente:${grupo}:${materia}:banner-color`);
        if (stored && COLOR_THEMES[stored]) {
            setThemeKey(stored);
        }

        // El color real viene de classInfo o getConfig (ya manejado en loadId useEffect)
    }, [loadId, grupo, materia]);

    function handleThemeChange(newKey: string) {
        setThemeKey(newKey);
        localStorage.setItem(`studia:docente:${grupo}:${materia}:banner-color`, newKey);
        setShowPaletteMenu(false);

        if (loadId) {
            axios.post(`/docente/clases/${loadId}/theme`, { color: newKey })
                .catch(err => console.error("Error al guardar tema:", err));
        }
    }

    // 3. Pantalla actual y parcial activo
    const [screen, setScreen] = useState<Screen>(() => {
        const params = new URLSearchParams(window.location.search);
        return (params.get('parcial') ? 'grades' : 'parciales') as Screen;
    });
    const [activeParcial, setActiveParcial] = useState<number | null>(() => {
        const params = new URLSearchParams(window.location.search);
        const p = params.get('parcial');
        return p ? parseInt(p) : null;
    });
    const [configs, setConfigs] = useState<Record<number, ParcialConfig>>({});
    const [allGrades, setAllGrades] = useState<Record<number, StudentGrade[]>>({});

    // 3.1 Sincronizar URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (!id) return;

        if (activeParcial) {
            params.set('parcial', activeParcial.toString());
        } else {
            params.delete('parcial');
        }

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, '', newUrl);
    }, [activeParcial, screen]);

    // Sincronizar configuraciones
    useEffect(() => {
        if (!loadId) return;

        setTasks([]);
        setStudentGrades([]);

        PARCIALES.forEach(({ num }) => {
            axios.get(`/docente/clases/${loadId}/config?parcial=${num}`)
                .then(res => {
                    const { configurado, criterios, alumnos, color_tema } = res.data;
                    const currentParams = new URLSearchParams(window.location.search);
                    const isCurrentInUrl = currentParams.get('parcial') === num.toString();

                    if (color_tema && COLOR_THEMES[color_tema]) {
                        setThemeKey(color_tema);
                    }

                    if (configurado) {
                        setConfigs(prev => ({
                            ...prev,
                            [num]: { configured: configurado, criteria: criterios }
                        }));
                        setAllGrades(prev => ({
                            ...prev,
                            [num]: alumnos
                        }));

                        if (isCurrentInUrl) {
                            setScreen('grades');
                            setStudentGrades(alumnos);

                            axios.get(`/docente/clases/${loadId}/tareas?parcial=${num}`)
                                .then(tRes => setTasks(tRes.data.tareas))
                                .catch(err => console.error("Error tareas:", err));
                        }
                    } else if (isCurrentInUrl) {
                        setScreen('wizard');
                        setWizardStep(1);
                        setDraftCriteria(DEFAULT_CRITERIA.map(c => ({ ...c })));
                    }
                })
                .catch(err => console.error("Error al cargar config de parcial:", num, err));
        });
    }, [loadId]);

    // 4. Asistente (Wizard) de Criterios
    const [wizardStep, setWizardStep] = useState(1);
    const [draftCriteria, setDraftCriteria] = useState<Criterion[]>(DEFAULT_CRITERIA.map(c => ({ ...c })));
    const [nextId, setNextId] = useState(10);

    const totalPct = draftCriteria.reduce((sum, c) => sum + (c.porcentaje || 0), 0);
    const hasSync = draftCriteria.some(c => c.sincronizar_tareas);
    const pctValid = totalPct === 100 &&
                     draftCriteria.length > 0 &&
                     draftCriteria.every(c => c.nombre.trim() !== '') &&
                     hasSync;

    function addCriterion() {
        setDraftCriteria(prev => [...prev, { id: nextId, nombre: 'Nuevo criterio', porcentaje: 0 }]);
        setNextId(n => n + 1);
    }

    function removeCriterion(id: number) {
        setDraftCriteria(prev => prev.filter(c => c.id !== id));
    }

    function updateCriterion(id: number, field: 'nombre' | 'porcentaje', value: string | number) {
        setDraftCriteria(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    }

    function toggleSyncTasks(id: number) {
        setDraftCriteria(prev => prev.map(c => ({
            ...c,
            sincronizar_tareas: c.id === id ? !c.sincronizar_tareas : false
        })));
    }

    function saveWizardConfig() {
        if (!pctValid) return;

        if (loadId && activeParcial) {
            SwalHelper.loading('Guardando configuración...', 'Estableciendo criterios de evaluación');
            axios.post(`/docente/clases/${loadId}/criterios`, {
                parcial: activeParcial,
                criterios: draftCriteria
            })
            .then(res => {
                const freshCriteria = res.data.criterios;
                setConfigs(prev => ({
                    ...prev,
                    [activeParcial!]: { configured: true, criteria: freshCriteria }
                }));

                axios.get(`/docente/clases/${loadId}/config?parcial=${activeParcial}`)
                    .then(r => {
                        setStudentGrades(r.data.alumnos);
                        SwalHelper.success('¡Configurado!', 'Los criterios han sido guardados correctamente.');
                    })
                    .catch(err => console.error("Error al refrescar notas:", err));

                setScreen('grades');
            })
            .catch(err => {
                console.error("Error al guardar criterios:", err);
                SwalHelper.error("Error", "Hubo un error al guardar la configuración.");
            });
        }
    }

    function resetConfig() {
        if (!activeParcial) return;

        // Validar si ya hay calificaciones o tareas evaluadas
        const hasGrades = studentGrades.some(s =>
            Object.values(s.calificaciones || {}).some(val => val !== null && val !== '' && val !== '—')
        );

        const hasTaskGrades = tasks.some(t =>
            Object.values(t.calificaciones || {}).some(val => val !== null && val !== '' && val !== '—')
        );

        if (hasGrades || hasTaskGrades) {
            SwalHelper.alert(
                'Acción bloqueada',
                'No puedes modificar los criterios porque ya existen calificaciones o tareas evaluadas en este parcial. Si necesitas cambiar algo, primero borra las calificaciones.',
                'warning'
            );
            return;
        }

        if (activeParcial === 2 && !isParcialClosed(1)) {
            SwalHelper.alert('Acción bloqueada', 'Primero debes concluir el Primer Parcial.', 'warning');
            return;
        }
        if (activeParcial === 3 && (!isParcialClosed(1) || !isParcialClosed(2))) {
            SwalHelper.alert('Acción bloqueada', 'Primero debes concluir los parciales anteriores.', 'warning');
            return;
        }

        const freshCriteria = configs[activeParcial]?.criteria?.length
            ? configs[activeParcial].criteria.map(c => ({ ...c }))
            : DEFAULT_CRITERIA.map(c => ({ ...c }));

        setDraftCriteria(freshCriteria);
        setWizardStep(1);
        setScreen('wizard');
    }

    function resetParcial(num: number) {
        SwalHelper.confirm(
            '¿Reiniciar Parcial?',
            'Se borrarán todos los criterios y calificaciones de este parcial.',
            'Sí, Reiniciar',
            'Cancelar',
            'warning'
        ).then((result) => {
            if (result.isConfirmed && loadId) {
                SwalHelper.loading('Reiniciando...', 'Limpiando datos');
                axios.post(`/docente/clases/${loadId}/criterios`, {
                    parcial: num,
                    criterios: []
                })
                .then(() => {
                    setConfigs(prev => {
                        const next = { ...prev };
                        delete next[num];
                        return next;
                    });
                    SwalHelper.success('¡Hecho!', 'El parcial ha sido reiniciado.');
                })
                .catch(err => {
                    console.error("Error al reiniciar parcial:", err);
                    SwalHelper.error('Error', 'No se pudo reiniciar el parcial.');
                });
            }
        });
    }

    // 5. Tareas y Pestaña Activa
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeTab, setActiveTab] = useState<'grades' | 'tasks' | 'activities'>('activities');
    const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);

    useEffect(() => {
        if (activeParcial && loadId) {
            axios.get(`/docente/clases/${loadId}/config?parcial=${activeParcial}`)
                .then(res => {
                    const { configured, criterios, alumnos } = res.data;
                    setConfigs(prev => ({
                        ...prev,
                        [activeParcial]: { configured, criteria: criterios }
                    }));
                    setStudentGrades(alumnos);
                })
                .catch(err => {
                    console.error("Error al cargar config:", err);
                });

            axios.get(`/docente/clases/${loadId}/tareas?parcial=${activeParcial}`)
                .then(res => {
                    setTasks(res.data.tareas);
                })
                .catch(err => {
                    console.error("Error al cargar tareas:", err);
                    setTasks([]);
                });
        }
    }, [activeParcial, loadId]);

    function saveTasks(newTasks: Task[]) {
        setTasks(newTasks);
        if (loadId && activeParcial) {
            axios.post(`/docente/clases/${loadId}/tareas`, {
                parcial: activeParcial,
                tareas: newTasks
            })
            .then(res => {
                setTasks(res.data.tareas);
            })
            .catch(err => {
                console.error("Error al guardar tareas:", err);
                SwalHelper.error('Error', 'No se pudieron sincronizar las actividades.');
            });
        }
    }

    function getStudentTasksAverage(studentId: number): string {
        if (!tasks || tasks.length === 0) return "0";
        let sumNormalized = 0;
        let count = 0;
        tasks.forEach(t => {
            const score = parseFloat(t.calificaciones[studentId] || '0');
            const maxPoints = t.puntos || 10;
            const normalized = (score / maxPoints) * 10;
            sumNormalized += normalized;
            count++;
        });
        if (count === 0) return "0";
        const avg = sumNormalized / count;
        return avg % 1 === 0 ? avg.toString() : avg.toFixed(1);
    }

    function openParcial(parcialNum: number) {
        if (parcialNum === 2 && !isParcialClosed(1)) {
            SwalHelper.alert('Acceso restringido', 'Primero debes concluir el Primer Parcial.', 'info');
            return;
        }
        if (parcialNum === 3 && (!isParcialClosed(1) || !isParcialClosed(2))) {
            SwalHelper.alert('Acceso restringido', 'Primero debes concluir los parciales anteriores.', 'info');
            return;
        }

        setActiveParcial(parcialNum);
        setActiveTab('grades');
        setSelectedTaskId(null);

        setTasks([]);
        setStudentGrades([]);

        const config = configs[parcialNum];
        if (config?.configured) {
            setScreen('grades');
            if (loadId) {
                axios.get(`/docente/clases/${loadId}/config?parcial=${parcialNum}`)
                    .then(res => setStudentGrades(res.data.alumnos));
                axios.get(`/docente/clases/${loadId}/tareas?parcial=${parcialNum}`)
                    .then(res => setTasks(res.data.tareas));
            }
        } else {
            setWizardStep(1);
            setDraftCriteria(DEFAULT_CRITERIA.map(c => ({ ...c })));
            setScreen('wizard');
        }
    }

    function setScore(studentId: number, criterionId: number, val: string) {
        setStudentGrades(prev => prev.map(s =>
            s.id === studentId ? { ...s, calificaciones: { ...s.calificaciones, [criterionId]: val } } : s
        ));
    }

    function handleAsentarCalificaciones() {
        if (loadId && activeParcial) {
            const activeCriteria = configs[activeParcial]?.criteria ?? [];
            const updatedGrades = studentGrades.map(s => {
                const calificaciones = { ...s.calificaciones };
                activeCriteria.forEach(c => {
                    if (c.sincronizar_tareas) {
                        calificaciones[c.id] = getStudentTasksAverage(s.id);
                    }
                });
                return { ...s, calificaciones };
            });

            SwalHelper.loading('Guardando...', 'Asentando calificaciones');
            axios.post(`/docente/clases/${loadId}/calificaciones`, {
                parcial: activeParcial,
                alumnos: updatedGrades
            })
            .then(() => {
                setAllGrades(prev => ({ ...prev, [activeParcial!]: updatedGrades }));
                setStudentGrades(updatedGrades);
                SwalHelper.success('¡Completado!', 'Calificaciones asentadas correctamente.');
            })
            .catch(err => {
                console.error("Error al asentar calificaciones:", err);
                SwalHelper.error('Error', 'No se pudieron guardar las calificaciones.');
            });
        }
    }

    // 6. Modales y Estado de Chat/Selección
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [chatInputText, setChatInputText] = useState('');
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);
    const [privateMessages, setPrivateMessages] = useState<Record<string, { sender: 'alumno' | 'docente', senderName: string, text: string, timestamp: string }[]>>({});

    useEffect(() => {
        if (studentGrades.length > 0 && selectedStudentId === null) {
            setSelectedStudentId(studentGrades[0].id);
        }
    }, [studentGrades]);

    function getParcialAverage(studentId: number, parcialNum: number): number | string {
        const cfg = configs[parcialNum];
        if (!cfg || !cfg.configured) return "—";

        let studentGradesList = allGrades[parcialNum] || [];
        if (activeParcial === parcialNum) {
            studentGradesList = studentGrades;
        }

        const sGrade = studentGradesList.find(sg => sg.id === studentId);
        if (!sGrade) return "—";

        const criteria = cfg.criteria || [];

        const filled = criteria.every(c => {
            if (c.sincronizar_tareas && activeParcial === parcialNum) {
                return getStudentTasksAverage(studentId) !== '';
            }
            const val = sGrade.calificaciones[c.id];
            return val !== undefined && val !== null && val !== '';
        });

        if (!filled) return "—";

        const avg = criteria.reduce((sum, c) => {
            let scoreVal = '0';
            if (c.sincronizar_tareas && activeParcial === parcialNum) {
                scoreVal = getStudentTasksAverage(studentId);
            } else {
                scoreVal = sGrade.calificaciones[c.id] || '0';
            }
            return sum + (parseFloat(scoreVal) * c.porcentaje / 100);
        }, 0);

        return parseFloat(avg.toFixed(1));
    }

    function isParcialClosed(parcialNum: number): boolean {
        const cfg = configs[parcialNum];
        if (!cfg || !cfg.configured) return false;

        return students.every(student => {
            const avg = getParcialAverage(student.id, parcialNum);
            return typeof avg === 'number';
        });
    }

    function getFinalAverage(studentId: number): number | string {
        let sum = 0;
        let count = 0;
        [1, 2, 3].forEach(num => {
            const avg = getParcialAverage(studentId, num);
            if (typeof avg === 'number') {
                sum += avg;
                count++;
            }
        });
        return count === 0 ? "—" : parseFloat((sum / count).toFixed(1));
    }

    return {
        loadId,
        grupo,
        materia,
        especialidad,
        semestre,
        themeKey,
        setThemeKey,
        showPaletteMenu,
        setShowPaletteMenu,
        handleThemeChange,
        screen,
        setScreen,
        activeParcial,
        setActiveParcial,
        configs,
        setConfigs,
        wizardStep,
        setWizardStep,
        draftCriteria,
        setDraftCriteria,
        tasks,
        setTasks,
        saveTasks,
        activeTab,
        setActiveTab,
        students,
        studentGrades,
        setStudentGrades,
        getStudentTasksAverage,
        openParcial,
        saveWizardConfig,
        resetConfig,
        updateCriterion,
        toggleSyncTasks,
        addCriterion,
        removeCriterion,
        resetParcial,
        setScore,
        handleAsentarCalificaciones,
        selectedTaskId,
        setSelectedTaskId,
        selectedStudentId,
        setSelectedStudentId,
        chatInputText,
        setChatInputText,
        isPdfModalOpen,
        setIsPdfModalOpen,
        isGradesModalOpen,
        setIsGradesModalOpen,
        privateMessages,
        setPrivateMessages,
        sendPrivateMessage: (msg: string) => {},
        getParcialAverage,
        getFinalAverage,
        isParcialClosed,
        totalPct,
        pctValid
    };
}
