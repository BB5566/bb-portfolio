<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'no-referrer');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->headers->set('Strict-Transport-Security', 'max-age=86400');

        // 條件式 Cache-Control 設定
        $path = $request->path();
        $isPublicApi = str_starts_with($path, 'api/v1/') &&
            ! str_starts_with($path, 'api/v1/admin') &&
                ! str_starts_with($path, 'api/v1/auth') &&
                $request->isMethod('GET');

        if ($isPublicApi) {
            // 公開 GET 端點允許快取 5 分鐘
            $response->headers->set('Cache-Control', 'public, max-age=300', false);
        } else {
            // 管理/認證端點不快取
            $response->headers->set('Cache-Control', 'private, no-cache', false);
        }

        return $response;
    }
}
