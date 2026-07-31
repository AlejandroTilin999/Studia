interface CertificateData {
    student: {
        nombre: string;
        matricula: string;
    };
    academic: {
        grupo: string;
        especialidad: string;
        ciclo: string;
        semestre: string;
        turno: string;
    };
    issued_at: {
        day: string;
        month: string;
        year: string;
        full: string;
    };
}

export const generateCertificateHTML = (data: CertificateData): string => {
    const { student, academic, issued_at } = data;
    const logoUrl = "/assets/phid_logo.webp";

    return `
        <html>
        <head>
            <title>Constancia de Estudios - ${student.matricula}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                * { box-sizing: border-box; }
                body {
                    font-family: 'Inter', sans-serif;
                    padding: 40px 50px;
                    color: #1e293b;
                    background: white;
                    line-height: 1.6;
                    font-size: 15px;
                }

                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: none;
                    padding-bottom: 15px;
                    margin-bottom: 30px;
                }
                .logo { height: 60px; }
                .institution-info { text-align: right; }
                .institution-name { font-weight: 900; font-size: 16px; color: #0266E0; margin: 0; text-transform: uppercase; }
                .office-name { font-size: 11px; color: #64748b; font-weight: 700; margin-top: 2px; }

                .subject-section {
                    text-align: right;
                    margin-bottom: 30px;
                    font-weight: 900;
                    font-size: 13px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .title-main {
                    text-align: center;
                    margin-bottom: 35px;
                }
                .main-title {
                    font-size: 24px;
                    font-weight: 900;
                    color: #0f172a;
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: -0.02em;
                }

                .content-body {
                    text-align: justify;
                    margin-bottom: 35px;
                    color: #334155;
                }
                .highlight {
                    font-weight: 900;
                    color: #0f172a;
                }

                .date-closing {
                    text-align: justify;
                    margin-bottom: 50px;
                }

                .footer {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 140px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-end;
                    padding-bottom: 50px;
                    background: white;
                }
                .sig-line {
                    width: 300px;
                    border-top: 0.3px solid #000000;
                    margin-bottom: 10px;
                }
                .sig-name {
                    font-size: 14px;
                    font-weight: 900;
                    text-transform: uppercase;
                    color: #0f172a;
                }
                .sig-title {
                    font-size: 12px;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                }

                .watermark {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 100px;
                    font-weight: 900;
                    color: rgba(2, 102, 224, 0.03);
                    z-index: -1;
                    white-space: nowrap;
                    pointer-events: none;
                }

                @media print {
                    body { padding: 0; margin: 0; }
                    @page { size: letter portrait; margin: 2cm; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="${logoUrl}" class="logo" />
                <div class="institution-info">
                    <p class="institution-name">Preparatoria Particular Hidalgo</p>
                    <p class="office-name">Dirección de Control Escolar</p>
                </div>
            </div>

            <div class="subject-section">
                Asunto: Constancia de Estudios
            </div>

            <div class="title-main" style="margin-top: 60px;">
                <h1 class="main-title">A QUIEN CORRESPONDA:</h1>
            </div>

            <div class="content-body" style="margin-top: 40px;">
                La Dirección de la <span class="highlight">PREPARATORIA PARTICULAR HIDALGO</span>, por medio de la presente hace <span class="highlight">CONSTAR</span> que el alumno(a):
                <br/><br/>
                <center><span class="highlight" style="font-size: 20px;">${student.nombre}</span></center>
                <br/>
                Con número de matrícula <span class="highlight">${student.matricula}</span>, se encuentra debidamente <span class="highlight">INSCRITO(A)</span> en esta institución educativa,
                cursando actualmente el <span class="highlight">${academic.semestre}° SEMESTRE</span> del grupo <span class="highlight">${academic.grupo}</span>,
                correspondiente al <span class="highlight">${academic.ciclo}</span>, en el turno <span class="highlight">${academic.turno}</span>,
                con la especialidad de <span class="highlight">${academic.especialidad}</span>.
            </div>

            <div class="date-closing">
                A petición de la parte interesada y para los fines legales que al mismo convengan, se extiende la presente en la ciudad de Maravatío, Michoacán,
                a los <span class="highlight">${issued_at.full}</span>.
            </div>

            <div class="footer">
                <div class="sig-line"></div>
                <div class="sig-name">Mtro. Uriel Cambrón Hernández</div>
                <div class="sig-title">Director del Plantel</div>
            </div>
        </body>
        </html>
    `;
};
