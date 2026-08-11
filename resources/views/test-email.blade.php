<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prueba de Envío de Email</title>
    <style>
        body { font-family: sans-serif; display: grid; place-items: center; height: 100vh; margin: 0; background: #f4f4f5; }
        .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); width: 320px; }
        .form-group { margin-bottom: 1rem; }
        label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
        input { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; background: #2563eb; color: white; border: none; padding: 0.75rem; border-radius: 4px; font-weight: bold; cursor: pointer; }
        button:hover { background: #1d4ed8; }
        .alert { background: #dcfce7; color: #15803d; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; }
    </style>
</head>
<body>
    <div class="card">
        <h2>Probar Brevo</h2>

        @if(session('success'))
            <div class="alert">
                {{ session('success') }}
            </div>
        @endif

            <form action="{{ route('send.test.email') }}" method="POST">
                @csrf
                
                <div>
                    <label for="name">Nombre:</label>
                    <input type="text" name="name" id="name" required>
                </div>
                
                <div>
                    <label for="email">Email Destino:</label>
                    <input type="email" name="email" id="email" required>
                </div>

                <button type="submit">Enviar Correo de Prueba</button>
            </form>
    </div>
</body>
</html>