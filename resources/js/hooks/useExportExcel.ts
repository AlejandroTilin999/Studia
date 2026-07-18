import { useCallback } from 'react';
import { SwalHelper } from '@/utils/SwalHelper';

export function useExportExcel() {
    const exportToExcel = useCallback((
        title: string,
        sheetName: string,
        headers: string[],
        rows: any[][],
        fileNamePrefix: string,
        onSuccess?: (msg: string) => void
    ) => {
        // Validación de registros
        if (!rows || rows.length === 0) {
            SwalHelper.alert(
                'Sin registros',
                'No se puede generar el reporte porque no hay registros disponibles para exportar en este momento.',
                'warning'
            );
            return;
        }

        const logoUrl = "https://nsnjjcnzdhxmqvkwewdy.supabase.co/storage/v1/object/public/Escolar/phid_logo.png";

        // Estructura XML / HTML optimizada para Excel
        const htmlTemplate = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
                <!--[if gte mso 9]>
                <xml>
                    <x:ExcelWorkbook>
                        <x:ExcelWorksheets>
                            <x:ExcelWorksheet>
                                <x:Name>${sheetName}</x:Name>
                                <x:WorksheetOptions>
                                    <x:DisplayGridlines/>
                                </x:WorksheetOptions>
                            </x:ExcelWorksheet>
                        </x:ExcelWorksheets>
                    </x:ExcelWorkbook>
                </xml>
                <![endif]-->
                <style>
                    .logo-box {
                        text-align: left;
                        vertical-align: middle;
                        height: 80px;
                        border: none;
                    }
                    .title-text {
                        font-family: 'Segoe UI', Arial, sans-serif;
                        font-size: 24pt;
                        font-weight: bold;
                        color: #0266E0;
                    }
                    .info-text {
                        font-family: 'Segoe UI', sans-serif;
                        font-size: 11pt;
                        color: #64748b;
                    }
                    th {
                        background-color: #F1F5F9;
                        color: #000000;
                        font-family: sans-serif;
                        font-size: 10pt;
                        font-weight: bold;
                        border: 0.5pt solid #CBD5E1;
                        padding: 10px;
                    }
                    td {
                        border: 0.5pt solid #CBD5E1;
                        font-family: sans-serif;
                        font-size: 9pt;
                        padding: 8px;
                    }
                </style>
            </head>
            <body>
                <table>
                    <!-- Logo en celda con borde -->
                    <tr>
                        <td colspan="${headers.length}" class="logo-box">
                            <img src="${logoUrl}" width="220" height="55" />
                        </td>
                    </tr>
                    <!-- Título -->
                    <tr>
                        <td colspan="${headers.length}" class="title-text" style="border:none;">
                            ${title.toUpperCase()}
                        </td>
                    </tr>
                    <!-- Información Adicional -->
                    <tr>
                        <td colspan="${headers.length}" class="info-text" style="border:none;">
                            Sistema de Control Escolar Studia | Campus Hidalgo
                        </td>
                    </tr>
                    <tr>
                        <td colspan="${headers.length}" class="info-text" style="border:none; color:#94a3b8; font-size:9pt;">
                            Reporte generado el: ${new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} a las ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs.
                        </td>
                    </tr>
                    <tr><td colspan="${headers.length}" style="border:none; height:15px;"></td></tr>
                </table>

                <table style="border-collapse: collapse;">
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(r => `
                            <tr>
                                ${r.map(cell => `<td>${cell !== null && cell !== undefined ? cell : ''}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <table>
                    <tr><td colspan="${headers.length}" style="border:none; height:30px;"></td></tr>
                    <tr>
                        <td colspan="${headers.length}" style="border:none; text-align:center; color:#94a3b8; font-size:8pt;">
                            © ${new Date().getFullYear()} PREPARATORIA HIDALGO. Documento oficial generado digitalmente.
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        // EL SECRETO: Añadir el BOM de UTF-8 (\ufeff) para que Excel no se queje del formato
        const blobContent = "\ufeff" + htmlTemplate;
        const blob = new Blob([blobContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });

        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);

        const timestamp = new Date().toISOString().slice(0,10) + '_' + new Date().getHours() + '-' + new Date().getMinutes();
        // Usamos .xls porque es el formato que permite inyectar estilos HTML/XML sin corromperse
        link.setAttribute("download", `${fileNamePrefix}_${timestamp}.xls`);

        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (onSuccess) {
            onSuccess(`Reporte generado correctamente.`);
        }
    }, []);

    return { exportToExcel };
}
