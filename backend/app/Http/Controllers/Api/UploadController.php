<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class UploadController extends Controller
{
    /**
     * 從前端元件上傳影像並自動轉換為 WebP
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|max:10240', // 最大 10MB
            'folder' => 'nullable|string|max:50',
        ]);

        try {
            $file = $request->file('file');
            $folder = $request->input('folder', 'projects');

            // 讀取影像
            $image = Image::read($file);

            // 尺寸上限設定
            $maxWidth = 1920;
            $maxHeight = 1080;

            // 等比例縮小至指定尺寸上限，保持長寬比
            $image->scaleDown($maxWidth, $maxHeight);

            // 轉換為 WebP (品質 80 是平衡點)
            $encoded = $image->toWebp(quality: 80);

            // 生成隨機檔名
            $filename = $folder.'/'.Str::uuid().'.webp';

            // 儲存到 public 磁碟
            Storage::disk('public')->put($filename, (string) $encoded);

            return response()->json([
                'success' => true,
                'data' => [
                    'url' => $filename,
                    'full_url' => Storage::disk('public')->url($filename),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => '影像處理失敗：'.$e->getMessage(),
            ], 500);
        }
    }
}
