@extends('admin.layouts.app')

@section('title', 'Pilih Lagu Spotify')

@section('content')
<div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-1">Hasil Pencarian Spotify</h2>
            <p class="text-muted">Menampilkan hasil untuk: <strong>{{ $searchTitle }}</strong></p>
        </div>
        <a href="{{ route('songs.index') }}" class="btn btn-secondary">Kembali</a>
    </div>

    @if($results)
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            @foreach($results as $result)
                <div class="col">
                    <div class="card h-100 border-0 shadow-sm rounded-4">
                        <div class="row g-0 align-items-center h-100 p-3">
                            <div class="col-4">
                                <img src="{{ data_get($result, 'album.cover_xl') }}" class="img-fluid rounded-3 shadow-sm" alt="Album Cover">
                            </div>
                            <div class="col-8 ps-3">
                                <div class="card-body p-0">
                                    <h6 class="card-title fw-bold text-truncate mb-1" title="{{ data_get($result, 'track.name') }}">
                                        {{ data_get($result, 'track.name') }}
                                    </h6>
                                    <p class="text-muted small mb-1 text-truncate">
                                        <i class="bi bi-person"></i> {{ data_get($result, 'artist.name') }}
                                    </p>
                                    <p class="text-muted small mb-3 text-truncate">
                                        <i class="bi bi-disc"></i> {{ data_get($result, 'album.name') }}
                                    </p>
                                    
                                    @if($syncId)
                                        <form action="{{ route('songs.sync.update') }}" method="POST">
                                            @csrf
                                            <input type="hidden" name="sync_id" value="{{ $syncId }}">
                                            <input type="hidden" name="track_data" value="{{ json_encode($result) }}">
                                            <button type="submit" class="btn btn-sm btn-success rounded-pill w-100 shadow-sm">
                                                <i class="bi bi-check2-circle"></i> Pilih Lagu Ini
                                            </button>
                                        </form>
                                    @else
                                        <a href="#" class="btn btn-sm btn-primary rounded-pill w-100 shadow-sm disabled">
                                            Hanya untuk mode Sinkronisasi
                                        </a>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    @else
        <div class="alert alert-warning shadow-sm border-0">
            <i class="bi bi-exclamation-triangle-fill me-2"></i> Belum ada hasil pencarian atau pencarian kosong.
        </div>
    @endif
</div>
@endsection