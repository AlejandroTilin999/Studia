interface AttendanceData {
    group: {
        nombre: string;
        codigo: string;
        especialidad: string;
        turno: string;
        tutor: string;
    };
    period: {
        nombre: string;
    };
    enrollments: any[];
    generated_at: string;
}

export const generateAttendanceHTML = (data: AttendanceData): string => {
    const { group, period, enrollments, generated_at } = data;
    const logoUrl = "/assets/phid_logo.png";

    return `
        <html>
        <head>
            <title>Lista de Asistencia - ${group.nombre}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                * { box-sizing: border-box; }
                body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: white; font-size: 15px; }

                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: none; padding-bottom: 20px; margin-bottom: 25px; }
                .logo { height: 60px; }
                .institution-info { text-align: right; }
                .institution-name { font-weight: 900; font-size: 16px; color: #0266E0; margin: 0; text-transform: uppercase; white-space: nowrap; }
                .report-date { font-size: 12px; color: #64748b; margin-top: 4px; }

                .title-section { margin-bottom: 20px; }
                .main-title { font-size: 28px; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: -0.02em; }
                .sub-title { font-size: 14px; color: #64748b; font-weight: 600; margin-top: 5px; }

                .meta-info {
                    width: 100%;
                    margin-bottom: 25px;
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                    padding: 20px;
                    box-sizing: border-box;
                }
                .meta-item { display: flex; flex-direction: column; min-width: 0; }
                .meta-label { font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .meta-value { font-size: 16px; font-weight: 400; color: #1e293b; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

                table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
                th { background-color: #f8fafc; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; text-align: left; padding: 15px 10px; border-bottom: 1px solid #e2e8f0; }
                td { padding: 12px 10px; font-size: 15px; border-bottom: 1px solid #e2e8f0; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 400; }
                tr:nth-child(even) { background-color: #fafafa; }

                .col-num { text-align: center; color: #94a3b8; font-weight: 400; width: 50px; }
                .col-mat { text-align: center; color: #334155; font-weight: 400; width: 100px; }
                .col-name { font-weight: 400; color: #0f172a; }
                .col-day { border-left: 1px solid #e2e8f0; width: 22px; }

                @media (orientation: landscape) {
                    .col-name { width: 450px; }
                    .col-day { width: 28px; }
                }

                @media (orientation: portrait) {
                    .col-name { width: 250px; }
                    .col-day { width: 18px; }
                }

                .footer {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 120px;
                    display: flex;
                    justify-content: center;
                    align-items: flex-end;
                    padding-bottom: 40px;
                    background: white;
                }
                .sig-box { border-top: 0.3px solid #94a3b8; text-align: center; padding-top: 10px; font-size: 11px; font-weight: 900; color: #475569; text-transform: uppercase; width: 250px; margin: 0 30px; }

                .footer {
                    position: relative;
                    margin-top: 50px;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 15px;
                    display: flex;
                    justify-content: space-between;
                    font-size: 10px;
                    color: #94a3b8;
                    font-weight: 600;
                    background: white;
                    text-transform: uppercase;
                }
                @media print {
                    body { padding: 0; }
                    @page { size: auto; margin: 1.5cm; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="${logoUrl}" class="logo" />
                <div class="institution-info">
                    <p class="institution-name">Preparatoria Particular Hidalgo</p>
                    <p class="report-date">Generado el ${generated_at}</p>
                </div>
            </div>

            <div class="title-section">
                <h1 class="main-title">Lista de Control de Asistencia</h1>
                <p class="sub-title">SISTEMA DE CONTROL ESCOLAR PREPAHID | Documento Oficial Académico</p>
            </div>

            <div class="meta-info">
                <div class="meta-item">
                    <span class="meta-label">Ciclo Escolar</span>
                    <span class="meta-value">${period.nombre}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Grupo y Turno</span>
                    <span class="meta-value">${group.nombre} (${group.turno})</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Especialidad</span>
                    <span class="meta-value">${group.especialidad}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Profesor Titular</span>
                    <span class="meta-value">${group.tutor}</span>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th class="col-num">#</th>
                        <th class="col-mat">Matrícula</th>
                        <th class="col-name">Nombre del Alumno</th>
                        ${Array.from({length: 20}).map(() => `<th class="col-day"></th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${enrollments.map((e: any, i: number) => `
                        <tr>
                            <td class="col-num">${i + 1}</td>
                            <td class="col-mat">${e.matricula}</td>
                            <td class="col-name">${e.nombre}</td>
                            ${Array.from({length: 20}).map(() => `<td class="col-day"></td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="footer">
                <div class="sig-box">Firma del Docente</div>
                <div class="sig-box">Sello y Firma de Dirección</div>
            </div>
        </body>
        </html>
    `;
};
