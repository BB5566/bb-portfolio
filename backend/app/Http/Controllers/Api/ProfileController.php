<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\ProfileResource;
use App\Models\Profile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class ProfileController extends Controller
{
    /**
     * Display the profile (only one profile exists).
     * 快取 1 小時,提升前台載入速度
     */
    public function index()
    {
        $profile = Cache::remember('profile.data', 3600, function () {
            return Profile::first();
        });

        if (! $profile) {
            return response()->json([
                'message' => 'Profile not found',
            ], 404);
        }

        return new ProfileResource($profile);
    }

    /**
     * Store is not used (only one profile)
     */
    public function store(UpdateProfileRequest $request)
    {
        return $this->update($request);
    }

    /**
     * Update the profile.
     */
    public function update(UpdateProfileRequest $request)
    {
        $validated = $request->validated();

        $profile = Profile::firstOrCreate(
            ['id' => 1],
            ['name' => 'Default Name']
        );

        // Handle avatar upload (Convert to WebP)
        if ($request->hasFile('avatar')) {
            if ($profile->avatar) {
                Storage::disk('public')->delete($profile->avatar);
            }

            $file = $request->file('avatar');
            $image = Image::read($file);

            // 尺寸上限設定 (頭像適用較小尺寸)
            $maxWidth = 800;
            $maxHeight = 800;

            // 等比例縮小至指定尺寸上限，保持長寬比
            $encoded = $image->scaleDown($maxWidth, $maxHeight)->toWebp(quality: 80);

            $filename = 'avatars/'.uniqid().'.webp';
            Storage::disk('public')->put($filename, (string) $encoded);

            $validated['avatar'] = $filename;
        }

        // Handle resume upload (PDF)
        if ($request->hasFile('resume')) {
            // Delete old resume if exists
            if ($profile->resume_url) {
                Storage::disk('public')->delete($profile->resume_url);
            }

            $path = $request->file('resume')->store('resumes', 'public');
            $validated['resume_url'] = $path;
        }

        $profile->update($validated);

        // 清除快取
        Cache::forget('profile.data');

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $profile,
        ]);
    }
}
