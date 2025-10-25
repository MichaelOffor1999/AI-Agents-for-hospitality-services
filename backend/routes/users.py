from fastapi import APIRouter, HTTPException, Depends, status, Body
from models.user import User
from models.auth import LoginRequest
from utils.db import db
from typing import Optional
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "your_secret_key_here"  # Change to a secure value in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 720  

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        print(user_id)
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception     
    return user
# Example protected route
@router.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"user_id": str(current_user["_id"]), "email": current_user["email"]}

@router.post("/signup")
async def signup(user: User):
    print("[DEBUG] Incoming signup data:", user)
    # Check if user already exists
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    # Hash password
    user.password_hash = pwd_context.hash(user.password_hash)
    user.created_at = datetime.utcnow().isoformat()
    result = await db.users.insert_one(user.dict(exclude={"id"}, by_alias=True))
    user.id = str(result.inserted_id)
    # Create JWT token
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    return {"token": access_token, "tenant": user.dict(by_alias=True, exclude={"password_hash"})}

@router.post("/login")
async def login(data: LoginRequest):
    user = await db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    pwd_valid = pwd_context.verify(data.password, user["password_hash"])
    if not pwd_valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Create JWT token
    access_token = create_access_token(data={"sub": str(user["_id"]), "email": user["email"]})
    return {"access_token": access_token, "token_type": "bearer", "user_id": str(user["_id"])}
