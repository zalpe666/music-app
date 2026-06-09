@extends('admin.layouts.app')

@section('title', 'Artists Summary')

@section('content')
    <div class="max-w-7xl mx-auto">
        <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <h1 class="text-2xl font-bold text-slate-800">Artists Directory</h1>
                <p class="text-slate-500 mt-1 text-sm">Daftar semua artis beserta total lagu dan album yang mereka miliki.</p>
            </div>

            <div class="mt-4 md:mt-0">
                <a href="#" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm inline-flex items-center">
                    <i class="bi bi-plus-lg mr-2"></i> Add New Artist
                </a>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-xs font-bold tracking-wider">
                            <th class="px-6 py-4">Artist</th>
                            <th class="px-6 py-4 text-center">Total Albums</th>
                            <th class="px-6 py-4 text-center">Total Songs</th>
                            <th class="px-6 py-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @forelse ($artists as $artist)
                            <tr class="hover:bg-slate-50 transition-colors duration-200">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-4">
                                        @if ($artist->picture_xl)
                                            <img src="{{ $artist->picture_xl }}" alt="{{ $artist->name }}" class="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-200">
                                        @else
                                            <div class="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold border border-slate-300">
                                                {{ substr($artist->name, 0, 1) }}
                                            </div>
                                        @endif

                                        <div>
                                            <div class="font-bold text-slate-800">{{ $artist->name }}</div>
                                            <div class="text-xs text-slate-500 mt-0.5">
                                                {{ $artist->strCountry ?? 'Unknown Country' }}
                                                @if ($artist->intFormedYear)
                                                    • {{ $artist->intFormedYear }}
                                                @endif
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td class="px-6 py-4 text-center">
                                    <span class="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-100">
                                        {{ $artist->albums_count }}
                                    </span>
                                </td>

                                <td class="px-6 py-4 text-center">
                                    <span class="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-100">
                                        {{ $artist->songs_count }}
                                    </span>
                                </td>

                                <td class="px-6 py-4 text-center">
                                    @if ($artist->is_validated)
                                        <span class="text-emerald-600 bg-emerald-100 px-2 py-1 rounded text-xs font-semibold">Validated</span>
                                    @else
                                        <span class="text-amber-600 bg-amber-100 px-2 py-1 rounded text-xs font-semibold">Pending</span>
                                    @endif
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="px-6 py-12 text-center text-slate-500">
                                    <i class="bi bi-inbox text-4xl block mb-2 text-slate-300"></i>
                                    Tidak ada data artis ditemukan.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            @if ($artists->hasPages())
                <div class="px-6 py-4 border-t border-slate-200 bg-slate-50">
                    {{ $artists->links() }}
                </div>
            @endif
        </div>
    </div>
@endsection