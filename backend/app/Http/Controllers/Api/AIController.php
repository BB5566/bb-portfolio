<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIController extends Controller
{
    private string $perplexityKey;

    private string $perplexityUrl = 'https://api.perplexity.ai';

    public function __construct()
    {
        $this->perplexityKey = (string) config('services.perplexity.key');
    }

    /**
     * Generate optimized image prompt from diary content
     */
    public function generatePrompt(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|max:5000',
            'style' => 'string|default:default',
            'mood' => 'string|default:😊',
        ]);

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->perplexityKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->perplexityUrl}/chat/completions", [
                    'model' => 'sonar-pro',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are an expert at converting diary entries into vivid, detailed image generation prompts. Create a prompt that captures the emotional essence and mood of the diary entry. Include style, atmosphere, colors, and mood indicators. Respond with only the prompt, no explanations.',
                        ],
                        [
                            'role' => 'user',
                            'content' => "日記內容: {$validated['content']}\n風格: {$validated['style']}\n心情: {$validated['mood']}",
                        ],
                    ],
                    'max_tokens' => 500,
                ]);

            if (! $response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'AI 提示詞生成失敗',
                    'error' => $response->json('error.message') ?? 'Unknown error',
                ], 500);
            }

            $prompt = $response->json('choices.0.message.content');

            return response()->json([
                'success' => true,
                'prompt' => $prompt,
                'provider' => 'perplexity',
            ]);

        } catch (\Exception $e) {
            \Log::error('AI prompt generation failed: '.$e->getMessage(), [
                'content_length' => strlen($validated['content']),
                'style' => $validated['style'],
            ]);

            return response()->json([
                'success' => false,
                'message' => 'AI 文字生成異常',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate inspirational quote from diary content
     */
    public function generateQuote(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|max:5000',
            'mood' => 'string|default:😊',
        ]);

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->perplexityKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->perplexityUrl}/chat/completions", [
                    'model' => 'sonar-pro',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are a compassionate life coach. Generate an uplifting, personalized quote based on the diary entry. Keep it concise (1-2 sentences). Respond only with the quote in Traditional Chinese.',
                        ],
                        [
                            'role' => 'user',
                            'content' => "日記: {$validated['content']}\n心情: {$validated['mood']}",
                        ],
                    ],
                    'max_tokens' => 300,
                ]);

            if (! $response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => '語錄生成失敗',
                    'error' => $response->json('error.message') ?? 'Unknown error',
                ], 500);
            }

            $quote = $response->json('choices.0.message.content');

            return response()->json([
                'success' => true,
                'quote' => $quote,
                'provider' => 'perplexity',
            ]);

        } catch (\Exception $e) {
            \Log::error('AI quote generation failed: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => '語錄生成異常',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate personalized insight from multiple diary entries
     */
    public function dashboardInsight(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'diaries' => 'required|array|min:1',
            'diaries.*.date' => 'required|string',
            'diaries.*.content' => 'required|string',
            'diaries.*.mood_score' => 'integer|min:1|max:10',
        ]);

        try {
            $diaryText = collect($validated['diaries'])
                ->map(fn ($d) => sprintf(
                    '日期: %s, 心情: %d/10, 內容: %s',
                    $d['date'],
                    $d['mood_score'],
                    $d['content']
                ))
                ->join('\n\n');

            $prompt = "請扮演一位專業且富有同理心的心理諮商師。以下是最近的日記：\n\n{$diaryText}\n\n"
               .'請提供一段溫暖、正面的分析（200-300字），包括：\n'
               .'1. 整體情緒趨勢\n'
               .'2. 重複主題\n'
               .'3. 具體建議\n'
               .'4. 鼓勵語言';

            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->perplexityKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->perplexityUrl}/chat/completions", [
                    'model' => 'sonar-pro',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => '你是一位專業的心理諮商師和心靈導師。用溫暖、鼓勵的語氣提供分析和建議。',
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt,
                        ],
                    ],
                    'max_tokens' => 500,
                ]);

            if (! $response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => '洞察生成失敗',
                    'error' => $response->json('error.message') ?? 'Unknown error',
                ], 500);
            }

            $insight = $response->json('choices.0.message.content');

            return response()->json([
                'success' => true,
                'insight' => $insight,
                'provider' => 'perplexity',
            ]);

        } catch (\Exception $e) {
            \Log::error('AI dashboard insight generation failed: '.$e->getMessage(), [
                'diary_count' => count($validated['diaries']),
            ]);

            return response()->json([
                'success' => false,
                'message' => '洞察生成異常',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
