<?php

namespace App\Http\Controllers;

use Google\Client;
use Illuminate\Http\Request;

class GoogleDriveController extends Controller
{
    public function token()
    {
        $client = new Client();

        $client->setClientId(
            env('GOOGLE_DRIVE_CLIENT_ID')
        );

        $client->setClientSecret(
            env('GOOGLE_DRIVE_CLIENT_SECRET')
        );

        $client->setRedirectUri(
            url('/google-callback')
        );

        $client->addScope(
            'https://www.googleapis.com/auth/drive'
        );

        $client->setAccessType('offline');

        $client->setPrompt('consent');

        return redirect(
            $client->createAuthUrl()
        );
    }

    public function callback(Request $request)
    {
        $client = new Client();

        $client->setClientId(
            env('GOOGLE_DRIVE_CLIENT_ID')
        );

        $client->setClientSecret(
            env('GOOGLE_DRIVE_CLIENT_SECRET')
        );

        $client->setRedirectUri(
            url('/google-callback')
        );

        $token = $client->fetchAccessTokenWithAuthCode(
            $request->code
        );

        dd($token);
    }
}
