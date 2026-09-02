from fastapi import FastAPI, UploadFile, File, HTTPException
from face_analyzer import detect_face_shape

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="InsightOpticals AI Microservice")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the InsightOpticals AI API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/ai/face-shape")
async def analyze_face_shape(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File uploaded is not a valid image.")
        
    try:
        contents = await file.read()
        result = detect_face_shape(contents)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error during facial analysis: {str(e)}")

