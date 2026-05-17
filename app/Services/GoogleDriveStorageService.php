<?php

namespace App\Services;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Google\Service\Drive\Permission;

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
            'name' =>
            time() . '_' . $file->getClientOriginalName(),
        ]);

        // parent folder
        if ($parentId) {

            $metadata->setParents([
                $parentId
            ]);

        } else {

            $metadata->setParents([
                env('GOOGLE_DRIVE_FOLDER_ID')
            ]);
        }

        $uploadedFile = $this->service
            ->files
            ->create(
                $metadata,
                [
                    'data' => file_get_contents(
                        $file->getRealPath()
                    ),

                    'mimeType' =>
                    $file->getMimeType(),

                    'uploadType' => 'multipart',

                    'fields' => 'id,name'
                ]
            );

        // public permission
        $permission = new Permission([
            'type' => 'anyone',
            'role' => 'reader',
        ]);

        $this->service
            ->permissions
            ->create(
                $uploadedFile->id,
                $permission
            );

        return [

            'id' => $uploadedFile->id,

            'url' =>
            "https://drive.google.com/uc?export=download&id={$uploadedFile->id}"
        ];
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

        $folderName = addslashes(
            $folderName
        );

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