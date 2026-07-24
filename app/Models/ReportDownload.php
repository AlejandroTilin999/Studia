<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportDownload extends Model
{
    use HasFactory;

    protected $table = 'reporte_descargas';

    protected $fillable = [
        'usuario_id',
        'tipo_reporte',
        'metadata',
    ];

    protected $appends = ['folio'];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Genera un folio único para el reporte basado en el ID y el año.
     * Ejemplo: PH-2026-00001
     */
    public function getFolioAttribute()
    {
        $year = $this->created_at ? $this->created_at->year : date('Y');
        return 'PH-' . $year . '-' . str_pad($this->id, 5, '0', STR_PAD_LEFT);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
