# Base Framework - Control Tower Prototype

This project is a functional prototype of the **Centralized Control Tower Framework** as defined in the provided PDF. It orchestrates AI-driven conversations across Healthcare, Academy, and Job platforms.

## 🚀 How to Run the Prototype

### 1. Prerequisites
- **Node.js**: Installed on your system.
- **Supabase**: An active project with the `schema.sql` applied.

### 2. Setup
1. Clone/Copy this folder.
2. Open terminal in this directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure [`.env`](file:///C:/Users/DELL/.gemini/antigravity/scratch/Base%20Framework%20-%20Control%20Tower/.env):
   - Update `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### 3. Run the Framework
Start the Core API Gateway:
```bash
npm start
```

### 4. Run the Demonstration Scripts
In a **separate** terminal window:

**To see the End-to-End flow logic (PDF Section 5):**
```bash
node test_flow.js
```
*This simulates thread initialization, a normal conversation, a red-sentiment escalation, and AI suppression.*

**To see a Domain Mockup (Janmasethu Healthcare - PDF Section 7):**
```bash
node demo/janmasethu_mock.js
```

## 🏗️ Architecture
- `src/api/`: REST endpoints for domain integrations.
- `src/engines/`: Modular orchestration logic (Thread, Sentiment, Routing, etc.).
- `src/utils/`: Database and client configurations.

## 🔒 Safety Features
- **Deterministic Locking**: Human takeover locks the thread.
- **AI Suppression**: AI generation is aborted if the thread is locked.
- **Audit Logs**: Immutable history of all actions.
