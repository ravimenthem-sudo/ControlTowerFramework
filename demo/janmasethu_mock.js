/**
 * Mock Domain Integration: Janmasethu (Healthcare)
 * Demonstrates how a domain application interacts with the Control Tower Core.
 */

const axios = require('axios');

const CONTROL_TOWER_URL = 'http://localhost:3000';

class JanmasethuApp {
    constructor() {
        this.activeThread = null;
    }

    async startConversation(userId = '00000000-0000-0000-0000-000000000001') {
        console.log(`[Janmasethu] Starting medical consultation for User: ${userId}`);
        const response = await axios.post(`${CONTROL_TOWER_URL}/core/threads/initialize`, {
            userId,
            domain: 'healthcare',
            channel: 'app'
        });
        this.activeThread = response.data.data.id;
        console.log(`[Janmasethu] Control Tower Thread ID: ${this.activeThread}`);
    }

    async sendMessage(userId, text) {
        console.log(`[Janmasethu] User ${userId} says: "${text}"`);
        const response = await axios.post(`${CONTROL_TOWER_URL}/core/events/message`, {
            threadId: this.activeThread,
            senderType: 'USER',
            senderId: userId,
            message: text
        });

        const status = response.data.data;
        if (status.action === 'ESCALATED') {
            console.log(`[Janmasethu] ALERT: Escalating to Clinician dashboard!`);
        } else if (status.suppressed) {
            console.log(`[Janmasethu] INFO: Human agent is typing... AI responding suppressed.`);
        } else {
            console.log(`[Janmasethu] AI Response: "Mock AI response here..."`);
        }
    }
}

// Demo Execution
const demo = async () => {
    const app = new JanmasethuApp();

    // Simulate flow
    const patientId = '00000000-0000-0000-0000-000000000001';
    await app.startConversation(patientId);
    setTimeout(() => app.sendMessage(patientId, 'I have a fever'), 1000);
    setTimeout(() => app.sendMessage(patientId, 'HELP ME I AM ANGRY'), 3000);
};

console.log('--- Janmasethu (Healthcare) Domain Mockup Started ---');
demo().catch(err => console.error('Is Control Tower running? Error:', err.message));
