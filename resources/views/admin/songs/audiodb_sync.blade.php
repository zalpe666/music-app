@extends('admin.layouts.app')

@section('title', 'AudioDB Sync - Zalpe Admin')
@section('header_title', 'Sync with TheAudioDB')

@section('content')
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

<div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
        <a href="{{ route('songs.index') }}" class="w-10 h-10 flex items-center justify-center bg-white rounded-full border border-slate-200 shadow-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition">
            <i class="bi bi-arrow-left"></i>
        </a>
        <div>
            <h2 class="text-2xl font-bold text-slate-800">TheAudioDB Sync</h2>
            <p class="text-sm text-slate-500">Search and validate metadata for <span class="font-bold text-slate-700">{{ $song->title }}</span></p>
        </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <form action="{{ route('songs.audiodb.show', $song->id) }}" method="GET" class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Artist Name</label>
                <input type="text" name="artist" value="{{ $artistName }}" class="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div class="flex-1">
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Song Title</label>
                <input type="text" name="title" value="{{ $title }}" class="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
            <div class="flex items-end">
                <button type="submit" class="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm w-full md:w-auto">
                    <i class="bi bi-search mr-1"></i> Search
                </button>
            </div>
        </form>
    </div>

    @if($trackData)
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm p-6">
            <div class="flex items-center gap-3 mb-6">
                <i class="bi bi-check-circle-fill text-2xl text-emerald-500"></i>
                <div>
                    <h3 class="text-lg font-bold text-emerald-900">Data Found!</h3>
                    <p class="text-sm text-emerald-700">Review the metadata below before saving.</p>
                </div>
            </div>

            <form action="{{ route('songs.audiodb.store', $song->id) }}" method="POST" class="space-y-4">
                @csrf
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-emerald-800 uppercase mb-1">Genre</label>
                        <input type="text" name="genre" value="{{ $trackData['strGenre'] ?? '' }}" class="w-full border border-emerald-300 rounded-lg px-4 py-2 text-sm bg-white" readonly>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-emerald-800 uppercase mb-1">YouTube Video URL</label>
                        <input type="text" name="youtube_url" value="{{ $trackData['strMusicVid'] ?? '' }}" class="w-full border border-emerald-300 rounded-lg px-4 py-2 text-sm bg-white" readonly>
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-emerald-800 uppercase mb-1">Description (EN)</label>
                    <textarea name="description" rows="5" class="w-full border border-emerald-300 rounded-lg px-4 py-2 text-sm bg-white" readonly>{{ $trackData['strDescriptionEN'] ?? 'No description available.' }}</textarea>
                </div>

                <div class="flex justify-end pt-4">
                    <button type="submit" class="px-8 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition shadow-lg">
                        <i class="bi bi-floppy mr-2"></i> Save Metadata & Validate
                    </button>
                </div>
            </form>
        </div>
    @else
        <div class="bg-red-50 border border-red-200 rounded-xl shadow-sm p-8 text-center">
            <i class="bi bi-x-circle-fill text-5xl text-red-400 mb-3 block"></i>
            <h3 class="text-xl font-bold text-red-800 mb-1">No Data Found</h3>
            <p class="text-sm text-red-600 mb-6 max-w-md mx-auto">TheAudioDB could not find any track matching the artist and title above. Try modifying the text (e.g., removing 'feat.' or special characters) and search again.</p>
        </div>
    @endif
</div>
@endsection