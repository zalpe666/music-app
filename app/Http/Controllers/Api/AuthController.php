<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validasi Input
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 2. Cek User
        $user = User::where('email', $request->email)->first();

        // 3. Validasi Password
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Data login tidak cocok.'],
            ]);
        }

        // 4. Generate Token Sanctum
        $token = $user->createToken('zalpe-music-app')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'token' => $token,
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        // 5. Revoke (Hapus) token yang sedang dipakai
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Berhasil logout'
        ]);
    }
}
