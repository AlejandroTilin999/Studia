interface KardexData {
    student: {
        nombre: string;
        matricula: string;
        especialidad: string;
    };
    history: any[];
    globalGpa: string | number;
    issued_at: {
        full: string;
    };
}

export const generateKardexHTML = (data: KardexData): string => {
    const { student, history, globalGpa, issued_at } = data;
    const logoUrl = "/assets/phid_logo.png";

    // Dividir el historial en dos para las columnas
    const half = Math.ceil(history.length / 2);
    const leftCol = history.slice(0, half);
    const rightCol = history.slice(half);

    return `
        <html>
        <head>
            <title>Kardex Académico - ${student.matricula}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                * { box-sizing: border-box; }
                body { font-family: 'Inter', sans-serif; padding: 40px 60px; color: #000000; background: white; font-size: 11px; font-weight: 400; }

                .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .logo { height: 60px; }
                .institution-info { text-align: right; }
                .institution-name { font-weight: 900; font-size: 16px; color: #0266E0; margin: 0; text-transform: uppercase; white-space: nowrap; }
                .report-date { font-size: 11px; color: #64748b; margin-top: 4px; }

                .title-section { margin-bottom: 20px; text-align: center; }
                .main-title { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: -0.02em; }
                .sub-title { font-size: 11px; color: #64748b; font-weight: 600; margin-top: 5px; text-transform: uppercase; }

                .meta-info {
                    width: 100%;
                    margin-bottom: 30px;
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    display: grid;
                    grid-template-columns: 1.5fr 1fr 1fr;
                    gap: 15px;
                    padding: 20px;
                    box-sizing: border-box;
                }
                .meta-item { display: flex; flex-direction: column; min-width: 0; }
                .meta-label { font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .meta-value { font-size: 14px; font-weight: 400; color: #1e293b; text-transform: uppercase; }

                .dual-column-container {
                    display: flex;
                    gap: 25px;
                    width: 100%;
                }
                .kardex-column {
                    flex: 1;
                }

                table { width: 100%; border-collapse: collapse; margin-top: 5px; table-layout: fixed; }
                th { background-color: #f8fafc; color: #475569; font-size: 7px; font-weight: 700; text-transform: uppercase; text-align: center; padding: 8px 4px; border-bottom: 1px solid #e2e8f0; }
                th.col-subject { text-align: left; width: 50%; }
                th.col-sem { width: 25px; }
                th.col-code { width: 55px; }
                th.col-grade { width: 35px; }

                td { padding: 6px 4px; font-size: 9.5px; border-bottom: 1px solid #f1f5f9; color: #000000; text-align: center; font-weight: 400; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                td.col-subject { text-align: left; color: #0f172a; }
                tr:nth-child(even) { background-color: #fafafa; }

                .summary-footer {
                    margin-top: 20px;
                    padding: 10px 5px;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 15px;
                }
                .summary-label { font-weight: 400; text-transform: uppercase; color: #000000; font-size: 10px; }
                .summary-value { font-weight: 400; color: #000000; font-size: 14px; }

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
                .sig-box { border-top: 0.3px solid #000000; text-align: center; padding-top: 10px; font-size: 11px; font-weight: 400; color: #000000; text-transform: uppercase; width: 300px; }

                .watermark {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 120px;
                    font-weight: 900;
                    color: rgba(2, 102, 224, 0.02);
                    z-index: -1;
                    white-space: nowrap;
                    pointer-events: none;
                    text-transform: uppercase;
                }

                @media print {
                    body { padding: 0; }
                    @page { size: letter portrait; margin: 1.5cm; }
                }
            </style>
        </head>
        <body>
            <div class="watermark">HISTORIAL ACADÉMICO</div>

            <div class="header">
                <img src="${logoUrl}" class="logo" />
                <div class="institution-info">
                    <p class="institution-name">Preparatoria Particular Hidalgo</p>
                    <p class="report-date">Generado el ${issued_at.full}</p>
                </div>
            </div>

            <div class="title-section">
                <h1 class="main-title">Historial Académico</h1>
                <p class="sub-title">SISTEMA DE CONTROL ESCOLAR PREPAHID | Registro Integral de Trayectoria</p>
            </div>

            <div class="meta-info">
                <div class="meta-item">
                    <span class="meta-label">Estudiante</span>
                    <span class="meta-value">${student.nombre}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Matrícula</span>
                    <span class="meta-value">${student.matricula}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Bachillerato / Especialidad</span>
                    <span class="meta-value">${student.especialidad}</span>
                </div>
            </div>

            <div class="dual-column-container">
                <!-- Columna Izquierda -->
                <div class="kardex-column">
                    <table>
                        <thead>
                            <tr>
                                <th class="col-sem">SEM</th>
                                <th class="col-code">CLAVE</th>
                                <th class="col-subject">MATERIA</th>
                                <th class="col-grade">CAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${leftCol.map(item => `
                                <tr>
                                    <td>${item.semestre}</td>
                                    <td>${item.codigo}</td>
                                    <td class="col-subject">${item.materia}</td>
                                    <td>${item.calificacion}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Columna Derecha -->
                <div class="kardex-column">
                    <table>
                        <thead>
                            <tr>
                                <th class="col-sem">SEM</th>
                                <th class="col-code">CLAVE</th>
                                <th class="col-subject">MATERIA</th>
                                <th class="col-grade">CAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rightCol.map(item => `
                                <tr>
                                    <td>${item.semestre}</td>
                                    <td>${item.codigo}</td>
                                    <td class="col-subject">${item.materia}</td>
                                    <td>${item.calificacion}</td>
                                </tr>
                            `).join('')}
                            ${rightCol.length < leftCol.length ? '<tr><td colspan="4" style="border:none; height:25px;"></td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="summary-footer">
                <span class="summary-label">Promedio General Acumulado</span>
                <span class="summary-value">${globalGpa}</span>
            </div>

            <div class="footer">
                <div class="sig-box">Sello y Firma de Servicios Escolares</div>
            </div>
        </body>
        </html>
    `;
};
