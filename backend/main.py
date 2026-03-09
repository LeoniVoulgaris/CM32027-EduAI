from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="EduAI Backend API")

# Configure CORS so the React frontend can communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # This is the default Vite port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Backend is running"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "EduAI FastAPI"}