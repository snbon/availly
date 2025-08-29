<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Availly</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }

        .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6);
            border-radius: 16px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }

        .verification-code {
            background: #f3e8ff;
            border: 2px solid #e9d5ff;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }

        .code {
            font-size: 32px;
            font-weight: bold;
            color: #7c3aed;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
        }

        .button {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6, #6366f1, #3b82f6);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                📅
            </div>
            <h1>Welcome to Availly!</h1>
            <p>Hi {{ $user->name ?? 'there' }}, please verify your email address to get started.</p>
        </div>

        <div class="verification-code">
            <p><strong>Your verification code is:</strong></p>
            <div class="code">{{ $verificationCode }}</div>
            <p><small>This code will expire in 24 hours</small></p>
        </div>

        <p>Enter this code in the app to verify your email address and start managing your calendar.</p>

        <div style="text-align: center;">
            <a href="{{ config('app.frontend_url', 'https://availly.me') }}/verify-email?email={{ urlencode($user->email) }}&code={{ $verificationCode }}"
                class="button">
                Verify Email Address
            </a>
        </div>

        <div class="footer">
            <p>If you didn't create an account with Availly, you can safely ignore this email.</p>
            <p>&copy; 2025 Availly. Product by Baghlabs.</p>
        </div>
    </div>
</body>

</html>