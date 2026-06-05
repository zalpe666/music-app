@extends('admin.layouts.app')

@section('title', 'Songs Library - Zalpe Admin')

{{-- Mengirim variabel title ke Top Header di Layout --}}
@section('header_title', 'Songs Library')

@section('content')

    <!-- Bootstrap Icons (Dipertahankan karena Anda menggunakan icon spesifik seperti Spotify/Google) -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <div class="space-y-6">

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
                <!-- Tombol Close (Menggunakan JS Native sederhana) -->
                <button type="button" onclick="this.closest('[role=\'alert\']').remove()"
                    class="text-emerald-600 hover:text-emerald-800 transition">
                    <i class="bi bi-x-lg"></i>
                </button>
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

                                <!-- Cover -->
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

                                <!-- Song Details -->
                                <td class="px-6 py-4">
                                    <div class="font-semibold text-slate-800 text-base">{{ $song->title }}</div>
                                    @if ($song->title_version)
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 mt-1.5">
                                            {{ $song->title_version }}
                                        </span>
                                    @endif
                                </td>

                                <!-- Artist & Album -->
                                <td class="px-6 py-4">
                                    <div class="font-medium text-slate-800">{{ $song->artist?->name ?? 'Unknown Artist' }}
                                    </div>
                                    <div class="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                        <i class="bi bi-disc"></i> {{ $song->album->title ?? 'Unknown Album' }}
                                    </div>
                                </td>

                                <!-- Duration -->
                                <td class="px-6 py-4 text-sm text-slate-600 font-medium">
                                    <div class="flex items-center gap-1.5">
                                        <i class="bi bi-clock"></i> {{ gmdate('i:s', $song->duration) }}
                                    </div>
                                </td>

                                <!-- Provider -->
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

                                <!-- Actions -->
                                <td class="px-6 py-4">
                                    <div class="flex items-center justify-center gap-2">

                                        {{-- Catatan: atribut data-bs-target bawaan Bootstrap diganti class/id.
                                             Jika modal masih butuh trigger, sesuaikan dengan JS yang dipakai (misal Alpine.js) --}}
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
                            <!-- Empty State -->
                            <tr>
                                <td colspan="6" class="px-6 py-16 text-center">
                                    <div class="flex flex-col items-center justify-center">
                                        <div
                                            class="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                            <i class="bi bi-music-note-list text-slate-400 text-4xl"></i>
                                        </div>
                                        <h5 class="text-lg font-bold text-slate-800 mb-1">No songs found</h5>
                                        <p class="text-sm text-slate-500 mb-5">Your music library is currently empty.</p>
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

            <!-- Pagination (Sudah support Tailwind secara bawaan di Laravel 8+) -->
            @if (method_exists($songs, 'links') && $songs->hasPages())
                <div class="px-6 py-4 border-t border-slate-200 bg-slate-50">
                    {{-- Hapus 'pagination::bootstrap-5' agar Laravel memakai style Tailwind --}}
                    {{ $songs->links() }}
                </div>
            @endif

        </div>
    </div>

@endsection
