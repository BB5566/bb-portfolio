<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 建立管理員帳號
        $adminEmail = env('ADMIN_EMAIL', 'admin@bb-made.com');
        User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'Admin',
                'password' => Hash::make(env('ADMIN_PASSWORD', 'please_change_this')), // 請在 .env 設定 ADMIN_PASSWORD
            ]
        );

        $this->command->info("管理員帳號已建立：{$adminEmail} (密碼請查看 .env 的 ADMIN_PASSWORD)");
    }
}
