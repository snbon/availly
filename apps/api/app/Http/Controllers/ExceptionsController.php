<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ExceptionsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // TODO: Implement actual exceptions retrieval
        return response()->json([
            'exceptions' => []
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        // TODO: Implement actual exception creation
        return response()->json([
            'message' => 'Exception created successfully',
            'exception' => $request->all()
        ], 201);
    }
}
