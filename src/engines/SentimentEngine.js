const supabase = require('../utils/supabase');
const RoutingEngine = require('./RoutingEngine');

/**
 * Section 10.2: Intelligence Layer Interface
 */
const SentimentEngine = {
    async evaluate(threadId, message) {
        console.log(`[SentimentEngine] Analyzing message for thread ${threadId}`);

        // Mock intelligence logic (PDF Section 10.2/10.3)
        let label = 'green';
        if (message.toLowerCase().includes('help') || message.toLowerCase().includes('angry')) {
            label = 'red';
        }

        // 1. Store Evaluation (Section 3.3/4.3.2)
        const { error: evalError } = await supabase
            .from('sentiment_evaluations')
            .insert([
                {
                    thread_id: threadId,
                    sentiment_label: label,
                    confidence_score: 0.95,
                    triggered_rule: 'KEYWORD_DETECTION'
                }
            ]);

        if (evalError) throw evalError;

        // 2. Update thread status (Section 4.3.3)
        const { error: threadError } = await supabase
            .from('conversation_threads')
            .update({ status: label })
            .eq('id', threadId);

        if (threadError) throw threadError;

        if (label === 'red') {
            // Mandatory Automatic Escalation (Section 11.3)
            await RoutingEngine.routeToHuman(threadId, 'DOMAIN_SUPERVISOR');
        }

        return { label };
    }
};

module.exports = SentimentEngine;
