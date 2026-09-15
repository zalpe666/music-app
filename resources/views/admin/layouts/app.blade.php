<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Zalpe Admin')</title>

    {{-- Tailwind CSS via CDN --}}
    <script src="https://cdn.tailwindcss.com"></script>

    {{-- Bootstrap Icons CDN (Penting untuk icon Spotify, Plus, dll) --}}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">

    {{-- Google Fonts: Inter --}}
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <style>
        body {
            font-family: 'Inter', sans-serif;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        ::-webkit-scrollbar-track {
            background: transparent;
        }

        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
    </style>
</head>


<body class="bg-slate-50 text-slate-800 antialiased h-screen overflow-hidden flex">

    {{-- Sidebar --}}
    <aside class="w-64 bg-slate-900 text-white flex flex-col transition-all duration-300 z-20 shrink-0">
        {{-- Sidebar Brand --}}
        <div class="h-16 flex items-center px-6 border-b border-slate-800">
            <span class="text-xl font-bold tracking-wider text-indigo-400">
                ZALPE <span class="text-white">ADMIN</span>
            </span>
        </div>

        {{-- Sidebar Navigation --}}
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <a href="/admin/dashboard"
                class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                <i class="bi bi-grid-1x2"></i> Dashboard
            </a>

            <a href="/admin/songs"
                class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                <i class="bi bi-music-note-list"></i> Songs
            </a>

            <a href="/admin/artists"
                class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                <i class="bi bi-person-lines-fill"></i> Artists
            </a>
        </nav>

        {{-- Logout --}}
        <div class="p-4 border-t border-slate-800">
            <a href="/logout"
                class="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors">
                <i class="bi bi-box-arrow-right"></i> Logout
            </a>
        </div>
    </aside>

    {{-- Main Content Wrapper --}}
    <main class="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 relative">

        {{-- Top Header --}}
        <header
            class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shadow-sm shrink-0">
            <div class="flex items-center">
                <h1 class="text-lg font-semibold text-slate-800">
                    @yield('title', 'Dashboard Overview')
                </h1>
            </div>

            {{-- User Profile --}}
            <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-slate-600">Admin</span>
                <div
                    class="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                    A
                </div>
            </div>
        </header>

        {{-- Content Area --}}
        <div class="flex-1 overflow-y-auto p-4 md:p-8">
            @if (session('success'))
                <div class="mb-5 rounded-lg bg-green-50 border border-green-200 p-4">
                    <div class="flex items-center gap-2 text-green-700">
                        <i class="ri-checkbox-circle-line"></i>

                        <span class="text-sm font-medium">
                            {{ session('success') }}
                        </span>
                    </div>
                </div>
            @endif @yield('content')
        </div>

    </main>

</body>

</html>
