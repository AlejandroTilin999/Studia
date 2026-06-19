// app/Http/Controllers/GradingController.php
use App\Services\Grading\GradingService;

class GradingController extends Controller {
    protected $gradingService;

    public function __construct(GradingService $gradingService) {
        $this->gradingService = $gradingService;
    }

    public function updateOrCreate(Request $request) {
        $data = $request->validate([
            'enrollment_id' => 'required',
            'course_id' => 'required',
            'score' => 'required|numeric',
            'remarks' => 'nullable|string'
        ]);

        try {
            $this->gradingService->assignGrade($data['enrollment_id'], $data['course_id'], $data['score'], $data['remarks']);
            return redirect()->back()->with('success', 'Nota guardada.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}