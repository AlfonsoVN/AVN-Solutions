# utils.py

from sqlalchemy import create_engine

def probar_conexion(db_url):
    try:
        engine = create_engine(db_url)
        with engine.connect() as connection:
            connection.execute("SELECT 1")
        return True
    except Exception as e:
        print(f"Error de conexión: {e}")
        return False
