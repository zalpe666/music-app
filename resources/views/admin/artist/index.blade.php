@extends('admin.layouts.app')

@section('title', 'Daftar Artis - Zalpe Admin')

{{-- Kirim ke Top Header Layout --}}
@section('header_title', 'Manajemen Artis')

@section('content')

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <div class="space-y-6">

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-slate-800">Daftar Artis</h2>
                <p class="text-sm text-slate-500 mt-1">Kelola data artis dan sinkronisasi informasi secara berkala.</p>
            </div>

            <div class="flex items-center gap-3">
                <form action="{{ route('admin.artists.syncAll') }}" method="POST" class="m-0">
                    @csrf
                    <button type="submit"
                        onclick="return confirm('Apakah Anda yakin ingin melakukan sinkronisasi untuk semua artis? Proses ini mungkin memakan waktu.')"
                        class="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-full hover:bg-amber-600 transition shadow-sm">
                        <i class="bi bi-cloud-arrow-down-fill text-lg"></i> Sync Semua Artis
                    </button>
                </form>
            </div>
        </div>

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

        <div class="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                            <th class="px-6 py-4 font-semibold">Nama Artis</th>
                            <th class="px-6 py-4 font-semibold">Genre</th>
                            <th class="px-6 py-4 font-semibold">Mood</th>
                            <th class="px-6 py-4 font-semibold w-1/3">Bio (Snippet)</th>
                            <th class="px-6 py-4 font-semibold text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @forelse ($artists as $artist)
                            <tr class="hover:bg-slate-50/50 transition-colors">

                                <td class="px-6 py-4">
                                    <div class="font-bold text-slate-800 text-base flex items-center gap-3">
                                        @if ($artist->picture_xl)
                                            <img src="{{ $artist->picture_xl }}" alt="{{ $artist->name }}"
                                                class="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm">
                                        @else
                                            <div
                                                class="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
                                                <i class="bi bi-person-fill"></i>
                                            </div>
                                        @endif

                                        {{ $artist->name }}
                                    </div>
                                </td>

                                <td class="px-6 py-4">
                                    @if ($artist->strGenre)
                                        <span
                                            class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                                            {{ $artist->strGenre }}
                                        </span>
                                    @else
                                        <span class="text-slate-400 text-sm">-</span>
                                    @endif
                                </td>

                                <td class="px-6 py-4">
                                    @if ($artist->strMood)
                                        <span
                                            class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                            {{ $artist->strMood }}
                                        </span>
                                    @else
                                        <span class="text-slate-400 text-sm">-</span>
                                    @endif
                                </td>

                                <td class="px-6 py-4">
                                    <p class="text-sm text-slate-500 whitespace-normal leading-relaxed line-clamp-2"
                                        title="{{ $artist->bio }}">
                                        {{ Str::limit($artist->bio, 75, '...') ?: 'Tidak ada bio yang tersedia.' }}
                                    </p>
                                </td>

                                <td class="px-6 py-4 text-center">
                                    <div class="flex items-center justify-center">
                                        <form action="{{ route('admin.artists.sync', $artist->id) }}" method="POST"
                                            class="m-0">
                                            @csrf
                                            <button type="submit"
                                                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition shadow-sm"
                                                title="Sinkronisasi Data Artis Ini">
                                                <i class="bi bi-arrow-repeat"></i> Sync Data
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="px-6 py-12 text-center">
                                    <div class="flex flex-col items-center justify-center">
                                        <div
                                            class="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-3 shadow-sm">
                                            <i class="bi bi-people text-slate-400 text-3xl"></i>
                                        </div>
                                        <h5 class="text-base font-bold text-slate-800 mb-1">Belum ada artis</h5>
                                        <p class="text-sm text-slate-500">Data artis kosong. Silakan lakukan sinkronisasi
                                            atau tambahkan lagu baru.</p>
                                    </div>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            @if (method_exists($artists, 'links') && $artists->hasPages())
                <div class="px-6 py-4 border-t border-slate-200 bg-slate-50">
                    {{ $artists->links() }}
                </div>
            @endif

        </div>
    </div>

@endsection
