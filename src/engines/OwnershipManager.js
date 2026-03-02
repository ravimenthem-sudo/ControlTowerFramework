const supabase = require('../utils/supabase');
const AuditLogger = require('./AuditLogger');

/**
 * Section 4.5: Ownership Transitions & Thread Locking using Supabase
 */
const OwnershipManager = {
    /**
     * Section 4.5.2: Switch to HUMAN
     */
    async switchToHuman(threadId, actorId) {
        console.log(`[OwnershipManager] Switching Thread ${threadId} to HUMAN ownership`);

        // Optimistic Concurrency Control (Section 6.3/8.3)
        // We fetch the current version first
        const { data: thread, error: fetchError } = await supabase
            .from('conversation_threads')
            .select('version')
            .eq('id', threadId)
            .single();

        if (fetchError) throw fetchError;

        const { error: updateError } = await supabase
            .from('conversation_threads')
            .update({
                ownership: 'HUMAN',
                is_locked: true,
                version: thread.version + 1,
                updated_at: new Date().toISOString()
            })
            .eq('id', threadId)
            .eq('version', thread.version); // Concurrency check

        if (updateError) throw updateError;

        await AuditLogger.log({
            actorId,
            actorType: 'SYSTEM',
            action: 'SWITCH_OWNERSHIP_TO_HUMAN',
            threadId,
            metadata: { lockStatus: 'LOCKED', version: thread.version + 1 }
        });

        return { ownership: 'HUMAN', is_locked: true };
    },

    /**
     * Section 4.5.3: Switch to AI
     */
    async switchToAI(threadId, actorId) {
        console.log(`[OwnershipManager] Switching Thread ${threadId} back to AI ownership`);

        const { data: thread, error: fetchError } = await supabase
            .from('conversation_threads')
            .select('version')
            .eq('id', threadId)
            .single();

        if (fetchError) throw fetchError;

        const { error: updateError } = await supabase
            .from('conversation_threads')
            .update({
                ownership: 'AI',
                is_locked: false,
                version: thread.version + 1,
                updated_at: new Date().toISOString()
            })
            .eq('id', threadId)
            .eq('version', thread.version);

        if (updateError) throw updateError;

        await AuditLogger.log({
            actorId,
            actorType: 'HUMAN',
            action: 'SWITCH_OWNERSHIP_TO_AI',
            threadId,
            metadata: { lockStatus: 'UNLOCKED', version: thread.version + 1 }
        });

        return { ownership: 'AI', is_locked: false };
    }
};

module.exports = OwnershipManager;
