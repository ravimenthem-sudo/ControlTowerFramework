/**
 * Centralized Control Tower Core Functions (Domain-Agnostic)
 * As defined in Section 4 of the Framework PDF
 */

const ControlTower = {
    /**
     * 4.1 initializeThread(payload)
     * Logic: Insert new record into conversation_threads
     */
    async initializeThread(db, { userId, domain, channel }) {
        const query = `
            INSERT INTO conversation_threads (user_id, domain, channel, status, ownership, is_locked, version)
            VALUES ($1, $2, $3, 'green', 'AI', false, 1)
            RETURNING *;
        `;
        const result = await db.query(query, [userId, domain, channel]);
        return result.rows[0];
    },

    /**
     * 4.2 handleIncomingMessage(payload)
     * Logic: Store message, check lock, then evaluate sentiment
     */
    async handleIncomingMessage(db, { threadId, senderType, senderId, message }) {
        // 1. Fetch thread row
        const threadResult = await db.query('SELECT * FROM conversation_threads WHERE id = $1', [threadId]);
        const thread = threadResult.rows[0];

        // 2. Store message
        await db.query(`
            INSERT INTO conversation_messages (thread_id, sender_type, sender_id, message)
            VALUES ($1, $2, $3, $4)
        `, [threadId, senderType, senderId, message]);

        // 3. Locking logic
        if (thread.is_locked && thread.ownership === 'HUMAN') {
            console.log(`[Suppress AI] Thread ${threadId} is locked for HUMAN ownership.`);
            return { suppressed: true };
        }

        // 4. Evaluate sentiment
        return await this.evaluateThreadSentiment(db, threadId, message);
    },

    /**
     * 4.3 evaluateThreadSentiment(threadId, message)
     * Logic: Call intelligence layer, update status, and route if RED
     */
    async evaluateThreadSentiment(db, threadId, message) {
        // Simulate external LLM/Sentiment Intelligence call
        // In real implementation, this would call your AI service
        const sentimentResult = {
            label: 'green', // Default
            confidence: 0.95,
            rule: 'DEFAULT_RULE'
        };

        // Logic based on PDF section 4.3
        await db.query(`
            INSERT INTO sentiment_evaluations (thread_id, sentiment_label, confidence_score, triggered_rule)
            VALUES ($1, $2, $3, $4)
        `, [threadId, sentimentResult.label, sentimentResult.confidence, sentimentResult.rule]);

        await db.query('UPDATE conversation_threads SET status = $1 WHERE id = $2', [sentimentResult.label, threadId]);

        if (sentimentResult.label === 'red') {
            await this.routeToHuman(db, threadId, 'SUPERVISOR');
        }

        return sentimentResult;
    },

    /**
     * 4.4 routeToHuman(threadId, requiredRole)
     * Logic: Add to queue and switch ownership
     */
    async routeToHuman(db, threadId, requiredRole) {
        await db.query(`
            INSERT INTO routing_queue (thread_id, priority, required_role, status)
            VALUES ($1, 1, $2, 'waiting')
        `, [threadId, requiredRole]);

        await this.switchOwnership(db, threadId, 'HUMAN', 'SYSTEM');

        // PDF mentions triggering webhook here
        console.log(`[Webhook] Notifying domain app of escalation for thread ${threadId}`);
    },

    /**
     * 4.5 switchOwnership(threadId, ownershipType, actorId)
     * Logic: Update ownership, lock/unlock, increment version, and log audit
     */
    async switchOwnership(db, threadId, ownershipType, actorId) {
        const isLocked = ownershipType === 'HUMAN';

        const query = `
            UPDATE conversation_threads 
            SET ownership = $1, is_locked = $2, version = version + 1, updated_at = NOW()
            WHERE id = $3
            RETURNING *;
        `;
        const result = await db.query(query, [ownershipType, isLocked, threadId]);

        await this.logAuditEvent(db, {
            actorId,
            actorType: 'SYSTEM',
            action: `SWITCH_OWNERSHIP_TO_${ownershipType}`,
            threadId,
            metadata: { previousOwner: ownershipType === 'AI' ? 'HUMAN' : 'AI' }
        });

        return result.rows[0];
    },

    /**
     * 4.6 logAuditEvent(payload)
     * Logic: Immutable append to audit_logs
     */
    async logAuditEvent(db, { actorId, actorType, action, threadId, metadata }) {
        await db.query(`
            INSERT INTO audit_logs (actor_id, actor_type, action, thread_id, metadata)
            VALUES ($1, $2, $3, $4, $5)
        `, [actorId, actorType, action, threadId, JSON.stringify(metadata)]);
    }
};

module.exports = ControlTower;
