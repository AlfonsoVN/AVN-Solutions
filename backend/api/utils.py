# utils.py

from sqlalchemy import create_engine

def obtener_conexion(connection):
    if connection.db_type =="mysql" or connection.db_type=="postgresql":
        db_url = f"{connection.db_type}://{connection.user}:{connection.password}@{connection.host}:{connection.port}/{connection.dbname}"
    if connection.db_type=="sqlite":
        db_url=f"{connection.db_type}:///{connection.dbname}"
        
    if connection.db_type !="mysql" and connection.db_type!="postgresql" and connection.db_type!="sqlite":
        db_url = f"{connection.db_type}://{connection.user}:{connection.password}@{connection.host}:{connection.port}/{connection.dbname}"
    print(db_url)
    return db_url
