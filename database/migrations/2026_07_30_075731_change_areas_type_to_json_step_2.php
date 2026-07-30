<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Forzamos el cambio de tipo y la construcción del arreglo inicial
        DB::statement("
            ALTER TABLE docentes
            ALTER COLUMN areas TYPE JSONB
            USING CASE
                WHEN areas IS NULL OR areas = '' THEN '[]'::jsonb
                ELSE jsonb_build_array(areas)
            END
        ");

        DB::statement("ALTER TABLE docentes ALTER COLUMN areas SET DEFAULT '[]'::jsonb");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("
            ALTER TABLE docentes
            ALTER COLUMN areas TYPE VARCHAR(255)
            USING CASE
                WHEN jsonb_array_length(areas) > 0 THEN areas->>0
                ELSE ''
            END
        ");
    }
};
