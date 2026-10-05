import getpass

from argon2 import PasswordHasher
from sqlalchemy import select

from app.database import SessionLocal
from app.models.user import User


password_hasher = PasswordHasher()


def create_admin() -> None:
    print()
    print("================================")
    print("      AEGIS BOARD ADMIN")
    print("================================")
    print()

    name = input("Admin name: ").strip()
    email = input("Admin email: ").strip().lower()
    password = getpass.getpass("Admin password: ")
    confirm_password = getpass.getpass("Confirm password: ")

    if not name:
        print("Error: name cannot be empty.")
        return

    if not email:
        print("Error: email cannot be empty.")
        return

    if password != confirm_password:
        print("Error: passwords do not match.")
        return

    if len(password) < 8:
        print("Error: password must be at least 8 characters.")
        return

    db = SessionLocal()

    try:
        existing_user = db.scalar(
            select(User).where(User.email == email)
        )

        if existing_user:
            print()
            print("Error: an account with this email already exists.")
            return

        password_hash = password_hasher.hash(password)

        admin = User(
            name=name,
            email=email,
            password_hash=password_hash,
            role="admin",
            is_active=True,
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print()
        print("================================")
        print("      ADMIN CREATED")
        print("================================")
        print()
        print(f"Name : {admin.name}")
        print(f"Email: {admin.email}")
        print(f"Role : {admin.role}")
        print(f"ID   : {admin.id}")
        print()
        print("Password stored securely as an Argon2 hash.")
        print()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()