@extends('admin.layouts.app')

@section('title', 'Songs Library - Zalpe Admin')

@section('header_title', 'Songs Library')

@section('content')

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <!-- Wrapper Grid: 3 Kolom untuk Main Table, 1 Kolom untuk Sidebar -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">

        <!-- ================= BAGIAN KIRI: MAIN CONTENT (Col-span-3) ================= -->
        <div class="lg:col-span-3 space-y-6">

            <!-- Header -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-slate-800">Manage Songs</h2>
                    <p class="text-sm text-slate-500 mt-1">Manage and organize your music collection.</p>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                    <!-- Tombol Fetch Spotify -->
                    <a href="{{ route('songs.fetch') }}"
                        class="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-slate-800 transition shadow-sm">
                        <i class="bi bi-spotify text-emerald-400 text-lg"></i> Fetch from Spotify
                    </a>

                    <!-- Tombol Add Manual -->
                    <a href="{{ route('songs.create') }}"
                        class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 transition shadow-sm">
                        <i class="bi bi-plus-lg"></i> Add Manual
                    </a>
                </div>
            </div>

            <!-- Success Alert -->
            @if (session('success'))
                <div class="flex items-center justify-between p-4 text-sm text-emerald-800 rounded-lg bg-emerald-50 border border-emerald-200 shadow-sm"
                    role="alert">
                    <div class="flex items-center gap-2">
                        <i class="bi bi-check-circle-fill text-lg text-emerald-600"></i>
                        <span class="font-medium">{{ session('success') }}</span>
                    </div>
                    <button type="button" onclick="this.closest('[role=\'alert\']').remove()"
                        class="text-emerald-600 hover:text-emerald-800 transition">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            @endif
            @if (session('error'))
                <div class="flex items-center justify-between p-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200 shadow-sm mb-4"
                    role="alert">
                    <div class="flex items-center gap-2">
                        <i class="bi bi-exclamation-triangle-fill text-lg text-red-600"></i>
                        <span class="font-medium">{{ session('error') }}</span>
                    </div>
                    <button type="button" onclick="this.closest('[role=\'alert\']').remove()"
                        class="text-red-600 hover:text-red-800 transition">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            @endif
            @if ($errors->any())
                <div class="flex flex-col gap-2 p-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200 shadow-sm mb-4"
                    role="alert">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="bi bi-exclamation-triangle-fill text-lg text-red-600"></i>
                            <span class="font-bold">Oops! Ada yang salah:</span>
                        </div>
                        <button type="button" onclick="this.closest('[role=\'alert\']').remove()"
                            class="text-red-600 hover:text-red-800 transition">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                    <ul class="list-disc list-inside mt-1 ml-1 text-red-700">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <!-- Main Card / Table Wrapper -->
            <div class="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                                <th class="px-6 py-4 font-semibold w-24">Cover</th>
                                <th class="px-6 py-4 font-semibold">Song Details</th>
                                <th class="px-6 py-4 font-semibold">Artist & Album</th>
                                <th class="px-6 py-4 font-semibold">Duration</th>
                                <th class="px-6 py-4 font-semibold">Provider</th>
                                <th class="px-6 py-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            @forelse ($songs as $song)
                                <tr class="hover:bg-slate-50/50 transition-colors">
                                    <td class="px-6 py-4">
                                        @if ($song->cover_medium)
                                            <img src="{{ $song->cover_medium }}"
                                                class="w-14 h-14 rounded-xl object-cover shadow-sm border border-slate-100"
                                                alt="Cover">
                                        @else
                                            <div
                                                class="w-14 h-14 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shadow-sm border border-slate-100">
                                                <i class="bi bi-music-note-beamed text-2xl"></i>
                                            </div>
                                        @endif
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="font-semibold text-slate-800 text-base">{{ $song->title }}</div>
                                        @if ($song->title_version)
                                            <span
                                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 mt-1.5">
                                                {{ $song->title_version }}
                                            </span>
                                        @endif
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="font-medium text-slate-800">
                                            {{ $song->artist?->name ?? 'Unknown Artist' }}
                                        </div>
                                        <div class="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                            <i class="bi bi-disc"></i> {{ $song->album->title ?? 'Unknown Album' }}
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-slate-600 font-medium">
                                        <div class="flex items-center gap-1.5">
                                            <i class="bi bi-clock"></i> {{ gmdate('i:s', $song->duration) }}
                                        </div>
                                    </td>
                                    <td class="px-6 py-4">
                                        @php
                                            $providerStr = strtolower($song->provider ?? 'manual');
                                            $badgeClass = match ($providerStr) {
                                                'spotify' => 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                                'google' => 'bg-blue-50 text-blue-700 border-blue-200',
                                                default => 'bg-slate-50 text-slate-700 border-slate-200',
                                            };
                                            $iconClass = match ($providerStr) {
                                                'spotify' => 'bi-spotify',
                                                'google' => 'bi-google',
                                                default => 'bi-music-player',
                                            };
                                        @endphp
                                        <span
                                            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border {{ $badgeClass }}">
                                            <i class="bi {{ $iconClass }}"></i>
                                            {{ ucfirst($song->provider ?? 'Manual') }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="flex items-center justify-center gap-2">
                                            @if ($song->preview_url)
                                                <button data-target="#previewModal{{ $song->id }}"
                                                    class="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition shadow-sm"
                                                    title="Preview Audio">
                                                    <i class="bi bi-play-fill text-lg"></i>
                                                </button>
                                            @endif
                                            @if ($song->audio_path)
                                                <a href="/stream/{{ $song->id }}" target="_blank"
                                                    class="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition shadow-sm"
                                                    title="Stream Full Audio">
                                                    <i class="bi bi-earbuds"></i>
                                                </a>
                                            @endif
                                            <a href="{{ route('songs.fetch', ['title' => $song->title, 'sync_id' => $song->id]) }}"
                                                class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition shadow-sm"
                                                title="Sync Metadata">
                                                <i class="bi bi-arrow-repeat"></i> Sync
                                            </a>
                                            <a href="{{ route('songs.edit', $song->id) }}"
                                                class="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-white border border-slate-200 text-amber-500 hover:bg-amber-50 hover:border-amber-200 transition shadow-sm"
                                                title="Edit Song">
                                                <i class="bi bi-pencil-square"></i>
                                            </a>
                                            <form action="{{ route('songs.destroy', $song->id) }}" method="POST"
                                                onsubmit="return confirm('Are you sure you want to delete this song?')"
                                                class="inline-block">
                                                @csrf
                                                @method('DELETE')
                                                <button
                                                    class="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition shadow-sm"
                                                    title="Delete Song">
                                                    <i class="bi bi-trash3"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="px-6 py-16 text-center">
                                        <div class="flex flex-col items-center justify-center">
                                            <div
                                                class="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                                <i class="bi bi-music-note-list text-slate-400 text-4xl"></i>
                                            </div>
                                            <h5 class="text-lg font-bold text-slate-800 mb-1">No songs found</h5>
                                            <p class="text-sm text-slate-500 mb-5">Your music library is currently empty.
                                            </p>
                                            <a href="{{ route('songs.create') }}"
                                                class="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-sm font-semibold rounded-full transition">
                                                <i class="bi bi-plus-lg"></i> Add Your First Song
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                @if (method_exists($songs, 'links') && $songs->hasPages())
                    <div class="px-6 py-4 border-t border-slate-200 bg-slate-50">
                        {{ $songs->links() }}
                    </div>
                @endif
            </div>

        </div>

        <!-- ================= BAGIAN KANAN: SIDEBAR SYNC (Col-span-1) ================= -->
        <div class="lg:col-span-1">
            <div class="bg-white border border-slate-200 shadow-sm rounded-xl p-5 sticky top-6">

                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-bold text-slate-800 flex items-center gap-2">
                        <i class="bi bi-exclamation-circle-fill text-amber-500"></i> Needs Sync
                    </h3>
                    <span class="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {{ $needsSyncSongs->count() }}
                    </span>
                </div>

                <p class="text-xs text-slate-500 mb-4">These songs are manually added or missing metadata. Sync them with
                    Spotify to get covers and details.</p>

                <div class="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                    @forelse($needsSyncSongs as $syncSong)
                        <div
                            class="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-slate-200 transition">
                            <!-- Info Singkat -->
                            <div class="flex-1 min-w-0 pr-2">
                                <p class="text-sm font-semibold text-slate-800 truncate" title="{{ $syncSong->title }}">
                                    {{ $syncSong->title }}
                                </p>
                                <p class="text-xs text-slate-500 truncate">
                                    {{ $syncSong->artist?->name ?? 'Unknown' }}
                                </p>
                            </div>

                            <!-- Tombol Sync Kecil -->
                            <a href="{{ route('songs.fetch', ['title' => $syncSong->title, 'sync_id' => $syncSong->id]) }}"
                                class="shrink-0 inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition shadow-sm"
                                title="Sync with Spotify">
                                <i class="bi bi-arrow-repeat text-sm"></i>
                            </a>
                        </div>
                    @empty
                        <div class="text-center py-6">
                            <i class="bi bi-check-circle text-emerald-400 text-3xl mb-2 block"></i>
                            <p class="text-sm text-slate-600 font-medium">All songs are synced!</p>
                            <p class="text-xs text-slate-400 mt-1">Great job organizing your library.</p>
                        </div>
                    @endforelse
                </div>

            </div>
        </div>

    </div>

@endsection
