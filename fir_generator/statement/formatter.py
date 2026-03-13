# formatter.py
def format_input(data):
    return {
        "name": data.get("name", "अज्ञात"),
        "age": data.get("age", "अज्ञात"),
        "address": data.get("address", "अज्ञात"),
        "date": data.get("date", "अज्ञात"),
        "time": data.get("time", "अज्ञात"),
        "location": data.get("location", "अज्ञात"),
        "description": data.get("description", ""),
        "suspect": data.get("suspect", ""),
        "witness": data.get("witness", ""),
        "evidence": data.get("evidence", "")
    }