import { useCallback } from 'react';
import { SwalHelper } from '@/utils/SwalHelper';

export function useExportPDF() {
    const exportToPDF = useCallback((
        title: string,
        headers: string[],
        rows: any[][],
        fileNamePrefix: string
    ) => {
        if (!rows || rows.length === 0) {
            SwalHelper.alert('Sin registros', 'No hay datos para exportar en este momento.', 'warning');
            return;
        }

        SwalHelper.loading("Generando PDF", "Dando formato institucional al documento...");

        const logoUrl = "/assets/phid_logo.png";
        const dateStr = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

        // EL SECRETO: Usar un iframe oculto para no abrir pestañas extras
        let iframe = document.getElementById('pdf-export-iframe') as HTMLIFrameElement;
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'pdf-export-iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }

        const htmlContent = `
            <html>
            <head>
                <title>${title}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                    body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: white; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0266E0; padding-bottom: 20px; margin-bottom: 30px; }
                    .logo { height: 50px; }
                    .institution-info { text-align: right; }
                    .institution-name { font-weight: 900; font-size: 14px; color: #0266E0; margin: 0; text-transform: uppercase; }
                    .report-date { font-size: 10px; color: #64748b; margin-top: 4px; }
                    .title-section { margin-bottom: 25px; }
                    .main-title { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: -0.02em; }
                    .sub-title { font-size: 11px; color: #64748b; font-weight: 600; margin-top: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
                    th { background-color: #f8fafc; color: #475569; font-size: 9px; font-weight: 900; text-transform: uppercase; text-align: left; padding: 12px 10px; border-bottom: 1px solid #e2e8f0; }
                    td { padding: 10px; font-size: 10px; border-bottom: 1px solid #f1f5f9; color: #334155; word-wrap: break-word; }
                    tr:nth-child(even) { background-color: #fafafa; }
                    .footer {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        border-top: 1px solid #e2e8f0;
                        padding-top: 10px;
                        display: flex;
                        justify-content: space-between;
                        font-size: 8px;
                        color: #94a3b8;
                        font-weight: 600;
                        background: white;
                    }
                    .footer-spacer {
                        height: 50px;
                    }
                    @media print {
                        body { padding: 0; margin: 0; }
                        @page {
                            margin: 1.5cm;
                        }
                        .footer {
                            position: fixed;
                            bottom: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="${logoUrl}" class="logo" />
                    <div class="institution-info">
                        <p class="institution-name">Preparatoria Hidalgo</p>
                        <p class="report-date">Generado el ${dateStr} a las ${timeStr} hrs.</p>
                    </div>
                </div>

                <div class="title-section">
                    <h1 class="main-title">${title}</h1>
                    <p class="sub-title">Sistema de Control Escolar Studia | Documento Informativo Interno</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(r => `
                            <tr>
                                ${r.map(cell => `<td>${cell || '—'}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="${headers.length}" class="footer-spacer" style="border:none;"></td>
                        </tr>
                    </tfoot>
                </table>

                <div class="footer">
                    <span>© ${new Date().getFullYear()} PREPARATORIA HIDALGO - CONTROL ESCOLAR</span>
                    <span>Documento oficial generado digitalmente.</span>
                </div>
            </body>
            </html>
        `;

        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (doc) {
            doc.open();
            doc.write(htmlContent);
            doc.close();

            // 1. Damos un momento para que el navegador procese el HTML
            setTimeout(() => {
                // 2. Mostramos que se creó con éxito
                SwalHelper.success("¡Documento Generado!", "El reporte se ha procesado correctamente. Abriendo diálogo de guardado...");

                // 3. Pequeño retardo para que el usuario vea el mensaje de éxito antes de que salte el diálogo del sistema
                setTimeout(() => {
                    iframe.contentWindow?.focus();
                    iframe.contentWindow?.print();
                }, 1500);
            }, 600);
        }

    }, []);

    return { exportToPDF };
}
