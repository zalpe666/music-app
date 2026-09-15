@extends('admin.layouts.app')

@section('title', 'Dashboard - Zalpe Admin')

@section('header_title', 'Dashboard Overview')

@section('content')

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <div class="space-y-6">

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-slate-800">Welcome back, Admin! 👋</h2>
                <p class="text-sm text-slate-500 mt-1">Here is what's happening with your music library today.</p>
            </div>
            <div class="flex items-center gap-3">
                <a href="{{ route('songs.create') }}"
                    class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition shadow-sm">
                    <i class="bi bi-plus-lg"></i> Add New Song
                </a>
            </div>
        </div>
        <div class="flex items-center justify-between mb-6">

            <div>
                <h2 class="text-xl font-semibold text-gray-800">
                    Songs
                </h2>

                <p class="text-sm text-gray-500">
                    Kelola koleksi lagu.
                </p>
            </div>

            <form action="{{ route('admin.songs.bulk-convert-mp3') }}" method="POST"
                onsubmit="return confirm(
            'Convert semua lagu yang belum MP3 ke MP3? Proses akan berjalan di background.'
        )">
                @csrf

                <button type="submit"
                    class="inline-flex items-center gap-2 px-4 py-2.5
                   bg-blue-600 hover:bg-blue-700
                   text-white text-sm font-medium
                   rounded-lg transition">
                    <i class="ri-refresh-line"></i>

                    Bulk Convert MP3
                </button>
            </form>

        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                    <i class="bi bi-music-note-list"></i>
                </div>
                <div>
                    <p class="text-sm text-slate-500 font-medium">Total Songs</p>
                    <h3 class="text-2xl font-bold text-slate-800">{{ number_format($stats['total_songs']) }}</h3>
                </div>
            </div>

            <div class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center text-xl">
                    <i class="bi bi-mic"></i>
                </div>
                <div>
                    <p class="text-sm text-slate-500 font-medium">Total Artists</p>
                    <h3 class="text-2xl font-bold text-slate-800">{{ number_format($stats['total_artists']) }}</h3>
                </div>
            </div>

            <div class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                    <i class="bi bi-disc"></i>
                </div>
                <div>
                    <p class="text-sm text-slate-500 font-medium">Total Albums</p>
                    <h3 class="text-2xl font-bold text-slate-800">{{ number_format($stats['total_albums']) }}</h3>
                </div>
            </div>

            <div
                class="bg-white rounded-xl p-5 border {{ $stats['needs_sync'] > 0 ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200' }} shadow-sm flex items-center gap-4">
                <div
                    class="w-12 h-12 rounded-full {{ $stats['needs_sync'] > 0 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-50 text-emerald-600' }} flex items-center justify-center text-xl">
                    <i class="bi {{ $stats['needs_sync'] > 0 ? 'bi-exclamation-triangle' : 'bi-check2-circle' }}"></i>
                </div>
                <div>
                    <p class="text-sm text-slate-500 font-medium">Pending Sync</p>
                    <h3 class="text-2xl font-bold {{ $stats['needs_sync'] > 0 ? 'text-amber-700' : 'text-slate-800' }}">
                        {{ number_format($stats['needs_sync']) }}</h3>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div class="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col">
                <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 class="font-bold text-slate-800">Recently Added</h3>
                    <a href="{{ route('songs.index') }}" class="text-sm text-indigo-600 hover:underline font-medium">View
                        All</a>
                </div>
                <div class="p-0 overflow-x-auto">
                    <table class="w-full text-left whitespace-nowrap">
                        <tbody class="divide-y divide-slate-100">
                            @forelse ($recentSongs as $song)
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td class="px-5 py-3 w-12">
                                        <img src="{{ $song->cover_medium ?? '/default-cover.png' }}"
                                            class="w-10 h-10 rounded-md object-cover shadow-sm bg-slate-100" alt="Cover">
                                    </td>
                                    <td class="px-5 py-3">
                                        <p class="font-semibold text-slate-800 text-sm">{{ $song->title }}</p>
                                        <p class="text-xs text-slate-500 mt-0.5">
                                            {{ $song->artist?->name ?? 'Unknown Artist' }}</p>
                                    </td>
                                    <td class="px-5 py-3 text-right">
                                        {{-- <span
                                            class="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                            {{ $song->created_at->diffForHumans() }}
                                        </span> --}}
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="3" class="px-5 py-8 text-center text-sm text-slate-500">No songs added
                                        yet.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="lg:col-span-1 bg-white border border-slate-200 shadow-sm rounded-xl flex flex-col">
                <div class="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 class="font-bold text-slate-800 flex items-center gap-2">
                        <i class="bi bi-spotify text-emerald-500"></i> Needs Sync
                    </h3>
                </div>
                <div class="p-4 flex-1">
                    @if ($needsSyncSongs->count() > 0)
                        <div class="space-y-3">
                            @foreach ($needsSyncSongs as $syncSong)
                                <div
                                    class="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-300 transition">
                                    <div class="flex-1 min-w-0 pr-3">
                                        <p class="text-sm font-bold text-slate-800 truncate">{{ $syncSong->title }}</p>
                                        <p class="text-xs text-slate-500 truncate">
                                            {{ $syncSong->artist?->name ?? 'Unknown' }}</p>
                                    </div>
                                    <a href="{{ route('songs.fetch', ['title' => $syncSong->title, 'sync_id' => $syncSong->id]) }}"
                                        class="shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition"
                                        title="Sync now">
                                        <i class="bi bi-cloud-arrow-down-fill text-sm"></i>
                                    </a>
                                </div>
                            @endforeach
                        </div>
                        <div class="mt-4 text-center">
                            <a href="{{ route('songs.index') }}"
                                class="text-xs font-semibold text-slate-500 hover:text-slate-800 transition">See all
                                unsynced tracks &rarr;</a>
                        </div>
                    @else
                        <div class="h-full flex flex-col items-center justify-center text-center py-8">
                            <div class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                                <i class="bi bi-check2-all text-3xl text-emerald-500"></i>
                            </div>
                            <h4 class="font-bold text-slate-800 text-sm">All Caught Up!</h4>
                            <p class="text-xs text-slate-500 mt-1">Every song in your library has been synced with Spotify
                                metadata.</p>
                        </div>
                    @endif
                </div>
            </div>

        </div>
    </div>
@endsection
