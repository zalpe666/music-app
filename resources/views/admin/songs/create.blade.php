@extends('admin.layouts.app')

@section('title', 'Add Song')

@section('content')
    <div class="max-w-4xl mx-auto">

        <div class="mb-6">
            <h1 class="text-2xl font-bold text-slate-800">Add New Song</h1>
            <p class="text-slate-500 mt-1 text-sm">Search song metadata from Spotify and upload audio</p>
        </div>

        @if ($errors->any())
            <div class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm">
                <ul class="list-disc list-inside text-sm">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="p-6 sm:p-8">
                <form action="{{ route('songs.store') }}" method="POST" enctype="multipart/form-data">
                    @csrf

                    <div class="mb-6 p-5 bg-emerald-50 rounded-lg border border-emerald-100">
                        <label class="block text-sm font-bold text-emerald-700 mb-2">
                            <i class="bi bi-spotify mr-1"></i> Search Song From Spotify
                        </label>
                        <input type="text" id="spotify_search_keyword" placeholder="Example: Alan Walker Faded"
                            class="w-full px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow bg-white text-sm">
                    </div>

                    <div id="spotify_search_results"
                        class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 overflow-y-auto max-h-[400px]"></div>

                    <input type="hidden" name="spotify_id" value="{{ old('spotify_id') }}">
                    <input type="hidden" name="artists_raw" value="{{ old('artists_raw') }}">
                    <input type="hidden" name="album_spotify_id" value="{{ old('album_spotify_id') }}">
                    <input type="hidden" name="isrc" value="{{ old('isrc') }}">
                    <input type="hidden" name="duration" value="{{ old('duration') }}">
                    <input type="hidden" name="explicit_lyrics" value="{{ old('explicit_lyrics') }}">
                    <input type="hidden" name="cover_xl" value="{{ old('cover_xl') }}">
                    <input type="hidden" name="preview_url" value="{{ old('preview_url') }}">

                    <hr class="border-slate-200 my-8">

                    <div class="space-y-5">
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-2">Song Title</label>
                            <input type="text" name="song_title"
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                id="song_title" value="{{ old('song_title') }}" required>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-2">Artist(s)</label>
                            <input type="text" name="artist_name"
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                id="artist_name" value="{{ old('artist_name') }}" required>
                        </div>

                        <input type="hidden" name="full_title" id="full_title">
                        <button type="button"
                            class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-2 px-3 rounded-lg transition-colors inline-flex items-center"
                            onclick="combineData()">
                            <i class="bi bi-clipboard mr-2"></i> Copy Gabungan
                        </button>

                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-2">Album</label>
                            <input type="text" name="album_name"
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                id="album_name" value="{{ old('album_name') }}" required>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-2">Audio File (.mp3)</label>
                            <input type="file" name="audio_file" accept=".mp3,audio/*"
                                class="w-full text-slate-500 font-medium text-sm bg-slate-50 file:cursor-pointer cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-indigo-600 file:hover:bg-indigo-700 file:text-white rounded-lg border border-slate-300"
                                required>

                            <div id="preview_audio_container" class="mt-3 hidden">
                                <small class="text-slate-500 block mb-1 text-xs font-medium">Preview dari Spotify:</small>
                                <audio id="spotify_preview_audio" controls class="w-full h-10 rounded"></audio>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-2">Lyrics (.lrc format)</label>
                            <textarea name="lyrics"
                                class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                                rows="6" placeholder="[00:12.00] Hello world...">{{ old('lyrics') }}</textarea>
                        </div>
                    </div>

                    <div class="bg-slate-900 text-white mt-8 rounded-xl overflow-hidden shadow-md">
                        <div class="p-5">
                            <h5 class="font-bold text-sm mb-4 flex items-center text-slate-300">
                                <i class="bi bi-music-note-list mr-2"></i> Lyrics Sync Preview
                            </h5>
                            <audio id="audioPreview" controls class="w-full mb-4 rounded h-10"></audio>
                            <div class="mb-3 text-indigo-400 font-medium text-xs">
                                Current Time: <span id="currentTimeText" class="text-white">0:00</span>
                            </div>
                            <div id="lyricsPreview"
                                class="h-[200px] overflow-y-auto bg-slate-950 p-4 rounded-lg space-y-1 scroll-smooth text-sm">
                            </div>
                        </div>
                    </div>

                    <button type="submit"
                        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl mt-8 transition-colors shadow-sm flex justify-center items-center">
                        <i class="bi bi-cloud-arrow-up mr-2 text-lg"></i> Save Song
                    </button>
                </form>
            </div>
        </div>
    </div>

    {{-- Javascript Logika Preview & Spotify Tetap Sama --}}
    <script>
        // --- AUDIO & LYRICS PREVIEW LOGIC ---
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
                const isActive = index === activeIndex;
                div.className =
                    `py-1.5 px-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`;
                div.innerText = line.text || '♪';
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
            currentTimeText.innerText = Math.floor(currentTime / 60) + ':' + String(Math.floor(currentTime % 60))
                .padStart(2, '0');
            let activeIndex = -1;
            parsedLyrics.forEach((line, index) => {
                if (currentTime >= line.time) activeIndex = index;
            });
            renderLyrics(activeIndex);
            const activeLyric = document.getElementById(`lyric-${activeIndex}`);
            if (activeLyric) activeLyric.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        });

        function combineData() {
            const title = document.getElementById('song_title').value;
            const artist = document.getElementById('artist_name').value;
            if (!title || !artist) {
                alert('Title dan Artist harus diisi!');
                return;
            }
            document.getElementById('full_title').value = `${artist} - ${title}`;
            alert(`Berhasil di-copy: ${artist} - ${title}`);
        }

        // --- SPOTIFY SEARCH LOGIC ---
        let debounce;
        const searchInput = document.getElementById('spotify_search_keyword');
        const resultContainer = document.getElementById('spotify_search_results');

        if (searchInput) {
            searchInput.addEventListener('keyup', function() {
                clearTimeout(debounce);
                debounce = setTimeout(() => {
                    searchSpotify(this.value);
                }, 500);
            });
        }

        async function searchSpotify(keyword) {
            if (keyword.length < 2) {
                resultContainer.innerHTML = '';
                return;
            }
            resultContainer.innerHTML =
                `<div class="col-span-full flex justify-center items-center text-emerald-600 py-6"><svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span class="font-medium text-sm">Searching Spotify...</span></div>`;

            try {
                const response = await fetch(`/admin/songs/search-spotify?q=${encodeURIComponent(keyword)}`);
                const textData = await response.text();
                try {
                    const json = JSON.parse(textData);
                    resultContainer.innerHTML = '';
                    if (!json.data || json.data.length === 0) {
                        resultContainer.innerHTML =
                            `<div class="col-span-full text-center text-slate-500 py-4 text-sm">No result found</div>`;
                        return;
                    }
                    json.data.forEach(item => {
                        const card = document.createElement('div');
                        card.className =
                            'bg-white border border-slate-200 rounded-xl p-3 hover:border-emerald-400 hover:shadow-sm cursor-pointer transition-all duration-200 group';
                        card.innerHTML =
                            `<div class="flex gap-3 items-center"><img src="${item.album.cover_xl}" class="w-12 h-12 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform"><div class="flex-grow overflow-hidden"><h6 class="font-bold text-slate-800 truncate text-xs mb-0.5">${item.track.name}</h6><p class="text-[10px] text-slate-500 truncate mb-1">${item.artist.name}</p><span class="inline-block bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full truncate max-w-full">${item.album.name}</span></div></div>`;
                        card.addEventListener('click', function() {
                            selectSpotifySong(item);
                        });
                        resultContainer.appendChild(card);
                    });
                } catch (e) {
                    resultContainer.innerHTML =
                        `<div class="col-span-full text-center bg-red-50 text-red-600 rounded-lg py-3 px-4 text-xs">Error parsing JSON</div>`;
                }
            } catch (err) {
                resultContainer.innerHTML =
                    `<div class="col-span-full text-center text-red-500 py-4 text-sm">Connection failed</div>`;
            }
        }

        function selectSpotifySong(item) {
            document.getElementById('song_title').value = item.track.name;
            document.getElementById('artist_name').value = item.artist.name;
            document.getElementById('album_name').value = item.album.name;
            document.querySelector('[name="spotify_id"]').value = item.track.spotify_id;
            document.querySelector('[name="album_spotify_id"]').value = item.album.spotify_id;
            document.querySelector('[name="duration"]').value = item.track.duration || 0;
            document.querySelector('[name="explicit_lyrics"]').value = item.track.explicit;
            document.querySelector('[name="isrc"]').value = item.track.isrc || '';
            document.querySelector('[name="cover_xl"]').value = item.album.cover_xl || '';
            document.querySelector('[name="preview_url"]').value = item.track.preview_url || '';
            document.querySelector('[name="artists_raw"]').value = JSON.stringify(item.artists_raw);

            const previewContainer = document.getElementById('preview_audio_container');
            if (item.track.preview_url) {
                previewContainer.classList.remove('hidden');
                document.getElementById('spotify_preview_audio').src = item.track.preview_url;
            } else {
                previewContainer.classList.add('hidden');
            }

            document.getElementById('song_title').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            resultContainer.innerHTML =
                `<div class="col-span-full"><div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-lg flex items-center text-sm"><i class="bi bi-check-circle-fill mr-2"></i><strong>${item.track.name}</strong> selected!</div></div>`;
        }
    </script>
@endsection
