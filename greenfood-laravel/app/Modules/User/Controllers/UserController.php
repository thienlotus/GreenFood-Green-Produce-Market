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
        $account = $request->input('account') ?? $request->input('email') ?? $request->input('username');
        $password = $request->input('password');

        if (empty($account)) {
            return response()->json([
                'success' => false,
                'status' => 400,
                'message' => 'Vui lòng nhập email hoặc số điện thoại đăng nhập!'
            ], 400);
        }

        if (empty($password)) {
            return response()->json([
                'success' => false,
                'status' => 400,
                'message' => 'Vui lòng nhập mật khẩu!'
            ], 400);
        }

        $result = $this->userService->login($account, $password);

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

    public function updateProfile(Request $request, $id)
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

    public function changePassword(Request $request, $id)
    {
        $oldPassword = $request->input('old_password') ?? $request->input('oldPassword');
        $newPassword = $request->input('new_password') ?? $request->input('newPassword');

        if (empty($oldPassword) || empty($newPassword)) {
            return response()->json([
                'success' => false,
                'status' => 400,
                'message' => 'Vui lòng cung cấp đầy đủ mật khẩu cũ và mới!'
            ], 400);
        }

        $res = $this->userService->changePassword($id, $oldPassword, $newPassword);
        return response()->json($res, $res['status'] ?? 200);
    }

    public function updateRole(Request $request, $id)
    {
        $role = $request->input('role');
        if (empty($role)) {
            return response()->json([
                'success' => false,
                'status' => 400,
                'message' => 'Vui lòng chỉ định vai trò mới!'
            ], 400);
        }

        $updated = $this->userService->updateUser($id, ['role' => $role]);
        if (!$updated) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật quyền tài khoản thành công!',
            'data' => $updated
        ]);
    }

    public function destroy($id)
    {
        $deleted = $this->userService->deleteUser($id);
        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại hoặc không thể xóa'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Xóa tài khoản người dùng thành công!'
        ]);
    }
}
