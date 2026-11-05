<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AIControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Mock API response
        Http::fake([
            'api.perplexity.ai/*' => Http::response([
                'choices' => [
                    [
                        'message' => [
                            'content' => 'mocked ai response',
                        ],
                    ],
                ],
            ], 200),
        ]);
    }

    public function test_generate_prompt_works_without_style_and_mood()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/ai/generate-prompt', [
            'content' => 'Today was a good day.',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'prompt' => 'mocked ai response',
        ]);
    }

    public function test_generate_quote_works_without_mood()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/ai/generate-quote', [
            'content' => 'Today was a good day.',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'quote' => 'mocked ai response',
        ]);
    }

    public function test_generate_prompt_works_with_style_and_mood()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/ai/generate-prompt', [
            'content' => 'Today was a good day.',
            'style' => 'pixel art',
            'mood' => 'sad',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'prompt' => 'mocked ai response',
        ]);
    }

    public function test_dashboard_insight_works()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/ai/dashboard-insight', [
            'diaries' => [
                [
                    'date' => '2023-10-01',
                    'content' => 'Had a great day today.',
                    'mood_score' => 8,
                ],
            ],
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'insight' => 'mocked ai response',
        ]);
    }
}
