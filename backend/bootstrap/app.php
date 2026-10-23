<?php

declare(strict_types=1);

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // 設定 API 認證失敗時不要重定向
            config(['app.redirect_if_unauthenticated' => false]);
        }
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // 設定信任代理 IP 範圍 (生產環境建議設定 Cloudflare IP)
        // Cloudflare IPv4: 173.245.48.0/20, 103.21.244.0/22, 103.22.200.0/22, 103.31.4.0/22, 141.101.64.0/18,
        //                   108.162.192.0/18, 190.93.240.0/20, 188.114.96.0/20, 197.234.240.0/22, 198.41.128.0/17,
        //                   162.158.0.0/15, 104.16.0.0/13, 104.24.0.0/14, 172.64.0.0/13, 131.0.72.0/22
        // Cloudflare IPv6: 2400:cb00::/32, 2606:4700::/32, 2803:f800::/32, 2405:b500::/32,
        //                   2405:8100::/32, 2a06:98c0::/29, 2c0f:f248::/32
        // 使用逗號分隔設定於 TRUSTED_PROXIES 環境變數
        $middleware->trustProxies(at: explode(',', env('TRUSTED_PROXIES', '127.0.0.1')));

        // 對於 API 路由,我們使用 token 認證,不需要 CSRF 保護
        // Sanctum 的 EnsureFrontendRequestsAreStateful 僅用於 session-based SPA
        // 目前我們使用的是 API Token 認證,所以註解掉
        // $middleware->api(prepend: [
        //     \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        // ]);

        // 排除 API 路由的 CSRF 驗證
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);

        $middleware->api(append: [
            \App\Http\Middleware\SecurityHeaders::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // API 認證失敗時返回 JSON 而不是重定向
        $exceptions->renderable(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        });
    })
    ->create();
