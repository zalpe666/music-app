<!-- resources/views/admin/artists/index.blade.php -->
@extends('admin.layouts.app')

@section('title', 'Daftar Artis')

@section('content')
    <div class="container mt-5">
        <h3>Daftar Artis</h3>

        <!-- Tombol Sync All -->
        <form action="{{ route('admin.artists.syncAll') }}" method="POST" class="mb-3">
            @csrf
            <button type="submit" class="btn btn-warning" onclick="return confirm('Sync semua artis?')">
                Sync Semua Artis
            </button>
        </form>

        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>Nama Artis</th>
                    <th>Genre</th>
                    <th>Mood</th>
                    <th>Bio (Snippet)</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($artists as $artist)
                    <tr>
                        <td>{{ $artist->name }}</td>
                        <td>{{ $artist->strGenre }}</td>
                        <td>{{ $artist->strMood }}</td>
                        <td>{{ Str::limit($artist->bio, 50) }}</td>
                        <td>
                            <!-- Tombol Sync -->
                            <form action="{{ route('admin.artists.sync', $artist->id) }}" method="POST">
                                @csrf
                                <button type="submit" class="btn btn-sm btn-info">Sync Data</button>
                            </form>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
@endsection
