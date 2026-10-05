from sqlalchemy import text

from app.database import engine


with engine.connect() as connection:
    result = connection.execute(text("SELECT current_database()"))
    database_name = result.scalar()

    print(f"Connected to PostgreSQL database: {database_name}")