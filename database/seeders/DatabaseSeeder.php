<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Specialty;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Especialidades
        $inf = Specialty::updateOrCreate(['code' => 'INF'], ['name' => 'Informática']);
        $gts = Specialty::updateOrCreate(['code' => 'GTS'], ['name' => 'Gastronomía']);
    }
}
