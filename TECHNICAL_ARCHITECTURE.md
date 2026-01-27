# Technical Architecture & NLP Documentation

## 1. AI & NLP Pipeline (RAG Architecture)

The University Chatbot uses a **Retrieval-Augmented Generation (RAG)** architecture. This combines the accuracy of a curated knowledge base with the natural language capabilities of Google Gemini.

### The 3-Step Process:

1.  **Retrieval (Semantic Search)**
    *   **Embeddings**: When a question is added (via Admin), the system uses `sentence-transformers/all-MiniLM-L6-v2` to convert the text into a 384-dimensional vector (a list of numbers representing meaning).
    *   **Search**: When a user asks a question, their query is also converted to a vector.
    *   **Matching**: The system uses **Cosine Similarity** to mathematically find the FAQ entries that "mean" the same thing as the user's query, even if the wording is different.

2.  **Augmentation (Context Construction)**
    *   The top 3 matching FAQs are retrieved from the database.
    *   They are formatted into a structured "System Context" block.
    *   *Example Context*:
        ```text
        CONTEXT:
        Entry 1: Question: "When is the deadline?" Answer: "August 31st."
        Entry 2: Question: "Late registration?" Answer: "Sept 1st - 15th."
        ```

3.  **Generation (Gemini API)**
    *   The user's query + the System Context are sent to the **Gemini 1.5 Flash** model.
    *   **Prompt Rules**: The model is strictly instructed (via "System Prompt") to:
        *   Act as a formal university administrator.
        *   Answer *only* using the provided context.
        *   Never hallucinate or invent dates/policies.

---

## 2. Database Architecture

The system currently runs on **SQLite** for local development flexibility but is designed for **PostgreSQL** in production.

### Data Models (`models.py`)

*   **FAQEntry**: The core knowledge base.
    *   `question` / `answer`: The text content.
    *   `embedding`: The vector representation (stored as JSON string in SQLite, `vector` type in Postgres).
    *   `category` / `faculty`: Metadata for filtering.
*   **ChatLog**: A record of every conversation.
    *   Used for analytics (most asked questions).
    *   Stores `confidence` scores to track AI performance.
*   **SubmittedQuestion**: Questions submitted by users when the bot fails.
    *   Status: `pending` -> `approved` -> `rejected`.
*   **Feedback**: User thumbs up/down ratings linked to ChatLogs.
*   **AdminUser**: Credentials for the dashboard.

---

## 3. Data Sharing: Admin vs. User Portals

The **Backend API** acts as the central bridge between the two frontends. Both portals access the *same* database but interact with it differently.

### User Portal (Port 3000)
*   **Read-Only access (mostly)**: Can only search/read FAQs via the Chat Interface.
*   **Write access**:
    *   Can write `ChatLogs` (automatically happens when chatting).
    *   Can write `Feedback` (thumbs up/down).
    *   Can write `SubmittedQuestion` (when seeking help).

### Admin Portal (Port 3001)
*   **Full Access**: Authenticated via JWT (JSON Web Token).
*   **Management Flows**:
    *   **Approving Submissions**: When an admin "Approves" a `SubmittedQuestion`, the backend:
        1.  Copies the text to a new `FAQEntry`.
        2.  Generates the AI embedding immediately.
        3.  Deletes/Archives the submission.
    *   **Updating FAQs**: Editing an answer immediately updates what the User Portal "knows". Editing a question automatically regenerates the embedding so search remains accurate.
