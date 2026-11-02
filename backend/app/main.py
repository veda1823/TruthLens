from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI application
app = FastAPI(
    title="TruthLens API",
    description="AI-Powered Fake News Detection System",
    version="1.0.0"
)

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Home API
@app.get("/")
def home():
    return {
        "message": "Welcome to TruthLens API",
        "status": "Backend is running successfully"
    }


# Health check API
@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }