from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
from suggester import IPCSuggester
import uvicorn
import os

# Initialize the Suggester
suggester = IPCSuggester()

app = FastAPI(
    title="JusticeRoute",
    description="AI-Powered Indian Penal Code (IPC) Application for Law Enforcement.",
    version="1.1.0"
)

class SuggestionRequest(BaseModel):
    incident_text: str

class SuggestionResponse(BaseModel):
    section: str
    title: str
    description: str
    nature: str
    bailable: str
    punishment: str
    reason_for_application: str

@app.get("/")
async def root():
    return FileResponse("index.html")

@app.post("/suggest-ipc", response_model=List[SuggestionResponse])
async def suggest_ipc(request: SuggestionRequest):
    """
    Suggests the top 3 IPC sections based on the incident description and severity.
    """
    try:
        # Validate inputs
        if not request.incident_text.strip():
            raise HTTPException(status_code=400, detail="Incident description cannot be empty.")

        # Get suggestions
        suggestions = suggester.suggest(
            incident_text=request.incident_text
        )
        
        if not suggestions:
            # This could happen if the suggester logic returns an empty list
            return []

        return suggestions

    except Exception as e:
        # Generic error handling
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
