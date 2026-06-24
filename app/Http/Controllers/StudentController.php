use App\Models\Student; // Importa el nuevo modelo

public function index()
{
    return Inertia::render('Admin/Alumnos/Index', [
        'alumnos' => Student::all() // Trae todos los registros de la tabla 'students'
    ]);
}