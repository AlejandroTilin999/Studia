<?php

namespace App\Services;

use App\Models\User;
use App\Models\Teacher;
use App\Models\Enrollment;
use App\Models\Course;
use App\Models\AcademicGroup;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ControlSchoolService
{
    // Lógica para registrar un Alumno junto a su cuenta de Usuario
    public function registerStudent(array $data)
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password'] ?? 'studia123'),
                'role' => 'student'
            ]);

            return Enrollment::create([
                'user_id' => $user->id,
                'academic_group_id' => $data['academic_group_id'],
                'academic_period_id' => $data['academic_period_id'] ?? 1,
                'student_code' => $data['student_code'],
                'status' => 'active'
            ]);
        });
    }

    // Lógica para registrar un Profesor junto a su cuenta de Usuario
    public function registerTeacher(array $data)
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password'] ?? 'profesor123'),
                'role' => 'teacher'
            ]);

            return Teacher::create([
                'user_id' => $user->id,
                'employee_code' => $data['employee_code'],
                'specialty' => $data['specialty'],
                'phone' => $data['phone'] ?? null
            ]);
        });
    }

    // Registrar Materia y vincularla a múltiples Grupos (Muchos a Muchos)
    public function registerCourse(array $data)
    {
        return DB::transaction(function () use ($data) {
            $course = Course::create([
                'code' => $data['code'],
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'teacher_id' => $data['teacher_id']
            ]);

            if (!empty($data['group_ids'])) {
                $course->academicGroups()->attach($data['group_ids']);
            }

            return $course;
        });
    }
}
