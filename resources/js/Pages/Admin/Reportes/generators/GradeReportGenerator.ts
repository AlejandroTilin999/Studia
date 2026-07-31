interface GradeReportData {
    student: {
        nombre: string;
        matricula: string;
    };
    academic: {
        grupo: string;
        especialidad: string;
        ciclo: string;
    };
    grades: any[];
    gpa: string | number;
    issued_at: {
        full: string;
    };
}

export const generateGradeReportHTML = (data: GradeReportData): string => {
    const { student, academic, grades, gpa, issued_at } = data;
    const logoUrl = "/assets/phid_logo.webp";

    // Función auxiliar para quitar decimales
    const formatInt = (val: any) => {
        if (val === '—' || val === null || val === undefined) return '—';
        return Math.floor(Number(val));
    };

    return `
        <html>
        <head>
            <title>Boleta de Calificaciones - ${student.matricula}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                * { box-sizing: border-box; }

                body {
                    font-family: 'Inter', sans-serif;
                    padding: 40px 60px;
                    color: #000000;
                    background: white;
                    font-size: 14px;
                    margin: 0;
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                }
                .logo { height: 65px; width: auto; }
                .institution-info { text-align: right; }
                .institution-name {
                    font-weight: 900;
                    font-size: 17px;
                    color: #0266E0;
                    margin: 0;
                    text-transform: uppercase;
                    white-space: nowrap;
                    letter-spacing: -0.01em;
                }
                .report-date {
                    font-size: 11px;
                    color: #64748b;
                    margin-top: 5px;
                    font-weight: 400;
                }

                .title-section {
                    margin-bottom: 35px;
                    text-align: center;
                }
                .main-title {
                    font-size: 26px;
                    font-weight: 900;
                    color: #0f172a;
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: -0.02em;
                }
                .sub-title {
                    font-size: 11px;
                    color: #475569;
                    font-weight: 900;
                    margin-top: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                .meta-info {
                    width: 100%;
                    margin-bottom: 40px;
                    background-color: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1fr;
                    padding: 22px;
                    box-sizing: border-box;
                }
                .meta-item { display: flex; flex-direction: column; min-width: 0; }
                .meta-label {
                    font-size: 10px;
                    font-weight: 900;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 6px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .meta-value {
                    font-size: 14px;
                    font-weight: 400;
                    color: #000000;
                    text-transform: uppercase;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
                th {
                    color: #000000;
                    font-size: 10px;
                    font-weight: 400;
                    text-transform: uppercase;
                    text-align: center;
                    padding: 15px 10px;
                    border-bottom: 1px solid #e2e8f0;
                }
                th.col-subject { text-align: left; width: 40%; }

                td {
                    padding: 14px 10px;
                    font-size: 14px;
                    border-bottom: 1px solid #f1f5f9;
                    color: #000000;
                    text-align: center;
                    font-weight: 400;
                }
                td.col-subject {
                    text-align: left;
                    font-weight: 400;
                    color: #000000;
                    text-transform: uppercase;
                }
                td.col-result {
                    font-size: 11px;
                }

                .gpa-row td { border-bottom: none; padding-top: 20px; }
                .gpa-label {
                    text-align: right;
                    padding-right: 30px;
                    font-weight: 400;
                    text-transform: uppercase;
                    color: #000000;
                    font-size: 11px;
                }
                .gpa-value {
                    font-weight: 400;
                    color: #000000;
                    font-size: 16px;
                    text-align: center;
                }

                .footer {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 140px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 100px;
                    padding: 0 100px 40px 100px;
                    align-items: flex-end;
                    background: white;
                }
                .sig-box {
                    border-top: 0.3px solid #000000;
                    text-align: center;
                    padding-top: 12px;
                }
                .sig-name {
                    font-size: 13px;
                    font-weight: 700;
                    color: #0f172a;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }
                .sig-title {
                    font-size: 10px;
                    font-weight: 400;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                @media print {
                    body { padding: 0; }
                    @page { size: letter portrait; margin: 1.5cm; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="${logoUrl}" class="logo" />
                <div class="institution-info">
                    <p class="institution-name">Preparatoria Particular Hidalgo</p>
                    <p class="report-date">Expedida el ${issued_at.full}</p>
                </div>
            </div>

            <div class="title-section">
                <h1 class="main-title">Boleta de Calificaciones</h1>
                <p class="sub-title">SISTEMA DE CONTROL ESCOLAR PREPAHID | Registro Oficial de Aprovechamiento</p>
            </div>

            <div class="meta-info">
                <div class="meta-item">
                    <span class="meta-label">Alumno</span>
                    <span class="meta-value">${student.nombre}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Matrícula</span>
                    <span class="meta-value">${student.matricula}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Grupo</span>
                    <span class="meta-value">${academic.grupo}</span>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th class="col-subject">Asignatura</th>
                        <th>1° Parcial</th>
                        <th>2° Parcial</th>
                        <th>3° Parcial</th>
                        <th>Final</th>
                        <th>Resultado</th>
                    </tr>
                </thead>
                <tbody>
                    ${grades.map((item: any) => `
                        <tr>
                            <td class="col-subject">${item.subject}</td>
                            <td>${formatInt(item.details[1].average)}</td>
                            <td>${formatInt(item.details[2].average)}</td>
                            <td>${formatInt(item.details[3].average)}</td>
                            <td>${formatInt(item.score)}</td>
                            <td class="col-result">
                                ${item.approved === 'Sí' ? 'APROBADA' : item.approved === 'No' ? 'REPROBADA' : 'PENDIENTE'}
                            </td>
                        </tr>
                    `).join('')}
                    <tr class="gpa-row">
                        <td colspan="4" class="gpa-label">Promedio General del Ciclo</td>
                        <td class="gpa-value">${formatInt(gpa)}</td>
                        <td></td>
                    </tr>
                </tbody>
            </table>

            <div class="footer">
                <div class="sig-box">
                    <div class="sig-name">Firma del Docente Tutor</div>
                    <div class="sig-title">Control de Grupo Escolar</div>
                </div>
                <div class="sig-box">
                    <div class="sig-name">Sello y Firma de Dirección</div>
                    <div class="sig-title">Validación de Servicios Escolares</div>
                </div>
            </div>
        </body>
        </html>
    `;
};
