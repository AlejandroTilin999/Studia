<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;

class FinanceController extends Controller
{
    /**
     * Muestra los pagos pendientes o cobros de un alumno en particular.
     */
    public function studentInvoices($userId)
    {
        // Usamos la relación del modelo User que creamos en el paso anterior
        $invoices = Invoice::where('user_id', $userId)->orderBy('created_at', 'desc')->get();
        
        return view('admin.finance.student', compact('invoices'));
    }

    /**
     * Procesa el pago de una colegiatura o inscripción.
     */
    public function pay(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        
        // Cambiamos el estado a pagado
        $invoice->update([
            'status' => 'paid'
        ]);

        return redirect()->back()->with('success', 'El pago ha sido registrado e impactado en el sistema.');
    }
}