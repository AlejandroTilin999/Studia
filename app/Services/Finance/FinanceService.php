<?php

namespace App\Services\Finance;

use App\Models\Invoice;

class FinanceService
{
    /**
     * Genera un cargo manual o mensual a un alumno.
     */
    public function generateCharge(int $userId, string $concept, float $amount)
    {
        return Invoice::create([
            'usuario_id' => $userId,
            'concepto' => $concept,
            'monto' => $amount,
            'estatus' => 'pending'
        ]);
    }

    /**
     * Procesa y liquida una factura en Supabase.
     */
    public function processPayment(int $invoiceId)
    {
        $invoice = Invoice::findOrFail($invoiceId);

        if ($invoice->estatus === 'paid') {
            throw new \Exception("Esta factura ya fue pagada anteriormente.");
        }

        $invoice->update([
            'estatus' => 'paid'
        ]);

        return $invoice;
    }
}
