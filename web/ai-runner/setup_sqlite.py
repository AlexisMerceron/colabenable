
import sqlite3
from datetime import datetime

def init_db():
    conn = sqlite3.connect("collabenable.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS data_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app TEXT NOT NULL CHECK(app IN ('forms', 'fake-mail')),
            seed INTEGER,  -- Peut être un entier ou NULL
            data TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    
init_db()