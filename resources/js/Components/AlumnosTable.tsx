import React from 'react';

interface Alumno {
    id: number;
    matricula: string;
    nombre: string;
    grado_grupo: string;
}

interface AlumnosTableProps {
    alumnos?: Alumno[];
}

export default function AlumnosTable({ alumnos = [] }: AlumnosTableProps) {
    
    // Verificación de seguridad: si no hay datos, muestra mensaje
    if (!alumnos || alumnos.length === 0) {
        return <p className="text-gray-500 italic">No hay alumnos registrados en la base de datos.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="py-2 px-4 border-b">Matrícula</th>
                        <th className="py-2 px-4 border-b">Nombre</th>
                        <th className="py-2 px-4 border-b">Grado y grupo</th>
                        <th className="py-2 px-4 border-b">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {alumnos.map((alumno) => (
                        <tr key={alumno.id} className="hover:bg-gray-50 border-b">
                            <td className="py-2 px-4">{alumno.matricula}</td>
                            <td className="py-2 px-4">{alumno.nombre}</td>
                            <td className="py-2 px-4">{alumno.grado_grupo}</td>
                            <td className="py-2 px-4">
                                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Editar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}