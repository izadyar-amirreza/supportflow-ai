<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Ticket;
use App\Models\KnowledgeBase;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create the admin user (only if it doesn't exist)
        User::updateOrCreate(
            ['email' => 'demo@supportflow.ai'],
            [
                'name' => 'SupportFlow Admin',
                'password' => Hash::make('demo123456'),
            ]
        );

        // 2. Create 20 sample tickets automatically
        for ($i = 1; $i <= 20; $i++) {
            Ticket::create([
                'subject' => 'Sample Ticket #' . $i,
                'message' => 'This is an automatically generated message for ticket number ' . $i . '.',
                'priority' => $i % 2 === 0 ? 'high' : 'low',
                'status' => 'open',
                'customer_name' => 'Client ' . $i
            ]);
        }

        // 3. Create sample Knowledge Base entries
        KnowledgeBase::updateOrCreate(
            ['title' => 'Refund Policy'],
            ['content' => 'Customers can request a full refund within 7 days of purchase.']
        );

        KnowledgeBase::updateOrCreate(
            ['title' => 'Password Recovery'],
            ['content' => 'Click "Forgot Password" on the login page to receive a recovery link via email.']
        );
    }
}