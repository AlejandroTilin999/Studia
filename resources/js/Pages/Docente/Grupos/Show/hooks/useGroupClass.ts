import React, { useState, useEffect, useMemo, useRef } from 'react';
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

export function useGroupClass(classInfoProp?: any) {
    const { classInfo: pageClassInfo } = usePage().props as any;
    const classInfo = classInfoProp || pageClassInfo;

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
            // @ts-ignore
            axios.post(route('docente.clases.update_theme', { uuid: loadId }), { color: newKey })
                .then(() => {
                    SwalHelper.toast('Apariencia de la clase actualizada', 'success');
                })
                .catch(err => {
                    console.error("Error al guardar tema:", err);
                    SwalHelper.error('Error', 'No se pudo sincronizar el nuevo color.');
                });
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
    const [allTasks, setAllTasks] = useState<Record<number, Task[]>>({});
    const [lockInfos, setLockInfos] = useState<Record<number, { allowed: boolean, reason: string }>>({});
    const [configLockInfos, setConfigLockInfos] = useState<Record<number, { allowed: boolean, reason: string }>>({});
    const [refreshCounter, setRefreshCounter] = useState(Date.now());
    const [isSaving, setIsSaving] = useState(false); // [NUEVO] Feedback de guardado
    const burstTimerRef = useRef<any>(null);

    // [ARQUITECTURA ATÓMICA v5.0] Sincronizar estado local con props de Inertia
    useEffect(() => {
        if (!classInfo || !classInfo.parciales) return;

        // [PROTECCIÓN ULTRA-AGRESIVA]
        // Si el usuario tiene el foco en CUALQUIER lugar de la página,
        // posponemos la sincronización de datos de notas para no borrar su progreso.
        const isUserActive = document.activeElement && (
            document.activeElement.tagName === 'INPUT' ||
            document.activeElement.tagName === 'TEXTAREA' ||
            document.activeElement.getAttribute('contenteditable') === 'true'
        );

        if (isUserActive) {
            console.log('%c[Atomic-Sync] ✋ Sincronización pospuesta (Usuario capturando).', 'color: #f59e0b; font-weight: bold;');
            return;
        }

        console.log('%c[Atomic-Sync] 🧩 Unificando verdad total desde props...', 'color: #10b981; font-weight: bold;');

        const newLockInfos: Record<number, any> = {};
        const newConfigLockInfos: Record<number, any> = {};
        const newConfigs: Record<number, any> = {};
        const newAllGrades: Record<number, any> = {};
        const newAllTasks: Record<number, any> = {};

        [1, 2, 3].forEach(num => {
            const pData = classInfo.parciales[num];
            if (pData) {
                newLockInfos[num] = pData.lock_info;
                newConfigLockInfos[num] = pData.lock_config;
                newConfigs[num] = pData.config;
                newAllGrades[num] = pData.students;
                newAllTasks[num] = pData.tasks;
            }
        });

        setLockInfos(newLockInfos);
        setConfigLockInfos(newConfigLockInfos);
        setConfigs(newConfigs);
        setAllGrades(newAllGrades);
        setAllTasks(newAllTasks);

        if (classInfo.alumnos) {
            setStudents(classInfo.alumnos);
        }

        if (classInfo.color_tema && COLOR_THEMES[classInfo.color_tema]) {
            setThemeKey(classInfo.color_tema);
        }

        // Sincronizar vista actual si hay un parcial en la URL
        const params = new URLSearchParams(window.location.search);
        const pNum = params.get('parcial');
        if (pNum) {
            const num = parseInt(pNum);
            const pData = classInfo.parciales[num];
            if (pData) {
                setStudentGrades(pData.students);
                setTasks(pData.tasks);
                if (pData.config?.configured) setScreen('grades');
            }
        }
    }, [classInfo]);

    // Función maestra de refresco (ThunderSync V7 - Atómica)
    const refreshClassData = (isBurst = false) => {
        if (!loadId) return;

        // [ESTABILIDAD] No refrescar props si el usuario está interactuando con un input
        const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '');
        if (isInputActive && isBurst) {
            console.log('[RT] ✋ Refresco omitido por actividad de usuario.');
            return;
        }

        console.log(`%c[RT] 🔄 Recargando props de Inertia...`, 'color: #0266E0; font-weight: bold;');

        // La magia ocurre aquí: al recargar classInfo, el useEffect de arriba se dispara
        router.reload({
            only: ['classInfo'],
            onSuccess: () => console.log('[RT] ✅ Props sincronizadas.')
        });
    };

    // Lanzador de ráfaga
    const startBurstRefresh = () => {
        if (burstTimerRef.current) clearInterval(burstTimerRef.current);

        console.log('%c[ThunderSync] ⚡ Sincronización ráfaga activa...', 'background: #0266E0; color: #fff; padding: 4px 10px; border-radius: 20px;');

        const delays = [0, 800, 2000]; // Ráfaga reducida gracias a la optimización del backend

        delays.forEach((delay, index) => {
            setTimeout(() => {
                refreshClassData(true);
                if (index === delays.length - 1) setRefreshCounter(Date.now());
            }, delay);
        });
    };

    // Sincronizar configuraciones iniciales y por cambio de ID
    useEffect(() => {
        if (loadId) refreshClassData();
    }, [loadId, refreshCounter]);

    // 3.2 Escuchar ráfagas de señales en tiempo real
    useEffect(() => {
        const cicloId = classInfo?.ciclo_id;
        if (!cicloId) return;

        const targetId = Number(cicloId);

        const handleSignal = (data: any) => {
            if (!data) return;
            if (data.type === 'cycle-update' || data.msg?.includes('FORCE_REFRESH')) {
                if (Number(data.id) === targetId) {
                    startBurstRefresh();
                }
            }
        };

        const bc = new BroadcastChannel('school-cycle-channel');
        bc.onmessage = (e) => handleSignal(e.data);

        const onStorage = (e: StorageEvent) => {
            const keys = ['studia_v4_signal', 'studia_rt_signal', 'studia_rt_update'];
            if (keys.includes(e.key!) && e.newValue) {
                try { handleSignal(JSON.parse(e.newValue)); } catch(err) {}
            }
        };
        window.addEventListener('storage', onStorage);

        return () => {
            bc.close();
            window.removeEventListener('storage', onStorage);
        };
    }, [classInfo?.ciclo_id, loadId]);

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
                SwalHelper.success('¡Configurado!', 'Los criterios han sido guardados correctamente.');
                refreshClassData(); // [OPTIMIZACIÓN] Recargar la Verdad Total
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

    // [SINCRONIZACIÓN v4.6] Sincronizar vista local con la Verdad Total en memoria
    useEffect(() => {
        if (activeParcial) {
            setStudentGrades(allGrades[activeParcial] || []);
            setTasks(allTasks[activeParcial] || []);
        }
    }, [activeParcial, allGrades, allTasks]);

    function saveTasks(newTasks: Task[]) {
        setTasks(newTasks);
        if (loadId && activeParcial) {
            setIsSaving(true);
            axios.post(`/docente/clases/${loadId}/tareas`, {
                parcial: activeParcial,
                tareas: newTasks
            })
            .then(res => {
                // Actualizar verdad total
                const updatedTasks = res.data.tareas;
                setAllTasks(prev => ({ ...prev, [activeParcial]: updatedTasks }));
                setTasks(updatedTasks);
            })
            .catch(err => {
                console.error("Error al guardar tareas:", err);
                SwalHelper.error('Error', 'No se pudieron sincronizar las actividades.');
            })
            .finally(() => setIsSaving(false));
        }
    }

    // [LÓGICA v5.2] Redondeo oficial: .6 sube, .5 baja
    const formatIntGrade = React.useCallback((val: number | string): string => {
        if (val === null || val === '—' || val === '') return '—';
        const num = parseFloat(val.toString());
        if (isNaN(num)) return '—';
        // .6 sube, .5 baja: floor(n + 0.4)
        return Math.floor(num + 0.4).toString();
    }, []);

    const getStudentTasksAverage = React.useCallback((studentId: number): string => {
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
        return formatIntGrade(avg);
    }, [tasks, formatIntGrade]);

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

        const config = configs[parcialNum];
        if (config?.configured) {
            setScreen('grades');
            // Los datos ya están en el estado global (allGrades/allTasks)
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
                SwalHelper.success('¡Completado!', 'Calificaciones asentadas correctamente.');
                refreshClassData(); // [OPTIMIZACIÓN] Recargar la Verdad Total de golpe
            })
            .catch(err => {
                console.error("Error al asentar calificaciones:", err);
                SwalHelper.error('Error', 'No se pudieron guardar las calificaciones.');
            });
        }
    }

    function returnTaskGrade(taskId: number, studentId: number, score: string) {
        if (!loadId) return;

        setIsSaving(true);
        return axios.post(`/docente/clases/${loadId}/return-grade`, {
            tarea_id: taskId,
            usuario_id: studentId,
            calificacion: score
        })
        .then(res => {
            refreshClassData();
            return res.data;
        })
        .catch(err => {
            console.error("Error al devolver calificación:", err);
            SwalHelper.error('Error', 'No se pudo procesar el envío.');
            throw err;
        })
        .finally(() => setIsSaving(false));
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

    const getParcialAverage = React.useCallback((studentId: number, parcialNum: number): number | string => {
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
                return getStudentTasksAverage(studentId) !== '—';
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

        return formatIntGrade(avg);
    }, [configs, allGrades, activeParcial, studentGrades, getStudentTasksAverage, formatIntGrade]);

    const isParcialClosed = React.useCallback((parcialNum: number): boolean => {
        const cfg = configs[parcialNum];
        if (!cfg || !cfg.configured) return false;

        return students.every(student => {
            const avg = getParcialAverage(student.id, parcialNum);
            return avg !== "—";
        });
    }, [configs, students, getParcialAverage]);

    const getFinalAverage = React.useCallback((studentId: number): number | string => {
        let sum = 0;
        let count = 0;
        [1, 2, 3].forEach(num => {
            const avg = getParcialAverage(studentId, num);
            if (avg !== "—") {
                sum += parseFloat(avg.toString());
                count++;
            }
        });
        return count === 0 ? "—" : formatIntGrade(sum / count);
    }, [getParcialAverage, formatIntGrade]);

    const isReadOnly = useMemo(() => {
        if (!activeParcial) return false;
        return lockInfos[activeParcial]?.allowed === false;
    }, [activeParcial, lockInfos]);

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
        returnTaskGrade,
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
        pctValid,
        isReadOnly,
        isSaving,
        lockReason: activeParcial ? lockInfos[activeParcial]?.reason : '',
        lockInfos,
        configLockInfos
    };
}
