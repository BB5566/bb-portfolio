<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContactMessageRequest;
use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    /**
     * 提交聯絡表單 (公開 API)
     */
    public function store(StoreContactMessageRequest $request): JsonResponse
    {
        try {
            $contactMessage = ContactMessage::create($request->validated());

            // 發送 Email 通知給管理員
            if (config('mail.admin_email')) {
                Mail::to(config('mail.admin_email'))
                    ->send(new ContactMessageReceived($contactMessage));
            }

            return response()->json([
                'message' => '您的訊息已成功送出,我們會盡快回覆您!',
                'data' => [
                    'id' => $contactMessage->id,
                    'created_at' => $contactMessage->created_at,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => '訊息送出失敗,請稍後再試',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * 取得所有聯絡訊息 (後台管理用,需要認證)
     */
    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::query()->latest();

        // 篩選: 只顯示未讀
        if ($request->boolean('unread')) {
            $query->unread();
        }

        // 篩選: 只顯示已讀
        if ($request->boolean('read')) {
            $query->read();
        }

        // 搜尋
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $messages = $query->paginate($request->input('per_page', 15));

        return response()->json($messages);
    }

    /**
     * 取得單一訊息詳情 (後台管理用,需要認證)
     */
    public function show(ContactMessage $contactMessage): JsonResponse
    {
        return response()->json($contactMessage);
    }

    /**
     * 標記訊息為已讀 (後台管理用,需要認證)
     */
    public function markAsRead(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->markAsRead();

        return response()->json([
            'message' => '已標記為已讀',
            'data' => $contactMessage->fresh(),
        ]);
    }

    /**
     * 標記訊息為未讀 (後台管理用,需要認證)
     */
    public function markAsUnread(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->markAsUnread();

        return response()->json([
            'message' => '已標記為未讀',
            'data' => $contactMessage->fresh(),
        ]);
    }

    /**
     * 刪除訊息 (後台管理用,需要認證)
     */
    public function destroy(ContactMessage $contactMessage): JsonResponse
    {
        $contactMessage->delete();

        return response()->json([
            'message' => '訊息已刪除',
        ]);
    }

    /**
     * 取得統計資訊 (後台管理用,需要認證)
     */
    public function stats(): JsonResponse
    {
        // 一次查詢得到所有統計，避免 6 次獨立 COUNT
        $stats = ContactMessage::selectRaw('
            COUNT(*) as total,
            SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread,
            SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read_count,
            SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today,
            SUM(CASE WHEN created_at >= DATE(NOW() - INTERVAL WEEKDAY(NOW()) DAY) THEN 1 ELSE 0 END) as this_week,
            SUM(CASE WHEN MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()) THEN 1 ELSE 0 END) as this_month
        ')->first();

        return response()->json([
            'total' => (int) $stats->total,
            'unread' => (int) $stats->unread,
            'read' => (int) $stats->read_count,
            'today' => (int) $stats->today,
            'this_week' => (int) $stats->this_week,
            'this_month' => (int) $stats->this_month,
        ]);
    }
}
