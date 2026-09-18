<?php

namespace App\Modules\User\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class UserRepository
{
    public function findById(string|int $id): ?User
    {
        return User::find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function findByPhone(string $phone): ?User
    {
        return User::where('phone', $phone)->first();
    }

    public function findByAccount(string $account): ?User
    {
        $account = trim($account);
        $user = User::where('email', $account)
            ->orWhere('phone', $account)
            ->first();

        if (!$user && strtolower($account) === 'admin') {
            $user = User::where('role', 'ADMIN')->first();
        }

        return $user;
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(User $user, array $data): User
    {
        $user->update($data);
        return $user;
    }

    public function delete(string|int $id): bool
    {
        $user = $this->findById($id);
        return $user ? (bool) $user->delete() : false;
    }

    public function getAll(array $filters = []): Collection
    {
        $query = User::latest();

        if (!empty($filters['role'])) {
            $query->where('role', strtoupper($filters['role']));
        }

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return $query->get();
    }

    public function count(): int
    {
        return User::count();
    }
}
