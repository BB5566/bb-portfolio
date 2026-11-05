<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * 登入並取得 API Token
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['提供的憑證不正確。'],
            ]);
        }

        // 刪除舊的 tokens
        $user->tokens()->delete();

        // 建立新 token
        $token = $user->createToken('portfolio-admin')->plainTextToken;

        return response()->json([
            'message' => '登入成功',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * 登出(撤銷 token)
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => '已成功登出',
        ]);
    }

    /**
     * 取得目前登入的使用者資訊
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    /**
     * 註冊新使用者(僅開發環境使用,生產環境應該關閉)
     */
    public function register(Request $request): JsonResponse
    {
        // 檢查是否為開發環境
        if (config('app.env') !== 'local') {
            return response()->json([
                'message' => '註冊功能僅在開發環境可用',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('portfolio-admin')->plainTextToken;

        return response()->json([
            'message' => '註冊成功',
            'user' => $user,
            'token' => $token,
        ], 201);
    }
}
