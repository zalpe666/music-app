<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Zalpe Admin')</title>

    {{-- Tailwind CSS via CDN (Untuk production di Laravel, disarankan pakai @vite('resources/css/app.css')) --}}
    <script src="https://cdn.tailwindcss.com"></script>

    {{-- Google Fonts: Inter untuk UI yang lebih modern --}}
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        body { font-family: 'Inter', sans-serif; }
        
        /* Custom Scrollbar untuk tampilan yang lebih rapi */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
    </style>
</head>

<body class="bg-gray-50 text-gray-800 antialiased h-screen overflow-hidden flex">

    {{-- Sidebar --}}
    <aside class="w-64 bg-slate-900 text-white flex flex-col transition-all duration-300 z-20">
        
        {{-- Sidebar Brand --}}
        <div class="h-16 flex items-center px-6 border-b border-slate-800">
            <span class="text-xl font-bold tracking-wider text-indigo-400">
                ZALPE <span class="text-white">ADMIN</span>
            </span>
        </div>

        {{-- Sidebar Navigation --}}
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            
            {{-- Dashboard Link (Contoh state Active) --}}
            <a href="/admin/dashboard" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg bg-slate-800 text-white transition-colors">
                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                Dashboard
            </a>

            {{-- Songs Link --}}
            <a href="/admin/songs" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
                Songs
            </a>

            {{-- Artists Link --}}
            <a href="/admin/artists" class="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                Artists
            </a>

        </nav>

        {{-- Logout / Footer Sidebar --}}
        <div class="p-4 border-t border-slate-800">
            <a href="/logout" class="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Logout
            </a>
        </div>

    </aside>

    {{-- Main Content Wrapper --}}
    <main class="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 relative">
        
        {{-- Top Header --}}
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shadow-sm">
            <div class="flex items-center">
                <h1 class="text-lg font-semibold text-slate-800">
                    @yield('header_title', 'Dashboard Overview')
                </h1>
            </div>
            
            {{-- User Profile Simple --}}
            <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-slate-600">Admin</span>
                <div class="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                    A
                </div>
            </div>
        </header>

        {{-- Content Area --}}
        <div class="flex-1 overflow-y-auto p-8">
            
            {{-- Card Wrapper untuk Konten --}}
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
                @yield('content')
            </div>

        </div>

    </main>

</body>
</html>