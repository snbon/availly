<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LinksController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // TODO: Implement actual links retrieval
        return response()->json([
            'links' => [
                [
                    'id' => 1,
                    'slug' => 'john-doe',
                    'type' => 'primary',
                    'is_active' => true
                ]
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        // TODO: Implement actual link creation
        return response()->json([
            'message' => 'Link created successfully',
            'link' => $request->all()
        ], 201);
    }
}
