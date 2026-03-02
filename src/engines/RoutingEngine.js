const supabase = require('../utils/supabase');
const OwnershipManager = require('./OwnershipManager');

/**
 * Section 4.4: Routing Logic using Supabase
 */
const RoutingEngine = {
    async routeToHuman(threadId, requiredRole) {
        console.log(`[RoutingEngine] Escalating Thread ${threadId} to role: ${requiredRole}`);

        // 1. Insert into routing_queue (Section 3.4/4.4.1)
        const { error: queueError } = await supabase
            .from('routing_queue')
            .insert([
                {
                    thread_id: threadId,
                    priority: 1,
                    required_role: requiredRole,
                    status: 'waiting'
                }
            ]);

        if (queueError) throw queueError;

        // 2. Mandatory Switch Ownership (Section 4.4.2)
        // Use a valid System UUID to satisfy audit_logs constraints
        const SYSTEM_UUID = '00000000-0000-0000-0000-000000000000';
        await OwnershipManager.switchToHuman(threadId, SYSTEM_UUID);

        // 3. Trigger Webhook (Mock Logic as per PDF requirement)
        console.log(`[RoutingEngine] Webhook triggered to Domain Application`);
    }
};

module.exports = RoutingEngine;
