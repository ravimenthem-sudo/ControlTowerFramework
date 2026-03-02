# Comprehensive Documentation: Centralized Control Tower Framework

This document details the architectural design and implementation process used to build the **Centralized Control Tower Prototype** from the provided framework specifications.

---

## 1. Architectural Overview
The framework is built as a modular Node.js application designed to orchestrate AI-driven conversations across multiple domains while maintaining human-in-the-loop safety.

### Core Components
*   **API Gateway (`src/api/server.js`)**: The entry point for all domain events. It normalizes incoming messages and orchestrates the flow through the engines.
*   **Thread Manager (`src/engines/ThreadManager.js`)**: Manages the lifecycle of conversation threads and enforces **AI Suppression**.
*   **Sentiment Engine (`src/engines/SentimentEngine.js`)**: Interfaces with the intelligence layer to evaluate risk and trigger escalations.
*   **Ownership Manager (`src/engines/OwnershipManager.js`)**: Handles transitions between AI and HUMAN ownership with **Optimistic Concurrency Control**.
*   **Routing Engine (`src/engines/RoutingEngine.js`)**: Manages the human intervention queue.
*   **Audit Logger (`src/engines/AuditLogger.js`)**: Records an immutable history of all system actions.

---

## 2. Implementation Steps

### Phase 1: Database Foundation
We implemented the physical schema in Supabase using the following tables as defined in Section 3:
1.  `conversation_threads`: Tracks state, ownership, and locking.
2.  `conversation_messages`: Stores all incoming/outgoing messages.
3.  `sentiment_evaluations`: Logs all risk assessments.
4.  `routing_queue`: Manages threads waiting for human agents.
5.  `audit_logs`: Immutable security log.

### Phase 2: Logic & Orchestration
1.  **AI Suppression (Section 6.2)**: Implemented logic to check `is_locked` status. If true, the system aborts AI response generation.
2.  **Deterministic State Switching**: Transitions use a `version` column to prevent two separate processes from modifying a thread simultaneously (Optimistic Locking).
3.  **Automatic Escalation**: Any "Red" sentiment status automatically triggers a routing event and locks the thread for human takeover.

### Phase 3: Verification & Prototype
We created a functioning prototype to prove the concept:
*   **`test_flow.js`**: A script that simulates a full path from normal interaction to a risky one that triggers auto-escalation.
*   **`demo/janmasethu_mock.js`**: A mock healthcare integration showing how external domains call the Control Tower.

---

## 3. Security & Compliance
*   **Data Integrity**: All tables use strict `CHECK` constraints on status, domain, and ownership fields.
*   **Auditability**: Significant actions (like ownership switches) generate an immutable audit log entry.
*   **Human-in-the-Loop**: The system prioritizes human safety by locking threads and stopping AI whenever a human is assigned.

---

## 4. How to Reproduce
1.  Initialize a Supabase project and run `schema.sql`.
2.  Configure `.env` with Supabase project keys.
3.  Install dependencies: `npm install`.
4.  Launch core: `npm start`.
5.  Verify with: `node test_flow.js`.
