<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>新的聯絡訊息</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .message-info {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-row {
            margin-bottom: 15px;
            display: flex;
        }
        .info-row:last-child {
            margin-bottom: 0;
        }
        .info-label {
            font-weight: 600;
            color: #667eea;
            min-width: 80px;
            margin-right: 10px;
        }
        .info-value {
            color: #333;
            flex: 1;
        }
        .message-content {
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 20px;
            margin: 20px 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #e0e0e0;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 25px;
            margin: 20px 0;
            font-weight: 600;
            transition: background 0.3s ease;
        }
        .button:hover {
            background: #764ba2;
        }
        .divider {
            height: 1px;
            background: #e0e0e0;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📬 新的聯絡訊息</h1>
        </div>

        <div class="content">
            <p>您好！</p>
            <p>有人透過您的作品集網站聯絡表單發送了一則新訊息：</p>

            <div class="message-info">
                <div class="info-row">
                    <span class="info-label">👤 姓名：</span>
                    <span class="info-value">{{ $contactMessage->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">📧 Email：</span>
                    <span class="info-value">
                        <a href="mailto:{{ $contactMessage->email }}" style="color: #667eea; text-decoration: none;">
                            {{ $contactMessage->email }}
                        </a>
                    </span>
                </div>
                @if($contactMessage->subject)
                <div class="info-row">
                    <span class="info-label">📝 主旨：</span>
                    <span class="info-value">{{ $contactMessage->subject }}</span>
                </div>
                @endif
                <div class="info-row">
                    <span class="info-label">🕐 時間：</span>
                    <span class="info-value">{{ $contactMessage->created_at->format('Y-m-d H:i:s') }}</span>
                </div>
            </div>

            <div class="divider"></div>

            <h3 style="color: #333; margin-bottom: 10px;">訊息內容：</h3>
            <div class="message-content">{{ $contactMessage->message }}</div>

            <div style="text-align: center;">
                <a href="mailto:{{ $contactMessage->email }}?subject=Re: {{ $contactMessage->subject ?? '您的訊息' }}" class="button">
                    立即回覆
                </a>
            </div>
        </div>

        <div class="footer">
            <p style="margin: 0;">此郵件由您的作品集網站自動發送</p>
            <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">
                訊息編號 #{{ $contactMessage->id }}
            </p>
        </div>
    </div>
</body>
</html>
