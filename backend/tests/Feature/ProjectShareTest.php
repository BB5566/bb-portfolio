<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

final class ProjectShareTest extends TestCase
{
    use RefreshDatabase;

    // 跟正式 index.html 同樣的寫法（description 換行、og:image 帶尺寸）
    private const INDEX_HTML = <<<'HTML'
<!DOCTYPE html><html><head>
<title>Bob Tsou | 實戰型 AI 應用工程師 作品集</title>
<meta name="description"
    content="首頁描述">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://bb-made.com">
<meta property="og:type" content="website">
<meta property="og:url" content="https://bb-made.com">
<meta property="og:title" content="首頁標題">
<meta property="og:description" content="首頁描述">
<meta property="og:image" content="https://bb-made.com/og-image-v3.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:url" content="https://bb-made.com">
<meta name="twitter:title" content="首頁標題">
<meta name="twitter:description" content="首頁描述">
<meta name="twitter:image" content="https://bb-made.com/og-image-v3.png">
</head><body><div id="app"></div><script type="module" src="/assets/index-abc.js"></script></body></html>
HTML;

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake(['*/index.html' => Http::response(self::INDEX_HTML)]);
        Artisan::call('db:seed', ['--class' => 'DatabaseSeeder']);
    }

    public function test_project_page_carries_its_own_share_preview(): void
    {
        $project = Project::published()->whereNotNull('cover_image_url')->firstOrFail();
        $url = "https://bb-made.com/projects/{$project->id}";

        $response = $this->get("/api/v1/share/projects/{$project->id}");

        $response->assertOk()
            ->assertHeader('Content-Type', 'text/html; charset=UTF-8')
            ->assertSee('<title>'.e($project->title).' | Bob Tsou 作品集</title>', false)
            ->assertSee('<link rel="canonical" href="'.$url.'">', false)
            ->assertSee('<meta property="og:url" content="'.$url.'">', false)
            ->assertSee('<meta property="og:type" content="article">', false)
            ->assertSee('<meta property="og:image" content="https://bb-made.com/'.ltrim($project->cover_image_url, '/').'">', false)
            ->assertDontSee('og:image:width', false)
            ->assertDontSee('首頁描述', false)
            // Vue 照樣接手
            ->assertSee('/assets/index-abc.js', false);
    }

    public function test_missing_project_is_404_and_noindex(): void
    {
        $this->get('/api/v1/share/projects/999999')
            ->assertNotFound()
            ->assertSee('<meta name="robots" content="noindex">', false)
            ->assertSee('/assets/index-abc.js', false);
    }

    public function test_unpublished_project_is_404(): void
    {
        $project = Project::published()->firstOrFail();
        $project->update(['is_published' => false]);

        $this->get("/api/v1/share/projects/{$project->id}")->assertNotFound();
    }
}
