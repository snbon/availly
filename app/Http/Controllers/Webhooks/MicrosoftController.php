<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MicrosoftController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        // TODO: Implement Microsoft webhook handling
        return response()->json(['status' => 'received']);
    }
}
