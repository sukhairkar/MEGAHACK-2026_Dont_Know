from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from generator import generate_statement

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.post("/generate-statement")
def generate(data: dict):
    lang = data.get("language", "en")
    statement = generate_statement(data, lang)
    return {"statement": statement}