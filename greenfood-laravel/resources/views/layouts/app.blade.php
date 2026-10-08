<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'GreenFood - Thanh toán & Quản lý đơn hàng')</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col">
    <!-- Header / Navbar -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <a href="{{ route('user.payment.index') }}" class="flex items-center space-x-2">
                    <div class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-emerald-200">
                        🌱
                    </div>
                    <div>
                        <span class="text-xl font-extrabold text-emerald-800 tracking-tight">GreenFood</span>
                        <span class="text-xs block text-slate-500 font-medium">Chợ Nông Sản Sạch Trực Tuyến</span>
                    </div>
                </a>
            </div>

            <nav class="flex items-center space-x-4">
                <a href="{{ route('user.payment.index') }}" class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition">
                    🛒 Đặt hàng & Thanh toán
                </a>
                <a href="{{ route('user.orders.index') }}" class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition">
                    📋 Lịch sử đơn hàng
                </a>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> Thanh toán trực tuyến MoMo
                </span>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Flash Messages -->
        @if(session('success'))
            <div class="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3 text-emerald-900 shadow-sm">
                <span class="text-2xl leading-none">✅</span>
                <div class="flex-1 text-sm font-medium">
                    {{ session('success') }}
                </div>
            </div>
        @endif

        @if(session('error'))
            <div class="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-900 shadow-sm">
                <span class="text-2xl leading-none">❌</span>
                <div class="flex-1 text-sm font-medium">
                    {{ session('error') }}
                </div>
            </div>
        @endif

        @if(session('warning'))
            <div class="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-amber-900 shadow-sm">
                <span class="text-2xl leading-none">⚠️</span>
                <div class="flex-1 text-sm font-medium">
                    {{ session('warning') }}
                </div>
            </div>
        @endif

        @yield('content')
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>© {{ date('Y') }} GreenFood Market - Tích hợp Thanh toán MoMo Sandbox & Giao Hàng Nhanh GHN</p>
    </footer>

    @yield('scripts')
</body>
</html>
