require('dotenv').config();
const express = require('express');
const ThreadManager = require('../engines/ThreadManager');
const AuditLogger = require('../engines/AuditLogger');

const app = express();
app.use(express.json());

/**
 * 5.1/5.2 Normalized and Escalation Flow Entry Point
 * POST /core/events/message
 */
app.post('/core/events/message', async (req, res) => {
    const { threadId, senderType, senderId, message } = req.body;

    try {
        console.log(`[API] Received message for thread ${threadId}: "${message.substring(0, 20)}..."`);

        // Orchestrate the flow
        const result = await ThreadManager.handleIncomingMessage({
            threadId,
            senderType,
            senderId,
            message
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('[API Error]', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Thread Initialization
 */
app.post('/core/threads/initialize', async (req, res) => {
    try {
        const thread = await ThreadManager.initializeThread(req.body);
        res.status(201).json({ success: true, data: thread });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
function start() {
    app.listen(PORT, () => {
        console.log(`[Control Tower] Core API Gateway running on port ${PORT}`);
    });
}

module.exports = { app, start };
