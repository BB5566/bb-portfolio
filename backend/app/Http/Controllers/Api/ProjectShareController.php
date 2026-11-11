<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * 作品頁 /projects/{id} 的 HTML：拿前端的 index.html，換上這件作品的標題、描述、封面。
 * LINE、FB、LinkedIn 抓預覽卡片時不跑 JS，所以要在伺服器端就填好；畫面照樣由 Vue 接手。
 */
final class ProjectShareController extends Controller
{
    private const SITE = 'https://bb-made.com';

    public function __invoke(int $id): Response
    {
        $html = Http::timeout(3)
            ->get(config('services.frontend.internal_url').'/index.html')
            ->throw()
            ->body();

        $project = Project::published()->find($id);

        if (! $project) {
            $html = self::replaceTag($html, '<meta name="robots"[^>]*>', '<meta name="robots" content="noindex">');

            return self::htmlResponse($html, 404);
        }

        $url = self::SITE."/projects/{$project->id}";
        $title = "{$project->title} | Bob Tsou 作品集";
        $description = Str::limit(trim((string) preg_replace('/\s+/u', ' ', (string) $project->description)), 150);
        $image = $project->cover_image_url
            ? self::SITE.'/'.ltrim($project->cover_image_url, '/')
            : self::SITE.'/og-image-v5.png';

        $tags = [
            '<title>.*?</title>' => '<title>'.e($title).'</title>',
            '<meta name="description"[^>]*>' => '<meta name="description" content="'.e($description).'">',
            '<link rel="canonical"[^>]*>' => '<link rel="canonical" href="'.e($url).'">',
            '<meta property="og:type"[^>]*>' => '<meta property="og:type" content="article">',
            '<meta property="og:url"[^>]*>' => '<meta property="og:url" content="'.e($url).'">',
            '<meta property="og:title"[^>]*>' => '<meta property="og:title" content="'.e($title).'">',
            '<meta property="og:description"[^>]*>' => '<meta property="og:description" content="'.e($description).'">',
            '<meta property="og:image"[^>]*>' => '<meta property="og:image" content="'.e($image).'">',
            // 首頁卡片是 1200×630，作品封面尺寸不一，不寫死
            '<meta property="og:image:(?:width|height)"[^>]*>\s*' => '',
            '<meta name="twitter:url"[^>]*>' => '<meta name="twitter:url" content="'.e($url).'">',
            '<meta name="twitter:title"[^>]*>' => '<meta name="twitter:title" content="'.e($title).'">',
            '<meta name="twitter:description"[^>]*>' => '<meta name="twitter:description" content="'.e($description).'">',
            '<meta name="twitter:image"[^>]*>' => '<meta name="twitter:image" content="'.e($image).'">',
        ];

        foreach ($tags as $pattern => $replacement) {
            $html = self::replaceTag($html, $pattern, $replacement);
        }

        return self::htmlResponse($html, 200);
    }

    private static function replaceTag(string $html, string $pattern, string $replacement): string
    {
        return (string) preg_replace('#'.$pattern.'#su', addcslashes($replacement, '\\$'), $html, 1);
    }

    private static function htmlResponse(string $html, int $status): Response
    {
        // 跟 index.html 一樣每次都問一下，部署換新 JS 檔名時才不會拿到舊頁
        return response($html, $status)
            ->header('Content-Type', 'text/html; charset=UTF-8')
            ->header('Cache-Control', 'no-cache');
    }
}
