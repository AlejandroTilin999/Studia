<?php

namespace App\Services;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use App\Models\GoogleToken;
use App\Models\Student;
use App\Models\Enrollment;
use App\Models\Tarea;
use App\Models\User;
use Exception;

class GoogleDriveService
{
    protected Drive $service;
    protected Client $client;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setClientId(config('services.google.client_id'));
        $this->client->setClientSecret(config('services.google.client_secret'));
        $this->client->setRedirectUri(config('services.google.redirect_uri'));

        $token = GoogleToken::first();
        if (!$token) {
            throw new Exception("No hay credenciales OAuth de Google Drive vinculadas. Conecte su cuenta primero.");
        }

        $this->client->setAccessToken([
            'access_token' => $token->access_token,
            'refresh_token' => $token->refresh_token,
            'expires_in' => $token->expires_in,
            'created' => $token->updated_at ? $token->updated_at->timestamp : time(),
        ]);

        // Auto-refresh token si ha expirado
        if ($this->client->isAccessTokenExpired()) {
            if ($token->refresh_token) {
                $newToken = $this->client->fetchAccessTokenWithRefreshToken($token->refresh_token);
                if (isset($newToken['access_token'])) {
                    $token->update([
                        'access_token' => $newToken['access_token'],
                        'expires_in' => $newToken['expires_in'] ?? $token->expires_in,
                    ]);
                }
            }
        }

        $this->service = new Drive($this->client);
    }

    /**
     * Busca o crea una carpeta por nombre dentro de un padre específico ('root' por defecto).
     */
    public function findOrCreateFolder(string $folderName, ?string $parentId = null): string
    {
        $sanitizedName = str_replace("'", "\\'", trim($folderName));
        $query = "mimeType='application/vnd.google-apps.folder' and name='{$sanitizedName}' and trashed=false";

        if ($parentId) {
            $query .= " and '{$parentId}' in parents";
        }

        $results = $this->service->files->listFiles([
            'q' => $query,
            'fields' => 'files(id, name)',
            'pageSize' => 1
        ]);

        if (count($results->getFiles()) > 0) {
            return $results->getFiles()[0]->getId();
        }

        return $this->createFolder($folderName, $parentId)->getId();
    }

    /**
     * Crear una carpeta en Drive
     */
    public function createFolder(string $folderName, ?string $parentId = null): DriveFile
    {
        $meta = [
            'name' => $folderName,
            'mimeType' => 'application/vnd.google-apps.folder',
        ];

        if ($parentId) {
            $meta['parents'] = [$parentId];
        }

        $folderMetadata = new DriveFile($meta);

        return $this->service->files->create($folderMetadata, [
            'fields' => 'id, name'
        ]);
    }

    /**
     * Construye y/o recupera la ruta de carpetas para un alumno:
     * Prepahid / Alumnos / {Ciclo Escolar} / {Grupo} / {Alumno}
     */
    public function getOrCreateStudentFolder(Student $student, ?Enrollment $enrollment = null): string
    {
        $enrollment = $enrollment ?? $student->enrollment ?? $student->enrollments()->latest()->first();

        $rootId = $this->findOrCreateFolder('Prepahid');
        $alumnosFolderId = $this->findOrCreateFolder('Alumnos', $rootId);

        $cicloNombre = $enrollment && $enrollment->academicPeriod 
            ? $enrollment->academicPeriod->nombre 
            : 'General';

        $grupoNombre = $enrollment && $enrollment->academicGroup 
            ? $enrollment->academicGroup->nombre 
            : 'Sin_Grupo';

        $studentName = $student->user 
            ? trim("{$student->user->apellido_paterno} {$student->user->apellido_materno} {$student->user->nombre}")
            : "Alumno_{$student->id}";

        $studentFolderName = "{$studentName} ({$student->matricula})";

        $cicloFolderId = $this->findOrCreateFolder($cicloNombre, $alumnosFolderId);
        $grupoFolderId = $this->findOrCreateFolder($grupoNombre, $cicloFolderId);

        return $this->findOrCreateFolder($studentFolderName, $grupoFolderId);
    }

    /**
     * Construye y/o recupera la ruta de carpetas organizada para la entrega de tareas:
     * Prepahid / Académico / {Ciclo Escolar} / {Grupo} / {Materia} / {Docente} / {Tarea}
     */
    public function getOrCreateTaskFolder(Tarea $tarea): string
    {
        $load = $tarea->academicLoad;
        $cicloNombre = $load && $load->academicPeriod ? $load->academicPeriod->nombre : 'General';
        $grupoNombre = $load && $load->academicGroup ? $load->academicGroup->nombre : 'Sin_Grupo';
        $materiaNombre = $load && $load->course ? $load->course->nombre : 'Materia';
        $docenteNombre = ($load && $load->teacher && $load->teacher->user) 
            ? trim("{$load->teacher->user->nombre} {$load->teacher->user->apellido_paterno}")
            : 'Docente';
        $tareaNombre = $tarea->nombre ?: "Tarea_{$tarea->id}";

        $rootId = $this->findOrCreateFolder('Prepahid');
        $academicoFolderId = $this->findOrCreateFolder('Académico', $rootId);
        $cicloFolderId = $this->findOrCreateFolder($cicloNombre, $academicoFolderId);
        $grupoFolderId = $this->findOrCreateFolder($grupoNombre, $cicloFolderId);
        $materiaFolderId = $this->findOrCreateFolder($materiaNombre, $grupoFolderId);
        $docenteFolderId = $this->findOrCreateFolder($docenteNombre, $materiaFolderId);

        return $this->findOrCreateFolder($tareaNombre, $docenteFolderId);
    }

    /**
     * Subir archivo a una carpeta específica de Google Drive y hacerlo accesible vía link.
     */
    public function uploadFileToFolder(string $filePath, string $fileName, string $folderId): DriveFile
    {
        $fileMetadata = new DriveFile([
            'name' => $fileName,
            'parents' => [$folderId]
        ]);

        $content = file_get_contents($filePath);
        $mimeType = mime_content_type($filePath) ?: 'application/octet-stream';

        $file = $this->service->files->create(
            $fileMetadata,
            [
                'data' => $content,
                'mimeType' => $mimeType,
                'uploadType' => 'multipart',
                'fields' => 'id, name, webViewLink, webContentLink'
            ]
        );

        // Opcional: Asignar permisos de lectura general mediante link
        try {
            $permission = new Drive\Permission([
                'type' => 'anyone',
                'role' => 'reader',
            ]);
            $this->service->permissions->create($file->id, $permission);
        } catch (Exception $e) {
            // Continuar aun si hay restricción de dominio
        }

        return $file;
    }

    /**
     * Obtener URL pública o webViewLink de un archivo.
     */
    public function getFileUrl(string $fileId): string
    {
        $file = $this->service->files->get($fileId, ['fields' => 'webViewLink']);
        return $file->getWebViewLink();
    }

    /**
     * Elimina un archivo de Google Drive.
     */
    public function deleteFile(string $fileId): bool
    {
        try {
            $this->service->files->delete($fileId);
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}