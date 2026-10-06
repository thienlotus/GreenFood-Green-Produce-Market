<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Farmer;
use App\Models\Region;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FarmerTest extends TestCase
{
    use RefreshDatabase;

    protected Region $region;
    protected User $user;
    protected Farmer $farmer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->region = Region::create([
            'name' => 'Miền Tây Nam Bộ',
            'slug' => 'mientay',
            'zone' => 'south',
            'description' => 'Vựa trái cây lớn nhất cả nước',
        ]);

        $this->user = User::create([
            'full_name' => 'Chú Bảy Nông Dân',
            'phone' => '0912345678',
            'email' => 'chubay@greenfood.test',
            'password' => bcrypt('password123'),
            'role' => 'VENDOR',
            'email_verified' => true,
        ]);

        $this->farmer = Farmer::create([
            'user_id' => $this->user->id,
            'farm_name' => 'Vườn Trái Cây Chú Bảy',
            'story' => 'Vườn bưởi da xanh và sầu riêng hữu cơ canh tác bền vững.',
            'address' => 'Bến Tre, Việt Nam',
            'region_id' => $this->region->id,
            'rating' => 4.9,
            'is_verified' => true,
        ]);
    }

    public function test_can_get_farmers_list(): void
    {
        $response = $this->getJson('/api/v1/farmers');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('count', 1)
            ->assertJsonStructure([
                'success',
                'count',
                'data' => [
                    '*' => ['id', 'farm_name', 'address', 'region_id']
                ]
            ]);
    }

    public function test_can_filter_farmers_by_zone(): void
    {
        $response = $this->getJson('/api/v1/farmers?zone=south');
        $response->assertStatus(200)
            ->assertJsonPath('count', 1);

        $responseEmpty = $this->getJson('/api/v1/farmers?zone=north');
        $responseEmpty->assertStatus(200)
            ->assertJsonPath('count', 0);
    }

    public function test_can_get_farmer_detail(): void
    {
        $response = $this->getJson("/api/v1/farmers/{$this->farmer->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.farm_name', 'Vườn Trái Cây Chú Bảy')
            ->assertJsonPath('data.id', $this->farmer->id);
    }

    public function test_get_non_existent_farmer_returns_404(): void
    {
        $response = $this->getJson('/api/v1/farmers/non-existent-uuid');

        $response->assertStatus(404)
            ->assertJsonPath('success', false);
    }

    public function test_can_register_new_farmer(): void
    {
        $payload = [
            'farm_name' => 'Hợp Tác Xã Rau Đà Lạt',
            'phone' => '0988776655',
            'name' => 'Nguyễn Văn Đà Lạt',
            'email' => 'dalatfarm@test.com',
            'address' => 'Đà Lạt, Lâm Đồng',
            'specialty' => 'Rau củ hữu cơ Đà Lạt',
        ];

        $response = $this->postJson('/api/v1/farmers/register', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.farm_name', 'Hợp Tác Xã Rau Đà Lạt');

        $this->assertDatabaseHas('farmers', [
            'farm_name' => 'Hợp Tác Xã Rau Đà Lạt',
        ]);
        $this->assertDatabaseHas('users', [
            'phone' => '0988776655',
            'role' => 'VENDOR',
        ]);
    }

    public function test_admin_can_list_and_update_status(): void
    {
        $resList = $this->getJson('/api/v1/admin/farmers');
        $resList->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('count', 1);

        // Update status to false
        $resStatus = $this->putJson("/api/v1/admin/farmers/{$this->farmer->id}/status", [
            'is_verified' => false,
        ]);
        $resStatus->assertStatus(200)->assertJsonPath('success', true);

        $this->assertDatabaseHas('farmers', [
            'id' => $this->farmer->id,
            'is_verified' => false,
        ]);
    }

    public function test_admin_can_delete_farmer(): void
    {
        $resDelete = $this->deleteJson("/api/v1/admin/farmers/{$this->farmer->id}");
        $resDelete->assertStatus(200)->assertJsonPath('success', true);

        $this->assertDatabaseMissing('farmers', [
            'id' => $this->farmer->id,
        ]);
    }

    public function test_backward_compatibility_without_v1_prefix(): void
    {
        $response = $this->getJson('/api/farmers');
        $response->assertStatus(200)->assertJsonPath('success', true);
    }
}
