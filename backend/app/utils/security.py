from datetime import UTC, datetime, timedelta

import jwt
from pwdlib import PasswordHash

from app.config import get_settings

password_hash = PasswordHash.recommended()
ALGORITHM = "HS256"

ROLE_TO_LABEL = {
    "administrator": "Administrator",
    "principal_investigator": "Principal Investigator",
    "study_coordinator": "Study Coordinator",
}

LABEL_TO_ROLE = {label: key for key, label in ROLE_TO_LABEL.items()}


def hash_password(plain: str) -> str:
    return password_hash.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return password_hash.verify(plain, hashed)


def create_access_token(subject: str, role: str) -> str:
    settings = get_settings()
    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    settings = get_settings()
    return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])


def initials_for(name: str) -> str:
    parts = [p for p in name.replace("Dr.", "").split() if p]
    if not parts:
        return "NA"
    if len(parts) == 1:
        return parts[0][:2].upper()
    return f"{parts[0][0]}{parts[-1][0]}".upper()


def format_dt(value: datetime | None) -> str | None:
    if value is None:
        return None
    return value.strftime("%d %b %Y, %H:%M")


def format_date(value) -> str | None:
    if value is None:
        return None
    return value.isoformat()
