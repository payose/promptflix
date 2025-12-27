# FindsMovies
> **AI-powered movie discovery using natural language search**

🔗 **Live Platform:** [findsmovies.com](https://promptflix-frontend.onrender.com/)

## 🎯 What It Does

FindsMovies helps you find the perfect movie by simply describing what you want to watch. Instead of browsing endless catalogs or filtering through genres, just tell us your mood and let AI find your next watch.

**Example queries:**
- "I want a mind-bending thriller that makes me question reality"
- "Something uplifting and funny for a Friday night"
- "A heartwarming romance set in Paris"

## 👥 Who It's For

- **Movie enthusiasts** tired of endless scrolling through streaming platforms
- **Anyone** who knows what mood they're in but not what to watch
- **Casual viewers** who want quick, personalised recommendations without the hassle

## 🚀 The Problem It Solves

Traditional movie platforms make you browse through thousands of titles or rely on rigid genre filters. FindsMovies solves this by understanding natural language descriptions of what you want to watch, saving you time and decision fatigue. Describe your mood, preferences, or the type of experience you're looking for, and get instant, AI-curated recommendations.

## 🛠️ Tech Stack

**Frontend:** React + TypeScript, Redux, Tailwind CSS, Vite
**Backend:** Python, FastAPI, AI/ML for NLP
**Deployment:** Docker, Docker Compose

---

## How It Works

1. **Describe Your Mood** - Tell us what kind of movie you're in the mood for
   - "I want a mind-bending thriller that makes me question reality"
   - "Something uplifting and funny for a Friday night"
   - "A heartwarming romance set in Paris"

2. **AI-Powered Search** - Our intelligent system processes your request and understands your preferences

3. **Get Personalised Recommendations** - Receive curated movie suggestions that match your description, complete with ratings, posters, and details

4. **Discover & Watch** - Browse your results and find your next favourite movie

## Features

- **Natural Language Search** - Search for movies the way you naturally think and speak
- **AI-Powered Recommendations** - Intelligent matching based on mood, genre, themes, and more
- **Beautiful UI** - Modern, responsive interface with smooth animations
- **Instant Results** - Get movie suggestions in seconds
- **High-Quality Recommendations** - Curated results from highly-rated movies
- **SEO Optimized** - Easily discoverable movie recommendations

## Getting Started

### Prerequisites
- Docker and Docker Compose installed on your machine
- Node.js 18+ (for local development without Docker)
- Python 3.9+ (for local development without Docker)

### Running with Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd PromptFlix
```

2. Set up environment variables:
```bash
# Create a .env file in the backend directory
cp backend/.env.example backend/.env
# Add your API keys and configuration
```

3. Start the application:
```bash
docker-compose up --build
```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Running Locally (Development)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r app/requirements.txt
cd app
uvicorn main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
PromptFlix/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application entry point
│   │   ├── config.py        # Configuration settings
│   │   ├── models/          # Data models
│   │   ├── routers/         # API routes
│   │   └── services/        # Business logic
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── redux/           # State management
│   │   └── App.tsx
│   └── Dockerfile
└── docker-compose.yml
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Live Platform

Visit [FindsMovies](https://promptflix-frontend.onrender.com/) to experience AI-powered movie discovery today!

---

<div align="center">
  Made with ❤️ for movie lovers everywhere
</div>
