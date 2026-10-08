@extends('layouts.app')

@section('title', 'Đặt Hàng & Thanh Toán - GreenFood')

@section('content')
<div class="max-w-6xl mx-auto">
    <!-- Tiêu đề trang -->
    <div class="mb-8">
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Thanh toán đơn hàng</h1>
        <p class="text-sm text-slate-500 mt-1">Vui lòng kiểm tra giỏ hàng và nhập thông tin giao hàng để tiến hành thanh toán</p>
    </div>

    @if ($errors->any())
        <div class="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
            <h4 class="font-bold text-sm mb-2">Vui lòng kiểm tra các lỗi sau:</h4>
            <ul class="list-disc list-inside text-xs space-y-1">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('user.payment.process') }}" method="POST" id="checkoutForm">
        @csrf
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Cột trái: Thông tin giao hàng & Phương thức thanh toán (7 cột) -->
            <div class="lg:col-span-7 space-y-6">
                <!-- 1. Thông tin người nhận -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center">
                        <span class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold mr-2">1</span>
                        Thông tin giao hàng
                    </h2>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Họ và tên người nhận *</label>
                            <input type="text" name="name" value="{{ old('name', 'Nguyễn Văn A') }}" required
                                   class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                   placeholder="Ví dụ: Nguyễn Văn A">
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Số điện thoại nhận hàng *</label>
                            <input type="text" name="phone" value="{{ old('phone', '0912345678') }}" required
                                   class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                   placeholder="Ví dụ: 0912345678 (10 chữ số)">
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Địa chỉ chi tiết (Số nhà, đường) *</label>
                            <input type="text" name="address" value="{{ old('address', 'Số 12 ngõ 86 đường Mễ Trì Hạ') }}" required
                                   class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                   placeholder="Ví dụ: Số 12 ngõ 86 đường Mễ Trì Hạ">
                        </div>

                        <!-- Khu vực Tỉnh / Huyện / Xã chuẩn GHN -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Quận / Huyện *</label>
                                <select name="to_district_id" id="districtSelect" required
                                        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white">
                                    <option value="3440" selected>Quận Nam Từ Liêm (Hà Nội)</option>
                                    <option value="1482">Quận Cầu Giấy (Hà Nội)</option>
                                    <option value="1485">Quận Đống Đa (Hà Nội)</option>
                                    <option value="1442">Quận 1 (TP. Hồ Chí Minh)</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phường / Xã *</label>
                                <select name="to_ward_code" id="wardSelect" required
                                        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white">
                                    <option value="13010" selected>Phường Mễ Trì</option>
                                    <option value="13009">Phường Mỹ Đình 1</option>
                                    <option value="13008">Phường Mỹ Đình 2</option>
                                    <option value="13007">Phường Cầu Diễn</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 2. Phương thức thanh toán -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center">
                        <span class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold mr-2">2</span>
                        Phương thức thanh toán
                    </h2>

                    <div class="space-y-3">
                        <!-- Option MoMo ATM & Wallet -->
                        <label class="relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition border-pink-500 bg-pink-50/50 hover:bg-pink-50 has-[:checked]:border-pink-500 has-[:checked]:bg-pink-50/70">
                            <input type="radio" name="payment_method" value="momo" class="w-4 h-4 text-pink-600 focus:ring-pink-500" checked>
                            <div class="ml-4 flex items-center justify-between flex-1">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 rounded-lg bg-[#a50064] text-white flex items-center justify-center font-black text-sm shadow-sm">
                                        MoMo
                                    </div>
                                    <div>
                                        <div class="font-bold text-sm text-slate-900 flex items-center">
                                            Thẻ ATM nội địa (Napas) & Ví MoMo
                                        </div>
                                        <p class="text-xs text-slate-500">Thanh toán trực tiếp bằng thẻ ATM nội địa các ngân hàng Việt Nam hoặc Ví MoMo</p>
                                    </div>
                                </div>
                                <span class="text-xl">💳</span>
                            </div>
                        </label>

                        <!-- Option COD -->
                        <label class="relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition border-slate-200 hover:bg-slate-50 has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50/50">
                            <input type="radio" name="payment_method" value="cod" class="w-4 h-4 text-emerald-600 focus:ring-emerald-500">
                            <div class="ml-4 flex items-center justify-between flex-1">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                        💵
                                    </div>
                                    <div>
                                        <div class="font-bold text-sm text-slate-900">Thanh toán khi nhận hàng (COD)</div>
                                        <p class="text-xs text-slate-500">Tạo ngay đơn hàng và vận đơn GHN tự động giao tận nơi</p>
                                    </div>
                                </div>
                                <span class="text-xl">📦</span>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- 3. Cam kết bảo mật thanh toán -->
                <div class="bg-gradient-to-br from-emerald-50 via-teal-50 to-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex items-start space-x-3.5">
                    <span class="text-2xl leading-none">🛡️</span>
                    <div>
                        <h3 class="text-sm font-bold text-emerald-950 mb-1">Cổng thanh toán MoMo & Thẻ ATM bảo mật chuẩn PCI-DSS</h3>
                        <p class="text-xs text-slate-600 leading-relaxed">
                            Hệ thống kết nối trực tiếp đến Cổng thanh toán MoMo. Mọi thông tin thẻ ATM và giao dịch tài chính được mã hóa bảo mật 256-bit SSL, hỗ trợ thẻ ATM tất cả ngân hàng nội địa tại Việt Nam (Vietcombank, BIDV, Techcombank, MBBank, Vietinbank, Agribank...).
                        </p>
                    </div>
                </div>
            </div>

            <!-- Cột phải: Giỏ hàng & Nút thanh toán (5 cột) -->
            <div class="lg:col-span-5">
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24 space-y-6">
                    <h2 class="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Giỏ hàng của bạn</h2>

                    <!-- Danh sách sản phẩm -->
                    <div class="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                        @php $subtotal = 0; @endphp
                        @forelse($cart as $item)
                            @php
                                $itemTotal = $item['price'] * $item['quantity'];
                                $subtotal += $itemTotal;
                            @endphp
                            <div class="py-3 flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base">
                                        🍎
                                    </div>
                                    <div>
                                        <h4 class="text-sm font-semibold text-slate-800 line-clamp-1">{{ $item['name'] }}</h4>
                                        <p class="text-xs text-slate-500">{{ number_format($item['price']) }}đ x {{ $item['quantity'] }}</p>
                                    </div>
                                </div>
                                <span class="text-sm font-bold text-slate-900">{{ number_format($itemTotal) }}đ</span>
                            </div>
                        @empty
                            <p class="text-sm text-slate-400 py-4 text-center">Giỏ hàng đang trống.</p>
                        @endforelse
                    </div>

                    <!-- Tóm tắt chi phí -->
                    <div class="space-y-2 border-t border-slate-100 pt-4 text-sm">
                        <div class="flex justify-between text-slate-600">
                            <span>Tạm tính tiền hàng:</span>
                            <span class="font-semibold text-slate-900">{{ number_format($subtotal) }}đ</span>
                        </div>
                        <div class="flex justify-between text-slate-600">
                            <span>Phí giao hàng (GHN ước tính):</span>
                            <span class="font-semibold text-emerald-700">20.000đ</span>
                        </div>
                        <div class="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-200 pt-3">
                            <span>Tổng thanh toán:</span>
                            <span class="text-emerald-700 text-lg">{{ number_format($subtotal + 20000) }}đ</span>
                        </div>
                    </div>

                    <!-- Nút xác nhận đặt hàng -->
                    <button type="submit"
                            class="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-200 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2">
                        <span>💳 Tiến hành thanh toán</span>
                        <span>➔</span>
                    </button>

                    <p class="text-[11px] text-center text-slate-400">
                        Bảo mật thanh toán 256-bit SSL • Kết nối Cổng thanh toán MoMo chính thức
                    </p>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection
