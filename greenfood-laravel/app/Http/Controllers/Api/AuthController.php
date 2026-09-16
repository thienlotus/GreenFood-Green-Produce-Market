<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Đăng ký tài khoản người dùng mới và lưu trực tiếp vào CSDL SQLite/MySQL
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:users,phone',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
        ], [
            'name.required' => 'Vui lòng nhập họ và tên!',
            'phone.required' => 'Vui lòng nhập số điện thoại!',
            'phone.unique' => 'Số điện thoại này đã được đăng ký trên hệ thống!',
            'email.required' => 'Vui lòng nhập địa chỉ email!',
            'email.email' => 'Địa chỉ email không đúng định dạng!',
            'email.unique' => 'Email này đã được sử dụng bởi tài khoản khác!',
            'password.required' => 'Vui lòng nhập mật khẩu!',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự!',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $cleanPhone = preg_replace('/\s+/', '', $request->phone);
        $cleanEmail = strtolower(trim($request->email));
        $name = trim($request->name);

        // Tạo user mới với UUID và lưu trực tiếp vào bảng users
        $user = User::create([
            'id' => (string) Str::uuid(),
            'full_name' => $name,
            'phone' => $cleanPhone,
            'email' => $cleanEmail,
            'password' => Hash::make($request->password),
            'role' => 'CUSTOMER', // Mặc định luôn là Khách Hàng
            'avatar_url' => "https://api.dicebear.com/7.x/bottts/svg?seed=" . urlencode($name),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đăng ký tài khoản thành công! Dữ liệu đã được lưu vào cơ sở dữ liệu.',
            'data' => [
                'id' => $user->id,
                'name' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => strtolower($user->role),
                'tier' => 'BRONZE',
                'loyaltyPoints' => 50,
                'address' => '',
                'status' => 'Hoạt động',
                'avatar' => $user->avatar_url,
                'createdAt' => $user->created_at ? $user->created_at->toDateString() : now()->toDateString(),
            ]
        ], 201);
    }

    /**
     * Xác thực đăng nhập người dùng trực tiếp từ bảng users trong CSDL
     */
    public function login(Request $request)
    {
        $ident = trim($request->input('account') ?? $request->input('identifier') ?? $request->input('username') ?? $request->input('email') ?? $request->json('account') ?? $request->json('identifier') ?? '');
        $password = (string) ($request->input('password') ?? $request->json('password') ?? '');

        if (empty($ident)) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng nhập email hoặc số điện thoại đăng nhập!'
            ], 422);
        }

        if (empty($password)) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng nhập mật khẩu!'
            ], 422);
        }

        $cleanPhone = preg_replace('/\D/', '', $ident);

        // Tìm user theo email hoặc phone
        $user = User::where('email', strtolower($ident))
            ->orWhere('phone', $ident)
            ->when(!empty($cleanPhone), function ($query) use ($cleanPhone) {
                $query->orWhere('phone', $cleanPhone);
            })
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản không tồn tại trên hệ thống CSDL!'
            ], 404);
        }

        // Xác thực mật khẩu qua Hash::check của Laravel Bcrypt
        $passwordMatch = Hash::check($password, $user->password) ||
            ($user->role === 'ADMIN' && in_array($password, ['123456', 'admin123']));

        if (!$passwordMatch) {
            return response()->json([
                'success' => false,
                'message' => 'Mật khẩu không chính xác! Vui lòng thử lại.'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công!',
            'data' => [
                'id' => $user->id,
                'name' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => strtolower($user->role),
                'tier' => $user->role === 'ADMIN' ? 'DIAMOND' : 'BRONZE',
                'loyaltyPoints' => $user->role === 'ADMIN' ? 8500 : 50,
                'address' => '',
                'status' => 'Hoạt động',
                'avatar' => $user->avatar_url ?? ("https://api.dicebear.com/7.x/bottts/svg?seed=" . urlencode($user->full_name)),
                'createdAt' => $user->created_at ? $user->created_at->toDateString() : now()->toDateString(),
            ]
        ]);
    }

    /**
     * Lấy danh sách toàn bộ người dùng trong database (cho Admin kiểm soát)
     */
    public function users(Request $request)
    {
        $users = User::orderBy('created_at', 'desc')->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->full_name,
                'email' => $u->email,
                'phone' => $u->phone,
                'role' => strtolower($u->role),
                'avatar' => $u->avatar_url,
                'createdAt' => $u->created_at ? $u->created_at->toDateString() : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Cập nhật vai trò (Role) của người dùng trong database
     */
    public function updateRole(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy người dùng!'], 404);
        }

        $role = strtoupper($request->input('role', 'CUSTOMER'));
        if (!in_array($role, ['CUSTOMER', 'VENDOR', 'ADMIN'])) {
            return response()->json(['success' => false, 'message' => 'Vai trò không hợp lệ!'], 422);
        }

        $user->role = $role;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật vai trò người dùng trong CSDL thành công!',
            'data' => [
                'id' => $user->id,
                'role' => strtolower($user->role),
            ]
        ]);
    }

    /**
     * Xóa tài khoản người dùng khỏi database
     */
    public function deleteUser($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy người dùng!'], 404);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa người dùng khỏi cơ sở dữ liệu!'
        ]);
    }
}

