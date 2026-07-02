<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Ticket;
use App\Models\Workspace;
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

        // 2. Create or get a Workspace (Required for ticket foreign key)
        $workspace = Workspace::updateOrCreate(
            ['name' => 'Default Workspace'],
            ['owner_id' => $user->id]
        );

        // 3. Create 5 sample tickets that match your database schema
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