<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $topSongIds = [];
        if ($request->user()) {
            $topSongIds = \App\Models\UserSongHistory::where('user_id', $request->user()->id)
                ->orderBy('play_count', 'desc')
                ->limit(15)
                ->pluck('song_id')
                ->toArray();
        }
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
                'top_song_ids' => $topSongIds,
            ],
            // Tambahkan baris ini untuk mengirim daftar playlist user
            'playlists' => $request->user()
                ? $request->user()->playlists()->latest()->get()
                : [],
        ]);
    }
}
