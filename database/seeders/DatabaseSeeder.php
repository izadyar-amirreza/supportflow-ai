<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Ticket;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create or get an Admin User
        $user = User::updateOrCreate(
            ['email' => 'demo@supportflow.ai'],
            [
                'name' => 'SupportFlow Admin',
                'password' => Hash::make('demo123456'),
            ]
        );

        // 2. Create or get a Workspace
        $workspace = Workspace::updateOrCreate(
            ['name' => 'Default Workspace'],
            [
                'owner_id' => $user->id,
                'slug' => 'default-workspace'
            ]
        );

        // 3. Create Workspace Membership (Crucial step to prevent 404 errors)
        WorkspaceMember::updateOrCreate(
            [
                'workspace_id' => $workspace->id,
                'user_id' => $user->id,
            ],
            [
                'role' => 'owner',
            ]
        );

        // 4. Create 5 sample tickets
        for ($i = 1; $i <= 5; $i++) {
            Ticket::create([
                'workspace_id' => $workspace->id,
                'created_by'   => $user->id,
                'title'        => 'Sample Ticket #' . $i,
                'description'  => 'This is a test description for ticket ' . $i,
                'status'       => 'open',
                'priority'     => 'medium',
            ]);
        }
    }
}