const supabase = require('../utils/supabase');

/**
 * Section 3.5 & 4.6: Immutable Audit Logging via Supabase
 */
const AuditLogger = {
    async log({ actorId, actorType, action, threadId, metadata }) {
        const timestamp = new Date().toISOString();

        console.log(`[AuditLogger] [${timestamp}] Recording: ${action}`);

        // Section 4.6.1: Immutable append (No updates allowed)
        const { data, error } = await supabase
            .from('audit_logs')
            .insert([
                {
                    actor_id: actorId,
                    actor_type: actorType,
                    action,
                    thread_id: threadId,
                    metadata: metadata || {}
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('[AuditLogger Error]', error);
            // In production, you might want to retry this or alert
            throw error;
        }

        return data;
    }
};

module.exports = AuditLogger;
