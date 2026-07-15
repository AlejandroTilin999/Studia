import { useState, useEffect } from 'react';
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
    // 1. Resolver grupo, materia e ID de carga académica
    const [loadId, setLoadId] = useState<string | null>(null);
    const [grupo, setGrupo] = useState('1-A');
    const [materia, setMateria] = useState('Matemáticas I');
    const [themeKey, setThemeKey] = useState<string>('blue');
    const [showPaletteMenu, setShowPaletteMenu] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const queryId = params.get('id');
        const queryGrupo = params.get('grupo');
        const queryMateria = params.get('materia');

        if (queryId) {
            const load = getLoadById(queryId);
            if (load) {
                setLoadId(load.id);
                setGrupo(load.groupName);
                setMateria(load.subject);
                // Si accedió con los IDs antiguos '1' o '2', forzamos a reescribir la URL al nuevo Hash
                if (queryId === '1' || queryId === '2') {
                    window.history.replaceState(null, '', `/docente/grupos/show?id=${load.id}`);
                }
            } else {
                setLoadId(queryId);
            }
        } else if (queryGrupo && queryMateria) {
            setGrupo(queryGrupo);
            setMateria(queryMateria);
            const load = getLoadByParams(queryGrupo, queryMateria);
            if (load) {
                setLoadId(load.id);
                // Actualizar la URL de forma transparente sin recargar la página
                window.history.replaceState(null, '', `/docente/grupos/show?id=${load.id}`);
            }
        }
    }, []);

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

    // 3. Pantalla actual y parcial activo
    const [screen, setScreen] = useState<Screen>('parciales');
    const [activeParcial, setActiveParcial] = useState<number | null>(null);
    const [configs, setConfigs] = useState<Record<number, ParcialConfig>>({});

    // Sincronizar configuraciones al cambiar grupo/materia
    useEffect(() => {
        const fresh: Record<number, ParcialConfig> = {};
        PARCIALES.forEach(({ num }) => {
            const c = loadConfig(grupo, materia, num);
            if (c) fresh[num] = c;
        });
        setConfigs(fresh);
    }, [grupo, materia]);

    // 4. Asistente (Wizard) de Criterios
    const [wizardStep, setWizardStep] = useState(1);
    const [draftCriteria, setDraftCriteria] = useState<Criterion[]>(DEFAULT_CRITERIA.map(c => ({ ...c })));
    const [nextId, setNextId] = useState(10);

    const totalPct = draftCriteria.reduce((sum, c) => sum + c.percentage, 0);
    const pctValid = totalPct === 100;

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
        saveConfig(grupo, materia, activeParcial!, newConfig);
        setConfigs(prev => ({ ...prev, [activeParcial!]: newConfig }));
        setScreen('grades');
    }

    function resetConfig() {
        if (!activeParcial) return;
        const freshCriteria = configs[activeParcial]?.criteria?.length
            ? configs[activeParcial].criteria.map(c => ({ ...c }))
            : DEFAULT_CRITERIA.map(c => ({ ...c }));

        setDraftCriteria(freshCriteria);
        setWizardStep(1);
        setScreen('wizard');
    }

    function resetParcial(num: number) {
        localStorage.removeItem(storageKey(grupo, materia, num));
        setConfigs(prev => {
            const next = { ...prev };
            delete next[num];
            return next;
        });
    }

    // 5. Tareas y Pestaña Activa
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeTab, setActiveTab] = useState<'grades' | 'tasks' | 'activities'>('activities');
    const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);

    useEffect(() => {
        if (activeParcial) {
            // Cargar calificaciones
            const storedGrades = localStorage.getItem(`studia:docente:${grupo}:${materia}:parcial${activeParcial}:grades`);
            if (storedGrades) {
                setStudentGrades(JSON.parse(storedGrades) as StudentGrade[]);
            } else {
                setStudentGrades(MOCK_STUDENTS.map(s => ({ ...s, scores: {} })));
            }

            // Cargar tareas
            const storedTasks = localStorage.getItem(`studia:docente:${grupo}:${materia}:parcial${activeParcial}:tasks`);
            if (storedTasks) {
                setTasks(JSON.parse(storedTasks) as Task[]);
            } else {
                const defaultTasks: Task[] = [
                    {
                        id: 1,
                        name: "Actividad 1: Conceptos Básicos",
                        description: "Lee el capítulo 1 del libro de álgebra y elabora un mapa conceptual con los conceptos principales de polinomios, monomios y grados.",
                        deadline: "2026-07-20",
                        points: 10,
                        grades: { 1: "9", 2: "8", 3: "10", 4: "7", 5: "9" }
                    },
                    {
                        id: 2,
                        name: "Actividad 2: Práctica del Libro",
                        description: "Resuelve los ejercicios del 1 al 15 de la página 45. Entrega el archivo en formato PDF con los procedimientos detallados de cada ejercicio.",
                        deadline: "2026-07-24",
                        points: 10,
                        grades: { 1: "8", 2: "9", 3: "9", 4: "8", 5: "10" }
                    }
                ];
                setTasks(defaultTasks);
                localStorage.setItem(`studia:docente:${grupo}:${materia}:parcial${activeParcial}:tasks`, JSON.stringify(defaultTasks));
            }
        }
    }, [activeParcial, grupo, materia]);

    function saveTasks(newTasks: Task[]) {
        setTasks(newTasks);
        if (activeParcial) {
            localStorage.setItem(`studia:docente:${grupo}:${materia}:parcial${activeParcial}:tasks`, JSON.stringify(newTasks));
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
        setActiveParcial(parcialNum);
        setActiveTab('grades');
        setSelectedTaskId(null);
        const config = configs[parcialNum];
        if (config?.configured) {
            setScreen('grades');
        } else {
            setWizardStep(1);
            setDraftCriteria(DEFAULT_CRITERIA.map(c => ({ ...c })));
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
        if (activeParcial) {
            localStorage.setItem(`studia:docente:${grupo}:${materia}:parcial${activeParcial}:grades`, JSON.stringify(updatedGrades));
        }
        alert('¡Calificaciones del parcial asentadas correctamente!');
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
        const cfg = configs[parcialNum] || loadConfig(grupo, materia, parcialNum);
        if (!cfg || !cfg.configured) return "—";

        const stored = localStorage.getItem(`studia:docente:${grupo}:${materia}:parcial${parcialNum}:grades`);
        let studentGradesList: StudentGrade[] = [];
        if (stored) {
            studentGradesList = JSON.parse(stored);
        } else {
            studentGradesList = MOCK_STUDENTS.map(s => ({ ...s, scores: {} }));
        }

        const sGrade = studentGradesList.find(sg => sg.id === studentId);
        if (!sGrade) return "—";

        const storedTasks = localStorage.getItem(`studia:docente:${grupo}:${materia}:parcial${parcialNum}:tasks`);
        const pTasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];

        function getTasksAvg(sId: number): number {
            if (!pTasks || pTasks.length === 0) return 0;
            let sumNormalized = 0;
            let count = 0;
            pTasks.forEach(t => {
                const scoreStr = t.grades[sId];
                if (scoreStr !== undefined && scoreStr !== '') {
                    const score = parseFloat(scoreStr);
                    const maxPoints = t.points || 10;
                    sumNormalized += (score / maxPoints) * 10;
                    count++;
                }
            });
            return count === 0 ? 0 : sumNormalized / count;
        }

        const criteria = cfg.criteria || [];
        const filled = criteria.every(c => {
            const val = c.syncTasks ? getTasksAvg(studentId).toString() : (sGrade.scores[c.id] ?? '');
            return val !== '';
        });
        if (!filled) return "—";

        const avg = criteria.reduce((sum, c) => {
            const val = c.syncTasks ? getTasksAvg(studentId).toString() : (sGrade.scores[c.id] || '0');
            return sum + (parseFloat(val) * c.percentage / 100);
        }, 0);

        return parseFloat(avg.toFixed(1));
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
        totalPct,
        pctValid
    };
}
