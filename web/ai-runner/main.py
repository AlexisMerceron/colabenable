from fastapi import FastAPI, HTTPException
import sqlite3
import json
from enum import Enum

class AppEnum(str, Enum):
    FORMS = "forms"
    FAKE_MAIL = "fake-mail"
    
app = FastAPI()
    
@app.get("/")
def read_root():
    return {"message": "Hello FastAPI depuis ton Mac 🎉"}

@app.post("/save-data")
def data_save(data: dict):
    
    required_fields = {"app", "seed", "data"}
    if not all(field in data for field in required_fields):
        raise HTTPException(status_code=400, detail="Champs requis manquants : app, seed, data")

    if data["app"] not in [AppEnum.FORMS.value, AppEnum.FAKE_MAIL.value]:
        raise HTTPException(status_code=400, detail="Valeur de l'application invalide. Doit être 'forms' ou 'fake-mail'")

    seed = data["seed"]
    if seed is not None:
        try:
            seed = int(seed)
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="La seed doit être un entier ou null")

    data_json = json.dumps(data["data"])
    
    try:
        conn = sqlite3.connect("collabenable.db")
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO data_entries (app, seed, data) VALUES (?, ?, ?)",
            (data["app"], seed, data_json)
        )
        conn.commit()
    except sqlite3.IntegrityError as e:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

    return {"message": "Données enregistrées avec succès"}
