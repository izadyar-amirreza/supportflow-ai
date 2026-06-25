<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceAiSettingsController extends Controller
{
    public function edit(Request $request, Workspace $workspace): Response
    {
        // Note: In a real production app, ensure you authorize that the user 
        // is an admin/owner of this specific workspace before proceeding.

        return Inertia::render('Workspaces/AiSettings', [
            'workspace' => [
                'id'          => $workspace->id,
                'name'        => $workspace->name,
                'ai_provider' => $workspace->ai_provider ?? 'fake',
                'ai_model'    => $workspace->ai_model ?? '',
            ],
            // For security, never send the actual API key to the frontend.
            // We only send a boolean to let the UI know if a key is already saved.
            'hasApiKey' => !empty($workspace->ai_api_key),
        ]);
    }

    public function update(Request $request, Workspace $workspace): RedirectResponse
    {
        $validated = $request->validate([
            'ai_provider' => ['required', 'string', 'in:fake,openai,gemini'],
            'ai_model'    => ['nullable', 'string', 'max:255'],
            'ai_api_key'  => ['nullable', 'string', 'max:1000'],
        ]);

        $workspace->ai_provider = $validated['ai_provider'];
        $workspace->ai_model = $validated['ai_model'];

        // Only overwrite the API key in the database if the user provided a new one.
        if (!empty($validated['ai_api_key'])) {
            // 🌟 SUPER CLEANER: Remove any accidental spaces or hidden newline characters
            $cleanKey = trim(preg_replace('/\s+/', '', $validated['ai_api_key']));
            $workspace->ai_api_key = $cleanKey;
        }

        $workspace->save();

        return back()->with('success', 'Workspace AI settings updated successfully.');
    }
}