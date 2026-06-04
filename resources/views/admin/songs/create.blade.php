@extends('admin.layouts.app')

@section('title', 'Add Song')

@section('content')

<div class="container-fluid">

    <div class="mb-4">
        <h1 class="fw-bold">Add Song</h1>
        <p class="text-muted">Search song metadata from Deezer/Spotify and upload audio</p>
    </div>

    @if ($errors->any())
        <div class="alert alert-danger">
            <ul class="mb-0">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
            <form action="{{ route('songs.store') }}" method="POST" enctype="multipart/form-data">
                @csrf

                @if(request('spotify_id'))
                    <div class="alert alert-success d-flex align-items-center mb-4">
                        @if(request('cover_xl'))
                            <img src="{{ request('cover_xl') }}" width="50" height="50" class="rounded me-3 object-fit-cover">
                        @endif
                        <div>
                            <strong><i class="bi bi-spotify me-1"></i> Data Spotify Berhasil Dimuat!</strong><br>
                            <small>Metadata telah otomatis diisi ke dalam form di bawah.</small>
                        </div>
                    </div>
                @endif

                <div class="mb-4">
                    <label class="form-label fw-semibold">Search Song From Deezer (Opsional)</label>
                    <input type="text" id="deezer_search_keyword" placeholder="Example: Alan Walker Faded" class="form-control">
                </div>
                <div id="deezer_search_results" class="row mb-4 overflow-auto" style="max-height:400px;"></div>

                <input type="text" name="spotify_id" value="{{ old('spotify_id', request('spotify_id')) }}">
                <input type="text" name="artists_raw" value="{{ request('artists_raw') }}">
                <input type="text" name="deezer_track_id">
                <input type="text" name="title_short">
                <input type="text" name="title_version">
                <input type="text" name="isrc">
                <input type="text" name="duration" value="{{ old('duration', request('duration')) }}">
                <input type="text" name="explicit_lyrics">
                <input type="text" name="rank">

                <input type="text" name="cover_small">
                <input type="text" name="cover_medium">
                <input type="text" name="cover_big">
                <input type="text" name="cover_xl" value="{{ old('cover_xl', request('cover_xl')) }}">

                <input type="text" name="preview_url" value="{{ old('preview_url', request('preview_url')) }}">

                <input type="text" name="artist_deezer_id">
                <input type="text" name="artist_picture_small">
                <input type="text" name="artist_picture_medium">
                <input type="text" name="artist_picture_big">
                <input type="text" name="artist_picture_xl">

                <input type="text" name="album_deezer_id">

                <div class="mb-3">
                    <label class="form-label fw-semibold">Song Title</label>
                    <input type="text" name="song_title" class="form-control" id="song_title" value="{{ old('song_title', request('song_title')) }}" required>
                </div>

                <div class="mb-3">
                    <label class="form-label fw-semibold">Artist</label>
                    <input type="text" name="artist_name" class="form-control" id="artist_name" value="{{ old('artist_name', request('artist_name')) }}" required>
                </div>

                <input type="hidden" name="full_title" id="full_title">
                <button type="button" class="btn btn-secondary btn-sm mb-3" onclick="combineData()">
                    Copy Gabungan (Artist - Title)
                </button>

                <div class="mb-3">
                    <label class="form-label fw-semibold">Album</label>
                    <input type="text" name="album_name" class="form-control" value="{{ old('album_name', request('album_name')) }}" required>
                </div>

                <div class="mb-3">
                    <label class="form-label fw-semibold">Audio File</label>
                    <input type="file" name="audio_file" accept=".mp3,audio/*" class="form-control" {{ request('spotify_id') ? '' : 'required' }}>
                    @if(request('preview_url'))
                        <small class="text-muted d-block mt-2">Atau gunakan preview dari Spotify:</small>
                        <audio controls class="mt-1 w-100" style="height: 40px;">
                            <source src="{{ request('preview_url') }}" type="audio/mpeg">
                        </audio>
                    @endif
                </div>

                <div class="mb-4">
                    <label class="form-label fw-semibold">Lyrics</label>
                    <textarea name="lyrics" class="form-control" rows="10" placeholder="[00:12.00] Hello world...">{{ old('lyrics') }}</textarea>
                </div>

                <div class="card border-0 bg-dark text-white mt-4">
                    <div class="card-body">
                        <h5 class="fw-bold mb-3">Lyrics Sync Preview</h5>
                        <audio id="audioPreview" controls class="w-100 mb-4"></audio>
                        <div class="mb-3 text-info">
                            Current Time: <span id="currentTimeText">0:00</span>
                        </div>
                        <div id="lyricsPreview" style="height:300px; overflow:auto; background:#111; padding:20px; border-radius:12px;"></div>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary w-100 py-3 mt-4 fw-bold">
                    Save Song
                </button>
            </form>
        </div>
    </div>
