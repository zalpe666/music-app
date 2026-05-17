@extends('admin.layouts.app')

@section('title', 'Songs')

@section('content')

    <!-- Pastikan Anda sudah meload Bootstrap Icons di layout Anda -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <div class="container-fluid py-3">

        <!-- Header -->
        <div class="row align-items-center mb-4">
            <div class="col-md-8">
                <h2 class="fw-bold mb-1">Songs Library</h2>
                <p class="text-muted mb-0">Manage and organize your music collection.</p>
            </div>
            <div class="col-md-4 text-md-end mt-3 mt-md-0">
                <a href="{{ route('songs.create') }}" class="btn btn-primary shadow-sm rounded-pill px-4">
                    <i class="bi bi-plus-lg me-1"></i> Add New Song
                </a>
            </div>
        </div>

        <!-- Success Alert -->
        @if (session('success'))
            <div class="alert alert-success alert-dismissible fade show shadow-sm border-0" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i> {{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif

        <!-- Main Card -->
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light text-secondary">
                        <tr>
                            <th width="80" class="ps-4">Cover</th>
                            <th>Song Details</th>
                            <th>Artist & Album</th>
                            <th>Duration</th>
                            <th>Provider</th>
                            <th width="200" class="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="border-top-0">
                        @forelse ($songs as $song)
                            <tr>
                                <!-- Cover -->
                                <td class="ps-4">
                                    @if ($song->cover_medium)
                                        <img src="{{ $song->cover_medium }}" width="55" height="55"
                                            class="rounded-3 object-fit-cover shadow-sm" alt="Cover">
                                    @else
                                        <div class="bg-light text-secondary rounded-3 d-flex align-items-center justify-content-center shadow-sm"
                                            style="width:55px; height:55px;">
                                            <i class="bi bi-music-note-beamed fs-4"></i>
                                        </div>
                                    @endif
                                </td>

                                <!-- Song Details -->
                                <td>
                                    <div class="fw-bold text-dark fs-6">{{ $song->title }}</div>
                                    @if ($song->title_version)
                                        <span
                                            class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle rounded-pill fw-normal mt-1">
                                            {{ $song->title_version }}
                                        </span>
                                    @endif
                                </td>

                                <!-- Artist & Album -->
                                <td>
                                    <div class="fw-semibold text-dark">{{ $song->artist->name }}</div>
                                    <div class="text-muted small">
                                        <i class="bi bi-disc me-1"></i> {{ $song->album->title ?? 'Unknown Album' }}
                                    </div>
                                </td>

                                <!-- Duration -->
                                <td>
                                    <span class="text-muted fw-medium">
                                        <i class="bi bi-clock me-1"></i> {{ gmdate('i:s', $song->duration) }}
                                    </span>
                                </td>

                                <!-- Provider -->
                                <td>
                                    <span class="badge bg-dark rounded-pill px-3 py-2 fw-medium">
                                        {{ ucfirst($song->provider) }}
                                    </span>
                                </td>

                                <!-- Actions -->
                                <td>
                                    <div class="d-flex justify-content-center gap-2">

                                        <!-- Preview Button -->
                                        @if ($song->preview_url)
                                            <button class="btn btn-sm btn-light text-primary border shadow-sm"
                                                data-bs-toggle="modal" data-bs-target="#previewModal{{ $song->id }}"
                                                title="Preview Audio">
                                                <i class="bi bi-play-fill"></i>
                                            </button>
                                        @endif

                                        <!-- Stream Button -->
                                        @if ($song->audio_path)
                                            <a href="/stream/{{ $song->id }}" target="_blank"
                                                class="btn btn-sm btn-light text-success border shadow-sm"
                                                title="Stream Full Audio">
                                                <i class="bi bi-earbuds"></i>
                                            </a>
                                        @endif

                                        <!-- Edit Button -->
                                        <a href="{{ route('songs.edit', $song->id) }}"
                                            class="btn btn-sm btn-light text-warning border shadow-sm" title="Edit Song">
                                            <i class="bi bi-pencil-square"></i>
                                        </a>

                                        <!-- Delete Button -->
                                        <form action="{{ route('songs.destroy', $song->id) }}" method="POST"
                                            onsubmit="return confirm('Are you sure you want to delete this song?')">
                                            @csrf
                                            @method('DELETE')
                                            <button class="btn btn-sm btn-light text-danger border shadow-sm"
                                                title="Delete Song">
                                                <i class="bi bi-trash3"></i>
                                            </button>
                                        </form>

                                    </div>

                                    <!-- Modal Preview (Dipindahkan ke dalam TD agar valid secara struktur HTML) -->
                                    @if ($song->preview_url)
                                        <div class="modal fade" id="previewModal{{ $song->id }}" tabindex="-1"
                                            aria-hidden="true">
                                            <div class="modal-dialog modal-dialog-centered modal-sm">
                                                <div class="modal-content border-0 shadow">
                                                    <div class="modal-header border-bottom-0 pb-0">
                                                        <button type="button" class="btn-close" data-bs-dismiss="modal"
                                                            aria-label="Close"></button>
                                                    </div>
                                                    <div class="modal-body text-center pt-0">
                                                        @if ($song->cover_big || $song->cover_medium)
                                                            <img src="{{ $song->cover_big ?? $song->cover_medium }}"
                                                                class="img-fluid rounded-4 shadow-sm mb-4 w-75">
                                                        @else
                                                            <div class="bg-light rounded-4 mb-4 d-flex align-items-center justify-content-center mx-auto"
                                                                style="width: 150px; height: 150px;">
                                                                <i class="bi bi-music-note-beamed fs-1 text-secondary"></i>
                                                            </div>
                                                        @endif

                                                        <h6 class="fw-bold mb-1">{{ $song->title }}</h6>
                                                        <p class="text-muted small mb-3">{{ $song->artist }}</p>

                                                        <audio controls class="w-100" controlsList="nodownload">
                                                            <source src="{{ $song->preview_url }}" type="audio/mpeg">
                                                            Your browser does not support the audio element.
                                                        </audio>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    @endif

                                </td>
                            </tr>
                        @empty
                            <!-- Empty State -->
                            <tr>
                                <td colspan="6" class="text-center py-5">
                                    <div class="py-4">
                                        <i class="bi bi-music-note-list text-muted" style="font-size: 3rem;"></i>
                                        <h5 class="fw-bold mt-3 text-dark">No songs found</h5>
                                        <p class="text-muted">Your music library is currently empty.</p>
                                        <a href="{{ route('songs.create') }}"
                                            class="btn btn-outline-primary btn-sm mt-2 rounded-pill px-4">
                                            Add Your First Song
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <!-- Jika Anda menggunakan Pagination Laravel, letakkan di sini -->
            @if (method_exists($songs, 'links') && $songs->hasPages())
                <div class="card-footer bg-white border-top-0 pt-3 pb-2 px-4">
                    {{ $songs->links('pagination::bootstrap-5') }}
                </div>
            @endif

        </div>
    </div>

@endsection
