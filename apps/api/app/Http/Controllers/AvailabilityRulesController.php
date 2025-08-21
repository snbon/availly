<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AvailabilityRulesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // TODO: Implement actual availability rules retrieval
        return response()->json([
            'rules' => [
                [
                    'id' => 1,
                    'weekday' => 1,
                    'start_time_local' => '09:00:00',
                    'end_time_local' => '12:00:00'
                ],
                [
                    'id' => 2,
                    'weekday' => 1,
                    'start_time_local' => '15:00:00',
                    'end_time_local' => '18:00:00'
                ]
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        // TODO: Implement actual availability rule creation
        return response()->json([
            'message' => 'Availability rule created successfully',
            'rule' => $request->all()
        ], 201);
    }
}
