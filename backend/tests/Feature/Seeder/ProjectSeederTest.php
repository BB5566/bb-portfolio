<?php

namespace Tests\Feature\Seeder;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class ProjectSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeder_preserves_is_published_status_and_gallery_ids()
    {
        // 1. Arrange: Seed database initially
        Artisan::call('db:seed', ['--class' => 'DatabaseSeeder']);

        // Find a project and unpublish it
        $project = Project::first();
        $project->is_published = false;
        $project->save();

        // Find a project with galleries and record the gallery IDs
        $projectWithGalleries = Project::has('galleries')->first();
        $originalGalleryIds = $projectWithGalleries->galleries->pluck('id')->sort()->values()->toArray();

        // 2. Act: Run seeder again
        Artisan::call('db:seed', ['--class' => 'ProjectSeeder']);

        // 3. Assert: Project should still be unpublished
        $project->refresh();
        $this->assertFalse($project->is_published, 'The seeder should not overwrite the manually updated is_published state.');

        // 3. Assert: Gallery IDs should be identical (no deletes/re-creates)
        $projectWithGalleries->refresh();
        $newGalleryIds = $projectWithGalleries->galleries->pluck('id')->sort()->values()->toArray();

        $this->assertEquals($originalGalleryIds, $newGalleryIds, 'The seeder should update existing galleries instead of recreating them, preserving their IDs.');
    }

    public function test_featured_projects_have_case_study()
    {
        Artisan::call('db:seed', ['--class' => 'ProjectSeeder']);

        // 首頁精選＝有 case_study 的作品，照 sort_order 排
        $featured = Project::whereNotNull('case_study')->orderBy('sort_order')->get();

        $this->assertSame(
            ['how-i-review-ai-code', 'ai-content-pipeline', 'student-page-load-optimization'],
            $featured->pluck('slug')->all()
        );
        foreach ($featured as $project) {
            $this->assertNotEmpty($project->case_study['problem']);
            $this->assertNotEmpty($project->case_study['approach']);
            $this->assertNotEmpty($project->case_study['result']);
        }
        $this->assertSame('pipeline', $featured->firstWhere('slug', 'ai-content-pipeline')->case_study['demo']);
        $this->assertSame(3040, $featured->firstWhere('slug', 'student-page-load-optimization')->case_study['compare']['before']);
    }
}
