// Rango lógico para alumnos de preparatoria en el año 2026 (edades entre 13 y 26 años aprox)
export const YEARS = Array.from({ length: 2014 - 2000 }, (_, i) => (2013 - i).toString());

export const MONTHS = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
];

export const GENERAL_AREAS = [
    'Matemáticas',
    'Ciencias Experimentales',
    'Ciencias Sociales',
    'Comunicación',
    'Humanidades',
    'Desarrollo Humano',
];
