<?php

/**
 * Sentry 配置
 *
 * 可選功能 - 若要啟用，請執行：
 *   composer require sentry/sentry-laravel
 *
 * 然後在 .env 配置 SENTRY_DSN
 */

return [
    'dsn' => env('SENTRY_LARAVEL_DSN', env('SENTRY_DSN')),

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production.
    'traces_sample_rate' => (float) env('SENTRY_TRACES_SAMPLE_RATE', 0.1),

    // Capture Replay for 10% of all sessions plus 100% of sessions with errors.
    'profiles_sample_rate' => (float) env('SENTRY_PROFILES_SAMPLE_RATE', 0.1),

    // Set `capture_source_context` to false to omit source code context from stack traces.
    'attach_source' => true,

    // Before send callback to filter events
    'before_send' => function ($event, $hint) {
        // Don't send certain errors
        if (isset($hint['exception'])) {
            $exception = $hint['exception'];

            // Ignore cancelled operations
            if (strpos($exception->getMessage(), 'CANCELLED') !== false) {
                return null;
            }
        }

        return $event;
    },
];
