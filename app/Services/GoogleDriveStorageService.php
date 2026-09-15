<?php

namespace App\Services;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Google\Service\Drive\Permission;
use Illuminate\Support\Facades\File;
use RuntimeException;

class GoogleDriveStorageService
{
    protected Drive $service;

    public function __construct()
    {
        $client = new Client();

        $client->setClientId(
            env('GOOGLE_DRIVE_CLIENT_ID')
        );

        $client->setClientSecret(
            env('GOOGLE_DRIVE_CLIENT_SECRET')
        );

        $client->addScope(
            Drive::DRIVE
        );

        $client->setAccessType('offline');

        $token = $client->fetchAccessTokenWithRefreshToken(
            env('GOOGLE_DRIVE_REFRESH_TOKEN')
        );

        if (isset($token['error'])) {
            throw new RuntimeException(
                'Google Drive token error: ' .
                    ($token['error_description'] ?? $token['error'])
            );
        }

        $client->setAccessToken($token);

        $this->service = new Drive($client);
    }

    /*
    |--------------------------------------------------------------------------
    | Upload File
    |--------------------------------------------------------------------------
    */

    public function upload($file, $parentId = null): array
    {
        $metadata = new DriveFile([
            'name' => time() . '_' . $file->getClientOriginalName(),
        ]);

        $metadata->setParents([
            $parentId ?: env('GOOGLE_DRIVE_FOLDER_ID')
        ]);

        $uploadedFile = $this->service->files->create(
            $metadata,
            [
                'data' => file_get_contents($file->getRealPath()),
                'mimeType' => $file->getMimeType(),
                'uploadType' => 'multipart',
                'fields' => 'id,name,mimeType,size',
            ]
        );

        $permission = new Permission([
            'type' => 'anyone',
            'role' => 'reader',
        ]);

        $this->service->permissions->create(
            $uploadedFile->id,
            $permission
        );

        return [
            'id' => $uploadedFile->id,
            'name' => $uploadedFile->name,
            'url' =>
            "https://drive.google.com/uc?export=download&id={$uploadedFile->id}",
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Upload Local MP3
    |--------------------------------------------------------------------------
    */

    public function uploadMp3(
        string $filePath,
        string $fileName,
        ?string $parentId = null
    ): array {
        if (!file_exists($filePath)) {
            throw new RuntimeException(
                "File MP3 tidak ditemukan: {$filePath}"
            );
        }

        $metadata = new DriveFile([
            'name' => $fileName,
            'parents' => [
                $parentId ?: env('GOOGLE_DRIVE_FOLDER_ID')
            ],
        ]);

        $uploadedFile = $this->service->files->create(
            $metadata,
            [
                'data' => file_get_contents($filePath),
                'mimeType' => 'audio/mpeg',
                'uploadType' => 'multipart',
                'fields' => 'id,name,mimeType,size',
            ]
        );

        $permission = new Permission([
            'type' => 'anyone',
            'role' => 'reader',
        ]);

        $this->service->permissions->create(
            $uploadedFile->id,
            $permission
        );

        return [
            'id' => $uploadedFile->id,
            'name' => $uploadedFile->name,
            'url' =>
            "https://drive.google.com/uc?export=download&id={$uploadedFile->id}",
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Get File Information
    |--------------------------------------------------------------------------
    */

    public function getFile(string $fileId): ?DriveFile
    {
        try {
            return $this->service->files->get(
                $fileId,
                [
                    'fields' =>
                    'id,name,mimeType,size,fileExtension,parents,trashed',
                ]
            );
        } catch (\Throwable $e) {
            return null;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Download File From Google Drive
    |--------------------------------------------------------------------------
    */

    public function download(
        string $fileId,
        string $destination
    ): string {
        $response = $this->service->files->get(
            $fileId,
            [
                'alt' => 'media',
            ]
        );

        $body = $response->getBody();

        $directory = dirname($destination);

        if (!File::exists($directory)) {
            File::makeDirectory(
                $directory,
                0755,
                true
            );
        }

        $handle = fopen($destination, 'wb');

        if (!$handle) {
            throw new RuntimeException(
                "Tidak bisa membuat file: {$destination}"
            );
        }

        while (!$body->eof()) {
            fwrite(
                $handle,
                $body->read(1024 * 1024)
            );
        }

        fclose($handle);

        return $destination;
    }

    /*
    |--------------------------------------------------------------------------
    | Delete File
    |--------------------------------------------------------------------------
    */

    public function delete(string $fileId): bool
    {
        try {
            $this->service->files->delete($fileId);

            return true;
        } catch (\Throwable $e) {
            return false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | List Audio Files In Folder
    |--------------------------------------------------------------------------
    */

    public function listFiles(?string $folderId = null): array
    {
        $folderId = $folderId ?: env(
            'GOOGLE_DRIVE_FOLDER_ID'
        );

        $files = [];

        $pageToken = null;

        do {
            $params = [
                'q' =>
                "'{$folderId}' in parents
                    and trashed=false",

                'fields' =>
                'nextPageToken,files(id,name,mimeType,size,fileExtension)',

                'pageSize' => 1000,
            ];

            if ($pageToken) {
                $params['pageToken'] = $pageToken;
            }

            $response = $this->service
                ->files
                ->listFiles($params);

            foreach ($response->getFiles() as $file) {
                $files[] = $file;
            }

            $pageToken = $response->getNextPageToken();
        } while ($pageToken);

        return $files;
    }

    /*
    |--------------------------------------------------------------------------
    | Create Folder
    |--------------------------------------------------------------------------
    */

    public function createFolder(
        $folderName,
        $parentId = null
    ) {
        $fileMetadata = new DriveFile([
            'name' => $folderName,
            'mimeType' =>
            'application/vnd.google-apps.folder',
        ]);

        if ($parentId) {
            $fileMetadata->setParents([
                $parentId
            ]);
        }

        $folder = $this->service
            ->files
            ->create(
                $fileMetadata,
                [
                    'fields' => 'id,name'
                ]
            );

        return [
            'id' => $folder->id,
            'name' => $folder->name,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Find Folder
    |--------------------------------------------------------------------------
    */

    public function findFolder(
        $folderName,
        $parentId = null
    ) {
        $folderName = addslashes($folderName);

        $query = "
            mimeType='application/vnd.google-apps.folder'
            and name='{$folderName}'
            and trashed=false
        ";

        if ($parentId) {
            $query .= "
                and '{$parentId}' in parents
            ";
        }

        $folders = $this->service
            ->files
            ->listFiles([
                'q' => $query,
                'fields' => 'files(id,name)',
            ]);

        if (count($folders->files) > 0) {
            return [
                'id' => $folders->files[0]->id,
                'name' => $folders->files[0]->name,
            ];
        }

        return null;
    }
}
