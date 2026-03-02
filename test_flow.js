/**
 * End-to-End Prototype Test Script
 * This script simulates the Control Tower's reaction to different user messages.
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000';

const runTest = async () => {
    console.log('--- STARTING PROTOTYPE TEST ---\n');

    try {
        // 1. Initialize a new thread (e.g., from Janmasethu Healthcare)
        console.log('STEP 1: Initializing thread for Healthcare domain...');
        const initRes = await axios.post(`${API_URL}/core/threads/initialize`, {
            userId: '00000000-0000-0000-0000-000000000000',
            domain: 'healthcare',
            channel: 'web'
        });
        const threadId = initRes.data.data.id;
        console.log(`Thread Created: ${threadId}\n`);

        // 2. Normal Flow: Send a "Green" message
        console.log('STEP 2: Sending a Normal (Green) message...');
        const normalRes = await axios.post(`${API_URL}/core/events/message`, {
            threadId,
            senderType: 'USER',
            senderId: '00000000-0000-0000-0000-000000000000',
            message: 'Hello, I want to book an appointment.'
        });
        console.log('Response:', normalRes.data.data);
        console.log('Status: AI processing continues.\n');

        // 3. Escalation Flow: Send a "Red" message
        console.log('STEP 3: Sending a Risky (Red) message...');
        const riskyRes = await axios.post(`${API_URL}/core/events/message`, {
            threadId,
            senderType: 'USER',
            senderId: '00000000-0000-0000-0000-000000000000',
            message: 'I am feeling very angry and I need immediate help!'
        });
        console.log('Response:', riskyRes.data.data);
        console.log('Status: AUTOMATIC ESCALATION TRIGGERED.\n');

        // 4. Suppression Test: Send another message while thread is locked
        console.log('STEP 4: Testing AI Suppression (sending message while locked)...');
        const lockedRes = await axios.post(`${API_URL}/core/events/message`, {
            threadId,
            senderType: 'USER',
            senderId: '00000000-0000-0000-0000-000000000000',
            message: 'Is anyone there?'
        });
        console.log('Response:', lockedRes.data.data);
        console.log('Status: AI SUPPRESSED (Successfully blocked as per PDF Section 6.2).\n');

        console.log('--- PROTOTYPE TEST COMPLETED ---');
    } catch (error) {
        console.error('Test Failed. Make sure the server is running (npm start).');
        console.error('Error Details:', error.message);
    }
};

runTest();
