<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PublicAvailabilityController extends Controller
{
    public function show(string $slug, Request $request): JsonResponse
    {
        // TODO: Implement actual availability calculation
        return response()->json([
            'slug' => $slug,
            'range' => $request->get('range'),
            'availability' => [
                'windows' => [
                    [
                        'start' => '2025-08-21T09:00:00Z',
                        'end' => '2025-08-21T12:00:00Z',
                        'type' => 'available'
                    ],
                    [
                        'start' => '2025-08-21T15:00:00Z',
                        'end' => '2025-08-21T18:00:00Z',
                        'type' => 'available'
                    ]
                ],
                'busy' => [
                    [
                        'start' => '2025-08-21T10:30:00Z',
                        'end' => '2025-08-21T11:30:00Z',
                        'type' => 'busy'
                    ]
                ]
            ]
        ]);
    }
}