</div>

<script>
    const audioInput = document.querySelector('[name="audio_file"]');
    const audioPreview = document.getElementById('audioPreview');
    const lyricsInput = document.querySelector('[name="lyrics"]');
    const lyricsPreview = document.getElementById('lyricsPreview');
    const currentTimeText = document.getElementById('currentTimeText');
    let parsedLyrics = [];

    audioInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        audioPreview.src = url;
    });

    function parseLyrics(text) {
        const lines = text.split('\n');
        return lines.map(line => {
            const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
            if (!match) return null;
            return {
                time: parseInt(match[1]) * 60 + parseFloat(match[2]),
                text: match[3]
            };
        }).filter(Boolean);
    }

    function renderLyrics(activeIndex = -1) {
        lyricsPreview.innerHTML = '';
        parsedLyrics.forEach((line, index) => {
            const div = document.createElement('div');
            div.className = `py-2 px-3 rounded mb-2 ${index === activeIndex ? 'bg-primary text-white fw-bold' : 'text-secondary'}`;
            div.innerText = line.text;
            div.id = `lyric-${index}`;
            lyricsPreview.appendChild(div);
        });
    }

    lyricsInput.addEventListener('input', function() {
        parsedLyrics = parseLyrics(this.value);
        renderLyrics();
    });

    audioPreview.addEventListener('timeupdate', function() {
        const currentTime = audioPreview.currentTime;
        currentTimeText.innerText = Math.floor(currentTime / 60) + ':' + String(Math.floor(currentTime % 60)).padStart(2, '0');
        let activeIndex = -1;
        parsedLyrics.forEach((line, index) => {
            if (currentTime >= line.time) activeIndex = index;
        });
        renderLyrics(activeIndex);
        const activeLyric = document.getElementById(`lyric-${activeIndex}`);
        if (activeLyric) {
            activeLyric.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    function combineData() {
        const title = document.getElementById('song_title').value;
        const artist = document.getElementById('artist_name').value;
        document.getElementById('full_title').value = `${artist} - ${title}`;
        alert(`Berhasil di-copy: ${artist} - ${title}`);
    }

    // Script Deezer tetap ada seperti di code kamu untuk fallback
    let debounce;
    const searchInput = document.getElementById('deezer_search_keyword');
    const resultContainer = document.getElementById('deezer_search_results');

    if(searchInput) {
        searchInput.addEventListener('keyup', function() {
            clearTimeout(debounce);
            debounce = setTimeout(() => { searchDeezer(this.value); }, 400);
        });
    }

    async function searchDeezer(keyword) {
        if (keyword.length < 2) {
            resultContainer.innerHTML = ''; return;
        }
        resultContainer.innerHTML = `<div class="col-12 text-center">Searching...</div>`;
        try {
            const response = await fetch(`/admin/songs/search?q=${encodeURIComponent(keyword)}`);
            const json = await response.json();
            resultContainer.innerHTML = '';
            if (!json.data || json.data.length === 0) {
                resultContainer.innerHTML = `<div class="col-12 text-center py-4">No result</div>`;
                return;
            }
            json.data.forEach(track => {
                const item = document.createElement('div');
                item.className = 'col-md-4';
                item.innerHTML = `
                <div class="card shadow-sm border-0 song-card" style="cursor:pointer">
                    <div class="card-body">
                        <div class="d-flex gap-3">
                            <img src="${track.album.cover_medium}" width="100" class="rounded">
                            <div class="flex-grow-1">
                                <h5 class="fw-bold">${track.title}</h5>
                                <p class="mb-1 text-muted">${track.artist.name}</p>
                                <p class="small text-secondary">${track.album.title}</p>
                                <audio controls class="w-100"><source src="${track.preview}" type="audio/mpeg"></audio>
                            </div>
                        </div>
                    </div>
                </div>`;
                item.addEventListener('click', function() { selectSong(track); });
                resultContainer.appendChild(item);
            });
        } catch (err) {
            console.log(err);
            resultContainer.innerHTML = `<div class="col-12 text-center text-danger py-4">Failed load Deezer API</div>`;
        }
    }

    function selectSong(track) {
        document.querySelector('[name="song_title"]').value = track.title;
        document.querySelector('[name="artist_name"]').value = track.artist.name;
        document.querySelector('[name="album_name"]').value = track.album.title;
        document.querySelector('[name="deezer_track_id"]').value = track.id;
        document.querySelector('[name="duration"]').value = track.duration || 0;
        document.querySelector('[name="explicit_lyrics"]').value = track.explicit_lyrics ? 1 : 0;
        document.querySelector('[name="cover_xl"]').value = track.album.cover_xl || '';
        document.querySelector('[name="preview_url"]').value = track.preview || '';
        alert('Song selected from Deezer!');
    }
</script>

@endsection