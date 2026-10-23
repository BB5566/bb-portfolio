<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class CacheService
{
    /**
     * 快取鍵對應表
     */
    protected static array $cacheKeys = [
        'projects' => ['projects.published', 'dashboard.stats'],
        'categories' => ['categories.all', 'dashboard.stats'],
        'tags' => ['tags.all', 'dashboard.stats'],
        'experiences' => ['experiences.visible', 'dashboard.stats'],
        'education' => ['education.visible', 'dashboard.stats'],
        'profile' => ['profile.data', 'dashboard.stats'],
    ];

    /**
     * 清除特定實體的相關快取
     */
    public static function clearFor(string $entity): void
    {
        $keys = self::$cacheKeys[$entity] ?? [];
        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * 清除所有快取
     */
    public static function clearAll(): void
    {
        $allKeys = [];
        foreach (self::$cacheKeys as $keys) {
            $allKeys = array_merge($allKeys, $keys);
        }

        foreach (array_unique($allKeys) as $key) {
            Cache::forget($key);
        }
    }

    /**
     * 清除 Dashboard 統計快取
     */
    public static function clearDashboard(): void
    {
        Cache::forget('dashboard.stats');
    }

    /**
     * 取得快取或執行回調並儲存
     */
    public static function remember(string $key, int $ttl, callable $callback): mixed
    {
        return Cache::remember($key, $ttl, $callback);
    }
}
