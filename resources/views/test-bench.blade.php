? 
}<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Studia - Banco de Pruebas</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-gray-100 min-h-screen p-6">

    <div class="max-w-6xl mx-auto">
        <header class="mb-8 border-b border-gray-300 pb-4">
            <h1 class="text-3xl font-bold text-gray-800">Studia 🎓</h1>
            <p class="text-gray-600">Banco de pruebas rápido para servicios y base de datos en Supabase</p>
        </header>

        @if(session('success'))
            <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-sm">
                {{ session('success') }}
            </div>
        @endif
        @if(session('error') || $errors->any())
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
                {{ session('error') ?? 'Hubo errores de validación en el formulario.' }}
            </div>
        @endif

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 class="text-xl font-semibold mb-4 text-indigo-700 border-b pb-2">1. Control Académico</h2>
                
                <form action="{{ route('academic.periods.store') }}" method="POST" class="mb-6">
                    @csrf
                    <h3 class="font-medium text-gray-700 mb-2">Crear Ciclo Escolar</h3>
                    <div class="space-y-3">
                        <input type="text" name="name" placeholder="Ej: Ciclo 2026-A" class="w-full p-2 border rounded" required>
                        <div class="grid grid-cols-2 gap-2">
                            <input type="date" name="start_date" class="p-2 border rounded" required>
                            <input type="date" name="end_date" class="p-2 border rounded" required>
                        </div>
                        <label class="flex items-center space-x-2 text-sm text-gray-600">
                            <input type="checkbox" name="is_active" value="1">
                            <span>Marcar como ciclo activo</span>
                        </label>
                        <button type="submit" class="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition">Crear Periodo</button>
                    </div>
                </form>

                <form action="{{ route('academic.courses.store') }}" method="POST">
                    @csrf
                    <h3 class="font-medium text-gray-700 mb-2">Dar de Alta Materia</h3>
                    <div class="space-y-3">
                        <div class="grid grid-cols-3 gap-2">
                            <input type="text" name="code" placeholder="MAT-101" class="p-2 border rounded col-span-1" required>
                            <input type="text" name="name" placeholder="Matemáticas I" class="p-2 border rounded col-span-2" required>
                        </div>
                        <textarea name="description" placeholder="Descripción opcional..." class="w-full p-2 border rounded rows='2'"></textarea>
                        <button type="submit" class="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition">Registrar Materia</button>
                    </div>
                </form>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 class="text-xl font-semibold mb-4 text-emerald-700 border-b pb-2">2. Inscripciones Escolares</h2>
                <form action="{{ route('enrollments.store') }}" method="POST" class="space-y-3">
                    @csrf
                    <p class="text-xs text-gray-500 mb-2">Nota: Necesitas tener IDs válidos de la tabla `users` y `academic_periods` en Supabase.</p>
                    <div>
                        <label class="text-xs font-bold text-gray-600">ID del Alumno (user_id):</label>
                        <input type="number" name="user_id" placeholder="1" class="w-full p-2 border rounded" required>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-600">ID del Ciclo (academic_period_id):</label>
                        <input type="number" name="academic_period_id" placeholder="1" class="w-full p-2 border rounded" required>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-600">Costo de Inscripción ($ MXN):</label>
                        <input type="number" step="0.01" name="tuition_fee" placeholder="1500.00" class="w-full p-2 border rounded" required>
                    </div>
                    <button type="submit" class="w-full bg-emerald-600 text-white p-2 rounded hover:bg-emerald-700 transition">Inscribir Alumno y Generar Cargo</button>
                </form>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 class="text-xl font-semibold mb-4 text-amber-700 border-b pb-2">3. Registro de Notas</h2>
                <form action="{{ route('grades.assign') }}" method="POST" class="space-y-3">
                    @csrf
                    <div>
                        <label class="text-xs font-bold text-gray-600">ID de la Inscripción (enrollment_id):</label>
                        <input type="number" name="enrollment_id" placeholder="1" class="w-full p-2 border rounded" required>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-600">ID de la Materia (course_id):</label>
                        <input type="number" name="course_id" placeholder="1" class="w-full p-2 border rounded" required>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-600">Calificación (0.00 al 10.00):</label>
                        <input type="number" step="0.1" name="score" placeholder="9.5" class="w-full p-2 border rounded" required>
                    </div>
                    <div>
                        <label class="text-xs font-bold text-gray-600">Observaciones:</label>
                        <input type="text" name="remarks" placeholder="Buen desempeño en el examen" class="w-full p-2 border rounded">
                    </div>
                    <button type="submit" class="w-full bg-amber-600 text-white p-2 rounded hover:bg-amber-700 transition">Asentar Calificación</button>
                </form>
            </div>

            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 class="text-xl font-semibold mb-4 text-blue-700 border-b pb-2">4. Control de Pagos</h2>
                <p class="text-sm text-gray-600 mb-4">Para simular el cobro de una colegiatura o inscripción, introduce el ID del cargo físico (`invoice_id`) creado en Supabase:</p>
                
                <form id="payForm" method="POST" class="space-y-3" onsubmit="updatePayAction()">
                    @csrf
                    @method('PATCH')
                    <div>
                        <label class="text-xs font-bold text-gray-600">ID de Factura / Cargo (invoice_id):</label>
                        <input type="number" id="invoice_id" placeholder="1" class="w-full p-2 border rounded" required>
                    </div>
                    <button type="submit" class="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">Marcar Factura como PAGADA</button>
                </form>

                <script>
                    // Script simple para inyectar dinámicamente el ID en la URL de la ruta de Laravel
                    function updatePayAction() {
                        var id = document.getElementById('invoice_id').value;
                        document.getElementById('payForm').action = "/finance/invoice/" + id + "/pay";
                    }
                </script>
            </div>

        </div>
    </div>

</body>
</html>