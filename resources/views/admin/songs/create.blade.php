@extends('admin.layouts.app')

@section('title', 'Add Song')

@section('content')

    <div class="container-fluid">

        <!-- Header -->
        <div class="mb-4">

            <h1 class="fw-bold">
                Add Song
            </h1>

            <p class="text-muted">
                Search song metadata from Deezer and upload audio
            </p>

        </div>

        <!-- Error -->
        @if ($errors->any())

            <div class="alert alert-danger">

                <ul class="mb-0">

                    @foreach ($errors->all() as $error)
                        <li>
                            {{ $error }}
                        </li>
                    @endforeach

                </ul>

            </div>

        @endif

        <!-- Card -->
        <div class="card border-0 shadow-sm">

            <div class="card-body p-4">

                <form action="{{ route('songs.store') }}" method="POST" enctype="multipart/form-data">

                    @csrf

                    <!-- Search -->
                    <div class="mb-4">

                        <label class="form-label fw-semibold">
                            Search Song From Deezer
                        </label>

                        <input type="text" id="deezer_search_keyword" placeholder="Example: Alan Walker Faded"
                            class="form-control">

                    </div>

                    <!-- Results -->
                    <div id="deezer_search_results" class="row  mb-4 overflow-auto" style="max-height:400px;"></div>

                    <!-- Hidden -->
                    <input type="hidden" name="deezer_track_id">
                    <input type="hidden" name="title_short">
                    <input type="hidden" name="title_version">
                    <input type="hidden" name="isrc">
                    <input type="hidden" name="duration">
                    <input type="hidden" name="explicit_lyrics">
                    <input type="hidden" name="rank">

                    <input type="hidden" name="cover_small">
                    <input type="hidden" name="cover_medium">
                    <input type="hidden" name="cover_big">
                    <input type="hidden" name="cover_xl">

                    <input type="hidden" name="preview_url">

                    <input type="hidden" name="artist_deezer_id">
                    <input type="hidden" name="artist_picture_small">
                    <input type="hidden" name="artist_picture_medium">
                    <input type="hidden" name="artist_picture_big">
                    <input type="hidden" name="artist_picture_xl">

                    <input type="hidden" name="album_deezer_id">

                    <!-- Song Title -->
                    <div class="mb-3">

                        <label class="form-label fw-semibold">
                            Song Title
                        </label>

                        <input type="text" name="song_title" class="form-control" id="song_title">

                    </div>

                    <!-- Artist -->
                    <div class="mb-3">

                        <label class="form-label fw-semibold">
                            Artist
                        </label>

                        <input type="text" name="artist_name" class="form-control" id="artist_name">

                    </div>
                    <button type="button" class="btn btn-primary mt-2" onclick="copySongData()">
                        Copy Gabungan (Artist - Title)
                    </button>
                    <!-- Album -->
                    <div class="mb-3">

                        <label class="form-label fw-semibold">
                            Album
                        </label>

                        <input type="text" name="album_name" class="form-control">

                    </div>

                    <!-- Audio -->
                    <div class="mb-3">

                        <label class="form-label fw-semibold">
                            Audio File
                        </label>

                        <input type="file" name="audio_file" accept=".mp3,audio/*" class="form-control">

                    </div>

                    <!-- Lyrics -->
                    <div class="mb-4">
                        <label class="form-label fw-semibold">
                            Lyrics
                        </label>

                        <textarea name="lyrics" class="form-control" rows="10" placeholder="[00:12.00] Hello world..."></textarea>
                    </div>

                    <!-- Button -->
                    <button class="btn btn-primary w-100 py-3 fw-bold">
                        Save Song
                    </button>

                </form>

            </div>

        </div>

    </div>
    <script>
        function combineData() {
            const title = document.getElementById('song_title').value;
            const artist = document.getElementById('artist_name').value;
            document.getElementById('full_title').value = `${artist} - ${title}`;
        }
    </script>
    <script>
        let debounce;

        const searchInput = document.getElementById(
            'deezer_search_keyword'
        );

        const resultContainer = document.getElementById(
            'deezer_search_results'
        );

        searchInput.addEventListener('keyup', function() {

            clearTimeout(debounce);

            debounce = setTimeout(() => {

                searchDeezer(this.value);

            }, 400);

        });

        async function searchDeezer(keyword) {

            if (keyword.length < 2) {

                resultContainer.innerHTML = '';

                return;
            }

            resultContainer.innerHTML = `
            <div class="col-12 text-center">
                Searching...
            </div>
        `;

            try {

                const response = await fetch(
                    `/admin/songs/search?q=${encodeURIComponent(keyword)}`
                );

                const json = await response.json();

                resultContainer.innerHTML = '';

                if (!json.data || json.data.length === 0) {

                    resultContainer.innerHTML = `
                    <div class="col-12 text-center py-4">
                        No result
                    </div>
                `;

                    return;
                }

                json.data.forEach(track => {

                    const item = document.createElement('div');

                    item.className = 'col-md-4';

                    item.innerHTML = `
                    <div class="card shadow-sm border-0 song-card"
                        style="cursor:pointer">

                        <div class="card-body">

                            <div class="d-flex gap-3">

                                <img
                                    src="${track.album.cover_medium}"
                                    width="100"
                                    class="rounded"
                                >

                                <div class="flex-grow-1">

                                    <h5 class="fw-bold">
                                        ${track.title}
                                    </h5>

                                    <p class="mb-1 text-muted">
                                        ${track.artist.name}
                                    </p>

                                    <p class="small text-secondary">
                                        ${track.album.title}
                                    </p>

                                    <audio
                                        controls
                                        class="w-100"
                                    >
                                        <source
                                            src="${track.preview}"
                                            type="audio/mpeg"
                                        >
                                    </audio>

                                </div>

                            </div>

                        </div>

                    </div>
                `;

                    item.addEventListener('click', function() {

                        selectSong(track);

                    });

                    resultContainer.appendChild(item);

                });

            } catch (err) {

                console.log(err);

                resultContainer.innerHTML = `
                <div class="col-12 text-center text-danger py-4">
                    Failed load Deezer API
                </div>
            `;
            }
        }

        function selectSong(track) {

            document.querySelector(
                '[name="song_title"]'
            ).value = track.title;

            document.querySelector(
                '[name="artist_name"]'
            ).value = track.artist.name;

            document.querySelector(
                '[name="album_name"]'
            ).value = track.album.title;

            document.querySelector(
                '[name="deezer_track_id"]'
            ).value = track.id;

            document.querySelector(
                '[name="title_short"]'
            ).value = track.title_short || '';

            document.querySelector(
                '[name="title_version"]'
            ).value = track.title_version || '';

            document.querySelector(
                '[name="isrc"]'
            ).value = track.isrc || '';

            document.querySelector(
                '[name="duration"]'
            ).value = track.duration || 0;

            document.querySelector(
                '[name="explicit_lyrics"]'
            ).value = track.explicit_lyrics ? 1 : 0;

            document.querySelector(
                '[name="rank"]'
            ).value = track.rank || 0;

            document.querySelector(
                '[name="cover_small"]'
            ).value = track.album.cover_small || '';

            document.querySelector(
                '[name="cover_medium"]'
            ).value = track.album.cover_medium || '';

            document.querySelector(
                '[name="cover_big"]'
            ).value = track.album.cover_big || '';

            document.querySelector(
                '[name="cover_xl"]'
            ).value = track.album.cover_xl || '';

            document.querySelector(
                '[name="preview_url"]'
            ).value = track.preview || '';
            document.querySelector(
                '[name="artist_deezer_id"]'
            ).value = track.artist.id;

            document.querySelector(
                '[name="artist_picture_small"]'
            ).value = track.artist.picture_small || '';

            document.querySelector(
                '[name="artist_picture_medium"]'
            ).value = track.artist.picture_medium || '';

            document.querySelector(
                '[name="artist_picture_big"]'
            ).value = track.artist.picture_big || '';

            document.querySelector(
                '[name="artist_picture_xl"]'
            ).value = track.artist.picture_xl || '';

            document.querySelector(
                '[name="album_deezer_id"]'
            ).value = track.album.id;
            alert('Song selected!');
        }
    </script>

@endsection
