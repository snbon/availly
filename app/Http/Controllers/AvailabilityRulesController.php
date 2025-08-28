<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\AvailabilityRule;

class AvailabilityRulesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $rules = $user->availabilityRules()
            ->orderBy('weekday')
            ->orderBy('start_time_local')
            ->get();

        return response()->json([
            'rules' => $rules->map(function ($rule) {
                return [
                    'id' => $rule->id,
                    'weekday' => $rule->weekday,
                    'weekday_name' => $rule->weekday_name,
                    'start_time_local' => $rule->start_time_local,
                    'end_time_local' => $rule->end_time_local,
                    'created_at' => $rule->created_at,
                    'updated_at' => $rule->updated_at
                ];
            })
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Debug: Log the incoming request data
        \Log::info('Availability rules store request', [
            'user_id' => $user->id,
            'request_data' => $request->all(),
            'rules' => $request->input('rules')
        ]);

        $request->validate([
            'rules' => 'required|array',
            'rules.*.weekday' => 'required|integer|min:0|max:6',
            'rules.*.start_time_local' => 'required|string|date_format:H:i',
            'rules.*.end_time_local' => 'required|string|date_format:H:i',
        ]);

        // Clear existing rules for the user
        $user->availabilityRules()->delete();

        // Create new rules
        $createdRules = [];
        foreach ($request->rules as $ruleData) {
            $rule = $user->availabilityRules()->create([
                'weekday' => $ruleData['weekday'],
                'start_time_local' => $ruleData['start_time_local'],
                'end_time_local' => $ruleData['end_time_local']
            ]);

            $createdRules[] = [
                'id' => $rule->id,
                'weekday' => $rule->weekday,
                'weekday_name' => $rule->weekday_name,
                'start_time_local' => $rule->start_time_local,
                'end_time_local' => $rule->end_time_local
            ];
        }

        return response()->json([
            'message' => 'Availability rules saved successfully',
            'rules' => $createdRules
        ], 201);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $rule = $user->availabilityRules()->findOrFail($id);
        $rule->delete();

        return response()->json([
            'message' => 'Availability rule deleted successfully'
        ]);
    }
}
