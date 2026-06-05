@extends('admin.layouts.app')

@section('title', 'Pilih Lagu Spotify - Zalpe Admin')

{{-- Kirim ke Top Header Layout --}}
@section('header_title', 'Sinkronisasi Spotify')

@section('content')

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <div class="space-y-6">

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-slate-800">Hasil Pencarian</h2>
                <p class="text-sm text-slate-500 mt-1">
                    Menampilkan hasil untuk: <span class="font-semibold text-slate-700">"{{ $searchTitle }}"</span>
                </p>
            </div>

            <a href="{{ route('songs.index') }}"
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-full hover:bg-slate-50 hover:text-slate-900 transition shadow-sm">
                <i class="bi bi-arrow-left"></i> Kembali
            </a>
        </div>

        @if ($results)
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                @foreach ($results as $result)
                    <div
                        class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 p-4">
                        <div class="flex gap-4">

                            <div class="shrink-0">
                                @if (data_get($result, 'album.cover_xl'))
                                    <img src="{{ data_get($result, 'album.cover_xl') }}"
                                        class="w-24 h-24 object-cover rounded-xl shadow-sm border border-slate-100"
                                        alt="Album Cover">
                                @else
                                    <div
                                        class="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-100 shadow-sm text-slate-400">
                                        <i class="bi bi-music-note-beamed text-3xl"></i>
                                    </div>
                                @endif
                            </div>

                            <div class="flex flex-col min-w-0 flex-1">
                                <div>
                                    <h6 class="text-base font-bold text-slate-800 truncate"
                                        title="{{ data_get($result, 'track.name') }}">
                                        {{ data_get($result, 'track.name') }}
                                    </h6>
                                    <div class="text-sm text-slate-500 mt-0.5 space-y-0.5">
                                        <p class="truncate flex items-center gap-1.5"
                                            title="{{ data_get($result, 'artist.name') }}">
                                            <i class="bi bi-person-fill text-slate-400"></i>
                                            {{ data_get($result, 'artist.name') }}
                                        </p>
                                        <p class="truncate flex items-center gap-1.5"
                                            title="{{ data_get($result, 'album.name') }}">
                                            <i class="bi bi-disc-fill text-slate-400"></i>
                                            {{ data_get($result, 'album.name') }}
                                        </p>
                                    </div>
                                </div>

                                <div class="mt-auto pt-3">
                                    @if ($syncId)
                                        <form action="{{ route('songs.sync.update') }}" method="POST" class="m-0">
                                            @csrf
                                            <input type="hidden" name="sync_id" value="{{ $syncId }}">
                                            {{-- Pastikan json_encode aman di dalam atribut value (Laravel otomatis melakukan escaping) --}}
                                            <input type="hidden" name="track_data" value="{{ json_encode($result) }}">

                                            <button type="submit"
                                                class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                                                <i class="bi bi-check2-circle text-lg"></i> Pilih Lagu
                                            </button>
                                        </form>
                                    @else
                                        <button type="button"
                                            class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-400 border border-slate-200 text-xs font-medium rounded-xl cursor-not-allowed"
                                            disabled>
                                            Hanya mode Sync
                                        </button>
                                    @endif
                                </div>
                            </div>

                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                <div
                    class="w-16 h-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <i class="bi bi-exclamation-triangle-fill text-amber-500 text-2xl"></i>
                </div>
                <h5 class="text-lg font-bold text-slate-800 mb-1">Pencarian Tidak Ditemukan</h5>
                <p class="text-sm text-slate-500">Kami tidak dapat menemukan lagu dengan kata kunci tersebut di Spotify.
                    Silakan coba menggunakan kata kunci yang lebih spesifik.</p>
            </div>
        @endif

    </div>

@endsection
