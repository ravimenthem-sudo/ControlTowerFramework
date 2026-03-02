const supabase = require('../utils/supabase');
const SentimentEngine = require('./SentimentEngine');

/**
 * Section 4.1 & 4.2: Thread Lifecycle Management using Supabase
 */
const ThreadManager = {
    /**
     * 4.1 initializeThread(payload)
     */
    async initializeThread({ userId, domain, channel }) {
        console.log(`[ThreadManager] Initializing thread for User ${userId} in domain ${domain}`);

        const { data, error } = await supabase
            .from('conversation_threads')
            .insert([
                {
                    user_id: userId,
                    domain,
                    channel,
                    status: 'green',
                    ownership: 'AI',
                    is_locked: false,
                    version: 1
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * 4.2 handleIncomingMessage(payload)
     */
    async handleIncomingMessage({ threadId, senderType, senderId, message }) {
        // 1. Fetch thread row (Section 4.2.1)
        const { data: thread, error: threadError } = await supabase
            .from('conversation_threads')
            .select('*')
            .eq('id', threadId)
            .single();

        if (threadError) throw threadError;

        // 2. AI Suppression Check (Section 6.2)
        if (thread.is_locked && thread.ownership === 'HUMAN') {
            console.log(`[ThreadManager] AI SUPPRESSED for thread ${threadId} (Human in control)`);
            return { suppressed: true, reason: 'HUMAN_OWNERSHIP' };
        }

        // 3. Store Message (Section 4.2.2)
        const { error: msgError } = await supabase
            .from('conversation_messages')
            .insert([
                {
                    thread_id: threadId,
                    sender_type: senderType,
                    sender_id: senderId,
                    message
                }
            ]);

        if (msgError) throw msgError;

        // 4. Evaluate Sentiment (Section 4.3)
        const sentimentResult = await SentimentEngine.evaluate(threadId, message);

        return {
            threadId,
            sentiment: sentimentResult.label,
            action: sentimentResult.label === 'red' ? 'ESCALATED' : 'PROCESSED'
        };
    }
};

module.exports = ThreadManager;
