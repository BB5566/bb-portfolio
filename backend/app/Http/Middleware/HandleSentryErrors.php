<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleSentryErrors
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            return $next($request);
        } catch (\Throwable $exception) {
            // Sentry 已透過 service provider 自動註冊異常處理程式
            // 此中間件為額外上下文
            \Sentry\captureException($exception);
            throw $exception;
        }
    }
}
