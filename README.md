# University Administrative Chatbot MVP

A web-based chatbot system that provides formal, accurate, and authoritative administrative information to university students using RAG (Retrieval-Augmented Generation) with Google Gemini API.

## Features

- **Intelligent Chat Interface** - Natural language processing for administrative queries
- **Semantic Search** - Vector-based FAQ matching using pgvector
- **RAG Pipeline** - Gemini AI generates contextual responses from retrieved FAQs
- **Fallback Handling** - Graceful handling of unknown queries with office guidance
- **Admin Dashboard** - Manage FAQs, view logs, review feedback, and approve submissions
- **Accessibility** - Keyboard navigation, screen reader support, high contrast mode

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18, Vite |
| Backend | Flask, Python 3.11 |
| Database | PostgreSQL 16 + pgvector |
| AI | Google Gemini API |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| Container | Docker, Docker Compose |

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### 1. Clone and Configure

```bash
# Navigate to project directory
cd "chatbot v3"

# Copy environment template
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your-api-key-here
```

### 2. Start with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Seed the database with mock FAQ data
docker-compose exec backend python seed_data.py
```

### 3. Access the Applications

| Application | URL |
|-------------|-----|
| Chat Interface | http://localhost:3000 |
| Admin Dashboard | http://localhost:3001 |
| Backend API | http://localhost:5000 |

**Admin Login Credentials:**
- Username: `admin`
- Password: `admin123`

## Local Development

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL with pgvector (or use Docker)
docker run -d --name pgvector -e POSTGRES_PASSWORD=postgres -p 5432:5432 pgvector/pgvector:pg16

# Run the server
python run.py

# Seed mock data
python seed_data.py
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Admin Dashboard

```bash
cd admin

# Install dependencies
npm install

# Start dev server
npm run dev
```

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send a chat message |
| POST | `/api/feedback` | Submit feedback |
| POST | `/api/faq-submission` | Submit a question for review |
| GET | `/api/faq-categories` | Get FAQ categories |
| GET | `/api/health` | Health check |

### Admin Endpoints (Require Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/chat-logs` | Get chat logs |
| GET | `/api/admin/feedback` | Get all feedback |
| GET | `/api/admin/submissions` | Get pending submissions |
| POST | `/api/admin/submissions/:id/approve` | Approve submission |
| POST | `/api/admin/submissions/:id/reject` | Reject submission |
| GET | `/api/admin/faq` | List FAQ entries |
| POST | `/api/admin/faq` | Create FAQ entry |
| PUT | `/api/admin/faq/:id` | Update FAQ entry |
| DELETE | `/api/admin/faq/:id` | Delete FAQ entry |
| POST | `/api/admin/trigger-update` | Refresh embeddings |

### Chat Request/Response

```json
// Request
POST /api/chat
{
  "message": "What are the registration deadlines?"
}

// Response
{
  "response": "Registration for the first semester...",
  "confidence": 0.85,
  "fallback": false,
  "chat_id": "uuid-here"
}
```

## Project Structure

```
chatbot v3/
├── backend/
│   ├── app/
│   │   ├── __init__.py         # Flask app factory
│   │   ├── config.py           # Configuration
│   │   ├── models.py           # Database models
│   │   ├── routes/             # API endpoints
│   │   │   ├── chat.py         # Chat endpoint
│   │   │   ├── feedback.py     # Feedback endpoint
│   │   │   ├── faq.py          # FAQ submission
│   │   │   └── admin.py        # Admin endpoints
│   │   └── services/           # Business logic
│   │       ├── content_filter.py
│   │       ├── embedding_service.py
│   │       ├── gemini_service.py
│   │       ├── nlp_service.py
│   │       └── search_service.py
│   ├── seed_data.py            # Mock FAQ data
│   └── run.py                  # Entry point
├── frontend/                   # React chat interface
├── admin/                      # React admin dashboard
├── database/
│   └── init.sql               # PostgreSQL schema
├── docker-compose.yml
├── .env.example
└── README.md
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `DATABASE_URL` | PostgreSQL connection string | Auto-set in Docker |
| `SECRET_KEY` | Flask secret key | dev-secret |
| `FLASK_ENV` | Environment mode | development |
| `CONFIDENCE_THRESHOLD` | Minimum match confidence | 0.60 |

## Scope & Limitations

### Provides Information On:
- Registration procedures
- Academic calendar and deadlines
- Examination rules and schedules
- Fees and payment procedures
- Administrative offices
- University staff directory

### Does NOT Provide:
- Academic tutoring
- Legal advice
- Counselling
- Personal data storage
- Cross-session memory

## Security

- Rate limiting (30 requests/minute)
- Input sanitization and validation
- Content filtering for inappropriate queries
- JWT-based admin authentication
- Environment-based secrets
- 30-day log retention

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is for educational purposes as part of university coursework.

---

**Chapter Three Alignment:**
- Materials: Software tools and APIs
- Methods: NLP, semantic search, RAG
- Procedure: Query processing pipeline
- Reproducibility: Fully documented
