Welcome to MyFreeSlots!

Hi {{ $user->name }},

Please verify your email address to get started with MyFreeSlots.

Your verification code is: {{ $verificationCode }}

This code will expire in 24 hours.

You can also click this link to verify automatically:
{{ env('FRONTEND_URL', 'http://localhost:5173') }}/verify-email?email={{ urlencode($user->email) }}&code={{ $verificationCode }}

If you didn't create an account with MyFreeSlots, you can safely ignore this email.

---
© 2024 MyFreeSlots. Crafted with excellence.
