<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>
        @yield('title', 'Admin Panel')
    </title>

    {{-- Bootstrap --}}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet">

</head>

<body>

    <div class="d-flex">

        {{-- Sidebar --}}
        <div class="bg-dark text-white p-3" style="width:250px;min-height:100vh;">

            <h4>Zalpe Admin</h4>

            <hr>

            <ul class="nav flex-column">

                <li class="nav-item mb-2">
                    <a href="/admin/dashboard" class="nav-link text-white">
                        Dashboard
                    </a>
                </li>

                <li class="nav-item mb-2">
                    <a href="/admin/songs" class="nav-link text-white">
                        Songs
                    </a>
                </li>

            </ul>

        </div>

        {{-- Content --}}
        <div class="flex-grow-1 p-4">

            @yield('content')

        </div>

    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"></script>

</body>

</html>
