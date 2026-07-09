import { useCallback } from 'react';

export function useExportExcel() {
    const exportToExcel = useCallback((
        title: string,
        sheetName: string,
        headers: string[],
        rows: any[][],
        fileNamePrefix: string,
        onSuccess?: (msg: string) => void
    ) => {
        const htmlTemplate = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
                <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${sheetName}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; }
                    th { background-color: #1e88e5; color: white; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f8fafc; }
                </style>
            </head>
            <body>
                <h2>${title}</h2>
                <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')}</p>
                <table>
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
            </body>
            </html>
        `;

        const blob = new Blob([htmlTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${fileNamePrefix}_${new Date().toISOString().slice(0,10)}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (onSuccess) {
            onSuccess(`Exportación completada con éxito.`);
        }
    }, []);

    return { exportToExcel };
}
