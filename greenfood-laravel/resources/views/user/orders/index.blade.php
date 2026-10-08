@extends('layouts.app')

@section('title', 'Lịch Sử Đơn Hàng & Quản Lý Giao Dịch - GreenFood')

@section('content')
<div class="max-w-6xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Danh sách đơn hàng của bạn</h1>
            <p class="text-sm text-slate-500 mt-1">Theo dõi tiến độ thanh toán MoMo và trạng thái vận đơn Giao Hàng Nhanh (GHN)</p>
        </div>
        <div>
            <a href="{{ route('user.payment.index') }}"
               class="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 transition">
                <span>➕ Tạo đơn hàng mới</span>
            </a>
        </div>
    </div>

    <!-- Danh sách đơn hàng -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
                <thead class="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <tr>
                        <th class="py-3.5 px-4">Mã đơn hàng</th>
                        <th class="py-3.5 px-4">Người nhận & SĐT</th>
                        <th class="py-3.5 px-4">Tổng thanh toán</th>
                        <th class="py-3.5 px-4">Phương thức</th>
                        <th class="py-3.5 px-4">Trạng thái thanh toán</th>
                        <th class="py-3.5 px-4">Vận đơn GHN</th>
                        <th class="py-3.5 px-4 text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @forelse($orders as $order)
                        @php
                            $isPaid = in_array(strtolower($order->status), ['paid', 'completed']) || in_array(strtolower($order->payment_status), ['paid', 'completed']);
                            $isMomo = strtoupper($order->payment_method) === 'MOMO';
                        @endphp
                        <tr class="hover:bg-slate-50/80 transition">
                            <!-- Mã đơn -->
                            <td class="py-4 px-4 font-mono font-bold text-slate-900">
                                <div>#{{ $order->tracking_number ?: substr($order->id, 0, 8) }}</div>
                                <span class="text-[11px] font-sans font-normal text-slate-400">{{ $order->created_at->format('d/m/Y H:i') }}</span>
                            </td>

                            <!-- Người nhận -->
                            <td class="py-4 px-4">
                                <div class="font-semibold text-slate-800">{{ $order->customer_name ?: $order->name }}</div>
                                <div class="text-xs text-slate-500">{{ $order->customer_phone ?: $order->phone }}</div>
                            </td>

                            <!-- Tổng tiền -->
                            <td class="py-4 px-4 font-bold text-slate-900">
                                {{ number_format($order->total_price ?: $order->total_amount) }}đ
                            </td>

                            <!-- Phương thức -->
                            <td class="py-4 px-4">
                                @if($isMomo)
                                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-700 border border-pink-200">
                                        Ví MoMo
                                    </span>
                                @else
                                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                        COD (Tiền mặt)
                                    </span>
                                @endif
                            </td>

                            <!-- Trạng thái thanh toán -->
                            <td class="py-4 px-4">
                                @if($isPaid)
                                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Đã thanh toán
                                    </span>
                                @elseif($order->status === 'failed')
                                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                                        <span class="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span> Thất bại / Bị hủy
                                    </span>
                                @else
                                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span> Chờ thanh toán
                                    </span>
                                @endif
                            </td>

                            <!-- Mã GHN -->
                            <td class="py-4 px-4">
                                @if(!empty($order->ghn_order_code))
                                    <span class="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                                        {{ $order->ghn_order_code }}
                                    </span>
                                @else
                                    <span class="text-xs text-slate-400 italic">Chưa tạo vận đơn</span>
                                @endif
                            </td>

                            <!-- Hành động / Nút thanh toán lại -->
                            <td class="py-4 px-4 text-center">
                                @if($isMomo && !$isPaid)
                                    <div class="flex items-center justify-center space-x-1.5">
                                        <!-- Nút thanh toán lại theo đúng yêu cầu đề bài trang 24 -->
                                        <a href="{{ route('user.orders.momo.pay', $order->id) }}"
                                           class="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-sm shadow-pink-200 transition"
                                           title="Mở cổng thanh toán MoMo">
                                            <span>💳 Thanh toán lại</span>
                                        </a>

                                        <!-- Nút giả lập MoMo Sandbox thành công (hỗ trợ khi cổng Napas MoMo từ chối thẻ) -->
                                        <a href="{{ route('user.orders.momo.simulate', $order->id) }}"
                                           class="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-200 transition"
                                           title="Giả lập MoMo thanh toán thành công và tạo vận đơn GHN">
                                            <span>⚡ Giả lập MoMo</span>
                                        </a>
                                    </div>
                                @else
                                    <span class="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                        Đơn hoàn tất
                                    </span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="py-12 text-center text-slate-400">
                                <span class="text-3xl block mb-2">📦</span>
                                Bạn chưa có đơn hàng nào trong hệ thống.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($orders->hasPages())
            <div class="p-4 border-t border-slate-200">
                {{ $orders->links() }}
            </div>
        @endif
    </div>

    <!-- Hướng dẫn thẻ test nhanh MoMo Sandbox -->
    <div class="bg-slate-100 p-5 rounded-2xl border border-slate-200 text-xs text-slate-600">
        <h4 class="font-bold text-slate-800 mb-1 flex items-center">
            <span class="mr-1.5">💡</span> Lưu ý bài Lab thanh toán MoMo Sandbox:
        </h4>
        <p>• Khi thanh toán thất bại, hệ thống lưu vết giao dịch và đưa người dùng về trang này kèm trạng thái đơn hàng và nút <strong>"Thanh toán lại"</strong>.</p>
        <p>• Bấm nút <strong>"Thanh toán lại"</strong> sẽ mở lại phiên MoMo mới mà không tạo đơn hàng mới trong cơ sở dữ liệu (đúng đặc tả trang 24).</p>
        <p>• Thẻ test thành công: Số thẻ <strong>9704 0000 0000 0018</strong> | Tên: <strong>NGUYEN VAN A</strong> | Hạn: <strong>12/30</strong> | OTP: <strong>bất kỳ</strong>.</p>
    </div>
</div>
@endsection
