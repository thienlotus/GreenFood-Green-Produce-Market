<?php

namespace App\Modules\User\Services;

use App\Modules\User\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserService
{
    public function __construct(
        protected UserRepository $userRepository
    ) {}

    public function register(array $data): array
    {
        if ($this->userRepository->findByEmail($data['email'])) {
            return [
                'success' => false,
                'status' => 400,
                'message' => 'Email này đã được đăng ký tài khoản!'
            ];
        }

        $user = $this->userRepository->create([
            'full_name' => $data['name'] ?? $data['full_name'] ?? '',
            'name' => $data['name'] ?? $data['full_name'] ?? '',
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'role' => strtoupper($data['role'] ?? 'CUSTOMER') === 'ADMIN' ? 'ADMIN' : (strtoupper($data['role'] ?? 'CUSTOMER') === 'VENDOR' ? 'VENDOR' : 'CUSTOMER'),
        ]);

        return [
            'success' => true,
            'status' => 201,
            'message' => 'Đăng ký tài khoản thành công!',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => strtolower($user->role)
            ]
        ];
    }

    public function login(string $email, string $password): array
    {
        $user = $this->userRepository->findByEmail($email) ?: $this->userRepository->findByPhone($email);
        if (!$user || !Hash::check($password, $user->password)) {
            return [
                'success' => false,
                'status' => 401,
                'message' => 'Email hoặc mật khẩu không chính xác!'
            ];
        }

        return [
            'success' => true,
            'status' => 200,
            'message' => 'Đăng nhập thành công!',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => strtolower($user->role),
                'token' => base64_encode(Str::random(40))
            ]
        ];
    }

    public function getUser(string|int $id)
    {
        return $this->userRepository->findById($id);
    }

    public function updateUser(string|int $id, array $data): ?array
    {
        $user = $this->userRepository->findById($id);
        if (!$user) {
            return null;
        }

        $updateData = [];
        if (!empty($data['name'])) $updateData['name'] = $data['name'];
        if (!empty($data['phone'])) $updateData['phone'] = $data['phone'];
        if (!empty($data['address'])) $updateData['address'] = $data['address'];
        if (!empty($data['password'])) $updateData['password'] = Hash::make($data['password']);

        $updated = $this->userRepository->update($user, $updateData);

        return [
            'id' => $updated->id,
            'name' => $updated->name,
            'email' => $updated->email,
            'phone' => $updated->phone,
            'role' => $updated->role
        ];
    }

    public function listUsers(array $filters)
    {
        return $this->userRepository->getAll($filters);
    }
}
