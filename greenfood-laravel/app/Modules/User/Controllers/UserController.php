<?php

namespace App\Modules\User\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\User\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService
    ) {}

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'role' => 'nullable|string|in:customer,farmer,admin'
        ], [
            'name.required' => 'Họ và tên không được để trống!',
            'email.required' => 'Email không được để trống!',
            'email.email' => 'Email không đúng định dạng!',
            'email.unique' => 'Email này đã được sử dụng!',
            'password.required' => 'Mật khẩu không được để trống!',
            'password.min' => 'Mật khẩu phải từ 6 ký tự trở lên!'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'status' => 400,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 400);
        }

        $result = $this->userService->register($request->all());

        return response()->json($result, $result['status'] ?? 200);
    }

    public function login(Request $request)
    {
        if (!$request->has('email') && $request->has('account')) {
            $request->merge(['email' => $request->input('account')]);
        }

        $validator = Validator::make($request->all(), [
            'email' => 'required|string',
            'password' => 'required|string',
        ], [
            'email.required' => 'Vui lòng nhập email hoặc tài khoản!',
            'password.required' => 'Vui lòng nhập mật khẩu!'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'status' => 400,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 400);
        }

        $result = $this->userService->login($request->email, $request->password);

        return response()->json($result, $result['status'] ?? 200);
    }

    public function index(Request $request)
    {
        $users = $this->userService->listUsers($request->all());
        return response()->json([
            'success' => true,
            'count' => $users->count(),
            'data' => $users
        ]);
    }

    public function show($id)
    {
        $user = $this->userService->getUser($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    public function update(Request $request, $id)
    {
        $updated = $this->userService->updateUser($id, $request->all());
        if (!$updated) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin thành công!',
            'data' => $updated
        ]);
    }
}
