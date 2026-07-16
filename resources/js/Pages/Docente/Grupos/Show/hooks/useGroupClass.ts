import { useState, useEffect } from 'react';
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
        return classInfo?.students || MOCK_STUDENTS;
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const queryId = params.get('id');

        if (classInfo) {
            setLoadId(classInfo.id);
            setGrupo(classInfo.groupName);
            setMateria(classInfo.subject);
            setEspecialidad(classInfo.major);
            setSemestre(classInfo.semester);
            if (classInfo.students) {
                setStudents(classInfo.students);
            }
            return;
        }

        // Si no hay classInfo y tampoco hay un ID en la URL, redirigir al dashboard
        if (!queryId) {
            router.visit('/docente/dashboard');
            return;
        }
    }, [classInfo]);

    // 2. Control del tema visual
    useEffect(() => {
        const stored = localStorage.getItem(`studia:docente:${grupo}:${materia}:banner-color`);
        if (stored && COLOR_THEMES[stored]) {
            setThemeKey(stored);
        } else {
            setThemeKey(getGroupDefaultThemeKey(grupo));
        }
    }, [grupo, materia]);

    function handleThemeChange(newKey: string) {
        setThemeKey(newKey);
        localStorage.setItem(`studia:docente:${grupo}:${materia}:banner-color`, newKey);
        setShowPaletteMenu(false);
    }

    // 3. Pantalla actual y parcial activo (Inicializado desde URL)
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

    // 3.1 Sincronizar URL cuando cambia el parcial o la pantalla
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

    // Sincronizar configuraciones al cambiar grupo/materia (Conectado a Supabase)
    useEffect(() => {
        if (!loadId) return; // Esperar a tener el loadId real

        const fresh: Record<number, ParcialConfig> = {};
        const freshGrades: Record<number, StudentGrade[]> = {};

        // Limpiar estados antes de cargar nuevos datos para evitar mezclas entre clases
        setTasks([]);
        setStudentGrades([]);

        PARCIALES.forEach(({ num }) => {
            // Limpiar localStorage (opcional, pero mejor confiar en la BD)
            const c = loadConfig(grupo, materia, num);
            if (c) fresh[num] = c;
        });

        setConfigs(fresh);

        // Consultas optimizadas a la base de datos
        PARCIALES.forEach(({ num }) => {
            axios.get(`/docente/clases/${loadId}/config?parcial=${num}`)
                .then(res => {
                    const { configured, criteria, grades } = res.data;
                    const currentParams = new URLSearchParams(window.location.search);
                    const isCurrentInUrl = currentParams.get('parcial') === num.toString();

                    if (configured) {
                        setConfigs(prev => ({
                            ...prev,
                            [num]: { configured, criteria }
                        }));
                        setAllGrades(prev => ({
                            ...prev,
                            [num]: grades
                        }));

                        // Si este es el parcial que estamos viendo, cargar sus datos activos
                        if (isCurrentInUrl) {
                            setScreen('grades');
                            setStudentGrades(grades);

                            // Cargar tareas específicas de este parcial
                            axios.get(`/docente/clases/${loadId}/tareas?parcial=${num}`)
                                .then(tRes => setTasks(tRes.data.tasks))
                                .catch(err => console.error("Error tareas:", err));
                        }
                    } else if (isCurrentInUrl) {
                        setScreen('wizard');
                        setWizardStep(1);
                        setDraftCriteria([]);
                    }
                })
                .catch(err => console.error("Error al cargar config de parcial:", num, err));
        });
    }, [loadId]); // Solo re-ejecutar si cambia la clase (loadId)

    // 4. Asistente (Wizard) de Criterios
    const [wizardStep, setWizardStep] = useState(1);
    const [draftCriteria, setDraftCriteria] = useState<Criterion[]>(DEFAULT_CRITERIA.map(c => ({ ...c })));
    const [nextId, setNextId] = useState(10);

    const totalPct = draftCriteria.reduce((sum, c) => sum + c.percentage, 0);
    const hasSync = draftCriteria.some(c => c.syncTasks);
    const pctValid = totalPct === 100 &&
                     draftCriteria.length > 0 &&
                     draftCriteria.every(c => c.name.trim() !== '') &&
                     hasSync;

    function addCriterion() {
        setDraftCriteria(prev => [...prev, { id: nextId, name: 'Nuevo criterio', percentage: 0 }]);
        setNextId(n => n + 1);
    }

    function removeCriterion(id: number) {
        setDraftCriteria(prev => prev.filter(c => c.id !== id));
    }

    function updateCriterion(id: number, field: 'name' | 'percentage', value: string | number) {
        setDraftCriteria(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    }

    function toggleSyncTasks(id: number) {
        setDraftCriteria(prev => prev.map(c => ({
            ...c,
            syncTasks: c.id === id ? !c.syncTasks : false // Solo uno a la vez
        })));
    }

    function saveWizardConfig() {
        if (!pctValid) return;
        const newConfig: ParcialConfig = {
            configured: true,
            criteria: draftCriteria
        };

        if (loadId && activeParcial) {
            SwalHelper.loading('Guardando configuración...', 'Estableciendo criterios de evaluación');
            axios.post(`/docente/clases/${loadId}/criterios`, {
                parcial: activeParcial,
                criteria: draftCriteria
            })
            .then(res => {
                const freshCriteria = res.data.criteria;
                setConfigs(prev => ({
                    ...prev,
                    [activeParcial!]: { configured: true, criteria: freshCriteria }
                }));
                // Recargar calificaciones correspondientes a los nuevos criterios
                axios.get(`/docente/clases/${loadId}/config?parcial=${activeParcial}`)
                    .then(r => {
                        setStudentGrades(r.data.grades);
                        SwalHelper.success('¡Configurado!', 'Los criterios han sido guardados correctamente.');
                    })
                    .catch(err => console.error("Error al refrescar notas:", err));

                setScreen('grades');
            })
            .catch(err => {
                console.error("Error al guardar criterios en Supabase:", err);
                SwalHelper.error("Error", "Hubo un error al guardar la configuración en la base de datos.");
            });
        } else {
            saveConfig(grupo, materia, activeParcial!, newConfig);
            setConfigs(prev => ({ ...prev, [activeParcial!]: newConfig }));
            SwalHelper.success('¡Hecho!', 'Configuración guardada localmente.');
            setScreen('grades');
        }
    }

    function resetConfig() {
        if (!activeParcial) return;
        if (activeParcial === 2 && !isParcialClosed(1)) {
            SwalHelper.alert('Acción bloqueada', 'No se puede reconfigurar el Segundo Parcial. Primero debes concluir y calificar el Primer Parcial.', 'warning');
            return;
        }
        if (activeParcial === 3 && (!isParcialClosed(1) || !isParcialClosed(2))) {
            SwalHelper.alert('Acción bloqueada', 'No se puede reconfigurar el Tercer Parcial. Primero debes concluir y calificar los parciales anteriores.', 'warning');
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
            'Se borrarán todos los criterios y calificaciones de este parcial. Esta acción no se puede deshacer.',
            'Sí, Reiniciar',
            'Cancelar',
            'warning'
        ).then((result) => {
            if (result.isConfirmed) {
                if (loadId) {
                    SwalHelper.loading('Reiniciando...', 'Limpiando datos del parcial');
                    axios.post(`/docente/clases/${loadId}/criterios`, {
                        parcial: num,
                        criteria: []
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
                        console.error("Error al reiniciar parcial en Supabase:", err);
                        SwalHelper.error('Error', 'No se pudo reiniciar el parcial.');
                    });
                } else {
                    localStorage.removeItem(storageKey(grupo, materia, num));
                    setConfigs(prev => {
                        const next = { ...prev };
                        delete next[num];
                        return next;
                    });
                    SwalHelper.success('¡Hecho!', 'El parcial ha sido reiniciado (Local).');
                }
            }
        });
    }

    // 5. Tareas y Pestaña Activa
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeTab, setActiveTab] = useState<'grades' | 'tasks' | 'activities'>('activities');
    const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);

    useEffect(() => {
        if (activeParcial) {
            if (loadId) {
                // Cargar criterios y calificaciones del parcial activo desde Supabase
                axios.get(`/docente/clases/${loadId}/config?parcial=${activeParcial}`)
                    .then(res => {
                        const { configured, criteria, grades } = res.data;
                        setConfigs(prev => ({
                            ...prev,
                            [activeParcial]: { configured, criteria }
                        }));
                        setStudentGrades(grades);
                    })
                    .catch(err => {
                        console.error("Error al cargar config desde Supabase:", err);
                        setStudentGrades(students.map(s => ({ ...s, scores: {} })));
                    });

                // Cargar tareas del parcial activo desde Supabase
                axios.get(`/docente/clases/${loadId}/tareas?parcial=${activeParcial}`)
                    .then(res => {
                        setTasks(res.data.tasks);
                    })
                    .catch(err => {
                        console.error("Error al cargar tareas desde Supabase:", err);
                        setTasks([]);
                    });
            } else {
                // Cargar calificaciones locales
                const storedGrades = localStorage.getItem(`studia:docente:${grupo}:${materia}:parcial${activeParcial}:grades`);
                if (storedGrades) {
                    setStudentGrades(JSON.parse(storedGrades) as StudentGrade[]);
                } else {
                    setStudentGrades(students.map(s => ({ ...s, scores: {} })));
                }

                // Cargar tareas locales
                const storedTasks = localStorage.getItem(`studia:docente:${grupo}:${materia}:parcial${activeParcial}:tasks`);
                if (storedTasks) {
                    setTasks(JSON.parse(storedTasks) as Task[]);
                } else {
                    setTasks([]);
                }
            }
        }
    }, [activeParcial, grupo, materia, students, loadId]);

    function saveTasks(newTasks: Task[]) {
        setTasks(newTasks);
        if (loadId && activeParcial) {
            axios.post(`/docente/clases/${loadId}/tareas`, {
                parcial: activeParcial,
                tasks: newTasks
            })
            .then(res => {
                setTasks(res.data.tasks);
                // No mostramos toast aquí para evitar spam en cada cambio de nota,
                // pero sí lo haremos al crear/editar una actividad completa
            })
            .catch(err => {
                console.error("Error al guardar tareas en Supabase:", err);
                SwalHelper.error('Error', 'No se pudieron sincronizar las actividades.');
            });
        } else {
            if (activeParcial) {
                localStorage.setItem(`studia:docente:${grupo}:${materia}:parcial${activeParcial}:tasks`, JSON.stringify(newTasks));
            }
        }
    }

    function getStudentTasksAverage(studentId: number): string {
        if (!tasks || tasks.length === 0) return "0";
        let sumNormalized = 0;
        let count = 0;
        tasks.forEach(t => {
            const score = parseFloat(t.grades[studentId] || '0');
            const maxPoints = t.points || 10;
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
            SwalHelper.alert('Acceso restringido', 'Primero debes concluir y calificar el Primer Parcial para acceder a este.', 'info');
            return;
        }
        if (parcialNum === 3 && (!isParcialClosed(1) || !isParcialClosed(2))) {
            SwalHelper.alert('Acceso restringido', 'Primero debes concluir y calificar los parciales anteriores para acceder a este.', 'info');
            return;
        }

        setActiveParcial(parcialNum);
        setActiveTab('grades');
        setSelectedTaskId(null);

        // Limpiar datos previos antes de cargar el nuevo parcial
        setTasks([]);
        setStudentGrades([]);

        const config = configs[parcialNum];
        if (config?.configured) {
            setScreen('grades');
            // Cargar datos reales del parcial seleccionado
            if (loadId) {
                axios.get(`/docente/clases/${loadId}/config?parcial=${parcialNum}`)
                    .then(res => setStudentGrades(res.data.grades));
                axios.get(`/docente/clases/${loadId}/tareas?parcial=${parcialNum}`)
                    .then(res => setTasks(res.data.tasks));
            }
        } else {
            setWizardStep(1);
            setDraftCriteria([]);
            setScreen('wizard');
        }
    }

    function setScore(studentId: number, criterionId: number, val: string) {
        setStudentGrades(prev => prev.map(s =>
            s.id === studentId ? { ...s, scores: { ...s.scores, [criterionId]: val } } : s
        ));
    }

    function handleAsentarCalificaciones() {
        const activeCriteria = activeParcial ? configs[activeParcial]?.criteria ?? [] : [];
        const updatedGrades = studentGrades.map(s => {
            const scores = { ...s.scores };
            activeCriteria.forEach(c => {
                if (c.syncTasks) {
                    scores[c.id] = getStudentTasksAverage(s.id);
                }
            });
            return { ...s, scores };
        });
        setStudentGrades(updatedGrades);

        if (loadId && activeParcial) {
            SwalHelper.loading('Guardando...', 'Asentando calificaciones en el servidor');
            axios.post(`/docente/clases/${loadId}/calificaciones`, {
                parcial: activeParcial,
                grades: updatedGrades
            })
            .then(() => {
                setAllGrades(prev => ({ ...prev, [activeParcial!]: updatedGrades }));
                SwalHelper.success('¡Completado!', 'Las calificaciones han sido asentadas correctamente.');
            })
            .catch(err => {
                console.error("Error al guardar calificaciones en Supabase:", err);
                SwalHelper.error('Error', 'No se pudieron guardar las calificaciones.');
            });
        } else {
            if (activeParcial) {
                localStorage.setItem(`studia:docente:${grupo}:${materia}:parcial${activeParcial}:grades`, JSON.stringify(updatedGrades));
                setAllGrades(prev => ({ ...prev, [activeParcial!]: updatedGrades }));
            }
            SwalHelper.success('¡Hecho!', 'Calificaciones asentadas (Almacenamiento Local).');
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

    // Inicializar mensajes privados
    useEffect(() => {
        const defaultMessages: Record<string, { sender: 'alumno' | 'docente', senderName: string, text: string, timestamp: string }[]> = {};
        studentGrades.forEach(student => {
            defaultMessages[`1:${student.id}`] = [
                {
                    sender: 'alumno',
                    senderName: student.name,
                    text: 'Profesor, disculpe la tardanza, ya adjunté mi mapa conceptual de monomios.',
                    timestamp: 'Ayer, 08:32 PM'
                },
                {
                    sender: 'docente',
                    senderName: 'Mtro. Francisco Javier Hernández',
                    text: 'Hola. Enterado, procederé a evaluar tu trabajo en el transcurso del día.',
                    timestamp: 'Hoy, 09:15 AM'
                }
            ];
            defaultMessages[`2:${student.id}`] = [
                {
                    sender: 'alumno',
                    senderName: student.name,
                    text: 'Profe, no pude resolver el ejercicio 12, ¿me podría orientar?',
                    timestamp: 'Ayer, 04:15 PM'
                }
            ];
        });
        setPrivateMessages(defaultMessages);
    }, [studentGrades]);

    function sendPrivateMessage(key: string) {
        if (!chatInputText.trim()) return;
        const newMsg = {
            sender: 'docente' as const,
            senderName: 'Mtro. Francisco Javier Hernández',
            text: chatInputText.trim(),
            timestamp: 'Hace un momento'
        };
        setPrivateMessages(prev => ({
            ...prev,
            [key]: [...(prev[key] || []), newMsg]
        }));
        setChatInputText('');
    }

    function getParcialAverage(studentId: number, parcialNum: number): number | string {
        const cfg = configs[parcialNum];
        if (!cfg || !cfg.configured) return "—";

        // Usar las notas del estado local para mayor reactividad
        let studentGradesList = allGrades[parcialNum] || [];

        // Si estamos en el parcial activo, priorizar studentGrades (cambios actuales)
        if (activeParcial === parcialNum) {
            studentGradesList = studentGrades;
        }

        const sGrade = studentGradesList.find(sg => sg.id === studentId);
        if (!sGrade) return "—";

        const criteria = cfg.criteria || [];

        // Verificar si todos los criterios tienen nota
        const filled = criteria.every(c => {
            if (c.syncTasks && activeParcial === parcialNum) {
                // Si es el activo y es de plataforma, calculamos el promedio dinámico
                return getStudentTasksAverage(studentId) !== '';
            }
            // Para el resto, usamos el valor ya guardado o capturado en scores
            const val = sGrade.scores[c.id];
            return val !== undefined && val !== null && val !== '';
        });

        if (!filled) return "—";

        const avg = criteria.reduce((sum, c) => {
            let scoreVal = '0';
            if (c.syncTasks && activeParcial === parcialNum) {
                scoreVal = getStudentTasksAverage(studentId);
            } else {
                scoreVal = sGrade.scores[c.id] || '0';
            }
            return sum + (parseFloat(scoreVal) * c.percentage / 100);
        }, 0);

        return parseFloat(avg.toFixed(1));
    }

    function isParcialClosed(parcialNum: number): boolean {
        const cfg = configs[parcialNum] || loadConfig(grupo, materia, parcialNum);
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
        sendPrivateMessage,
        getParcialAverage,
        getFinalAverage,
        isParcialClosed,
        totalPct,
        pctValid
    };
}
