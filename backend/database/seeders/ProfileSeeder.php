<?php

namespace Database\Seeders;

use App\Models\Profile;
use Illuminate\Database\Seeder;

class ProfileSeeder extends Seeder
{
    public function run(): void
    {
        Profile::updateOrCreate(
            ['id' => 1],
            [
                'name' => 'Bob Tsou',
                'title' => 'AI 應用工程師',
                'bio' => '專精 Vue.js、TypeScript、Laravel 的前端工程師，擁有 8 年設計經驗及 1200+ 小時開發訓練。專注於打造高品質的使用者介面與互動體驗。',
                'avatar_url' => '/uploads/avatar.jpg',
                'github' => 'https://github.com/BB5566',
                'linkedin' => null,
                'email' => 'mobbsong@gmail.com',
                'location' => 'New Taipei City, Taiwan',
                'years_of_experience' => 8,
                'projects_count' => 5,
                'training_hours' => 1200,
            ]
        );

        $this->command->info('Profile 已更新');
    }
}
