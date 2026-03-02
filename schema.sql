-- ==========================================
-- Centralized Control Tower Core Schema
-- As defined in Section 3 of the Framework PDF
-- ==========================================

-- 3.1 conversation_threads
CREATE TABLE conversation_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT CHECK (domain IN ('healthcare', 'academy', 'jobs')), -- ENUM: healthcare, academy, jobs
    user_id UUID NOT NULL,
    channel TEXT CHECK (channel IN ('web', 'app', 'whatsapp')), -- ENUM: web, app, whatsapp, etc.
    status TEXT CHECK (status IN ('green', 'yellow', 'red')) DEFAULT 'green',
    ownership TEXT CHECK (ownership IN ('AI', 'HUMAN')) DEFAULT 'AI',
    assigned_role VARCHAR(255),
    assigned_user_id UUID,
    is_locked BOOLEAN DEFAULT FALSE,
    version INTEGER NOT NULL DEFAULT 1, -- For optimistic concurrency
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.2 conversation_messages
CREATE TABLE conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES conversation_threads(id) ON DELETE CASCADE,
    sender_type TEXT CHECK (sender_type IN ('USER', 'AI', 'HUMAN')),
    sender_id UUID NOT NULL,
    message TEXT NOT NULL,
    sentiment_score FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.3 sentiment_evaluations
CREATE TABLE sentiment_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES conversation_threads(id) ON DELETE CASCADE,
    sentiment_label TEXT CHECK (sentiment_label IN ('green', 'yellow', 'red')),
    confidence_score FLOAT,
    triggered_rule VARCHAR(255),
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.4 routing_queue
CREATE TABLE routing_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES conversation_threads(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,
    required_role VARCHAR(255),
    status TEXT CHECK (status IN ('waiting', 'assigned', 'completed')) DEFAULT 'waiting',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3.5 audit_logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL,
    actor_type TEXT CHECK (actor_type IN ('HUMAN', 'AI', 'SYSTEM')),
    action VARCHAR(255) NOT NULL,
    thread_id UUID REFERENCES conversation_threads(id) ON DELETE SET NULL,
    metadata JSONB, -- Stored as JSONB for better performance
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: No updates allowed on audit_logs table (system enforced)
