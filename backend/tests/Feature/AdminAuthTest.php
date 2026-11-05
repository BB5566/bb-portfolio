<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

final class AdminAuthTest extends TestCase
{
    public function test_guest_without_json_accept_gets_401_not_500(): void
    {
        // 掃描器、瀏覽器直接開網址都不會帶 Accept: application/json
        $this->get('/api/v1/admin/projects')
            ->assertUnauthorized()
            ->assertJsonPath('message', 'Unauthenticated.');
    }

    public function test_guest_with_json_accept_gets_401(): void
    {
        $this->getJson('/api/v1/admin/projects')->assertUnauthorized();
    }
}
