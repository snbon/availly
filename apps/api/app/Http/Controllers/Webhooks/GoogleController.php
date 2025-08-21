<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GoogleController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        // TODO: Implement Google webhook handling
        return response()->json(['status' => 'received']);
    }
}
