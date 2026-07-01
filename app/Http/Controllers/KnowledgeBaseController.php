<?php

namespace App\Http\Controllers;

use App\Models\KnowledgeBase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KnowledgeBaseController extends Controller
{
    public function index()
    {
        // Fetching all rules for the current workspace (assuming ID 1 for now)
        $articles = KnowledgeBase::where('workspace_id', 1)->latest()->get();

        return Inertia::render('KnowledgeBase/Index', [
            'articles' => $articles,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'content' => 'required|string',
        ]);

        KnowledgeBase::create([
            'workspace_id' => 1,
            'title' => $request->title,
            'category' => $request->category,
            'content' => $request->content,
        ]);

        return redirect()->back()->with('success', 'Knowledge base article added successfully!');
    }

    public function destroy(KnowledgeBase $knowledgeBase)
    {
        $knowledgeBase->delete();

        return redirect()->back()->with('success', 'Article deleted successfully!');
    }
}