import os
import json
from datetime import datetime, timedelta, timezone
from collections import defaultdict
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Boolean,
    DateTime, Text, ForeignKey, Enum
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────
def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "y", "on"}


def _env_list(name: str, default: List[str]) -> List[str]:
    value = os.getenv(name, "")
    if not value.strip():
        return default
    return [item.strip() for item in value.split(",") if item.strip()]


SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production-super-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./eduai.db")
APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
CORS_ORIGINS = _env_list("CORS_ORIGINS", ["http://localhost:5173"])

if APP_ENV == "production" and SECRET_KEY.startswith("change-me"):
    raise RuntimeError("SECRET_KEY must be set to a secure value in production")

# ─────────────────────────────────────────────
# Database
# ─────────────────────────────────────────────
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ─────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student")  # "teacher" or "student"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    assignments = relationship("Assignment", back_populates="teacher", foreign_keys="Assignment.teacher_id")
    submissions = relationship("Submission", back_populates="student", foreign_keys="Submission.student_id")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"))
    student_count = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    at_risk_students = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    assignments = relationship("Assignment", back_populates="course")

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    status = Column(String, default="draft")  # draft, pending, published, synced
    due_date = Column(String)
    course_id = Column(Integer, ForeignKey("courses.id"))
    teacher_id = Column(Integer, ForeignKey("users.id"))
    student_count = Column(Integer, default=0)
    submissions_count = Column(Integer, default=0)
    ai_generated = Column(Boolean, default=False)
    lms_platform = Column(String, default="google")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    course = relationship("Course", back_populates="assignments")
    teacher = relationship("User", back_populates="assignments", foreign_keys=[teacher_id])
    questions = relationship("Question", back_populates="assignment")
    submissions = relationship("Submission", back_populates="assignment")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=True)
    review_item_id = Column(Integer, ForeignKey("review_items.id"), nullable=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, default="short-answer")  # multiple-choice, short-answer, free-response
    options = Column(Text, nullable=True)  # JSON array for MC options
    correct_answer = Column(Text, nullable=True)
    hint = Column(Text, nullable=True)
    difficulty = Column(String, default="medium")
    explanation = Column(Text, nullable=True)
    ai_generated = Column(Boolean, default=False)
    assignment = relationship("Assignment", back_populates="questions")

class ReviewItem(Base):
    __tablename__ = "review_items"
    id = Column(Integer, primary_key=True, index=True)
    content_type = Column(String, default="question")  # question, feedback, lesson, worksheet
    content = Column(Text, nullable=False)
    context = Column(String)
    status = Column(String, default="pending")  # pending, approved, rejected, edited
    risk_level = Column(String, default="low")  # low, medium, high
    risk_reasons = Column(Text, default="[]")  # JSON array
    original_content = Column(Text, nullable=True)
    teacher_edits = Column(Text, nullable=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Submission(Base):
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    answers = Column(Text, default="{}")  # JSON: {question_id: answer}
    score = Column(Float, nullable=True)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_late = Column(Boolean, default=False)
    feedback = Column(Text, nullable=True)
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions", foreign_keys=[student_id])

class StudentProgress(Base):
    __tablename__ = "student_progress"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    topic = Column(String)
    mastery = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(String)
    icon = Column(String)
    earned_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))

Base.metadata.create_all(bind=engine)

# ─────────────────────────────────────────────
# Auth helpers
# ─────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain, hashed):
    return pwd_context.verify(plain[:72], hashed)

def hash_password(password):
    return pwd_context.hash(password[:72])

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def require_teacher(current_user: User = Depends(get_current_user)):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Teacher access required")
    return current_user

# ─────────────────────────────────────────────
# Pydantic schemas
# ─────────────────────────────────────────────
class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    role: str = "student"

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str
    user_id: int

class AssignmentCreate(BaseModel):
    title: str
    due_date: Optional[str] = None
    course_id: Optional[int] = None
    status: Optional[str] = "published"
    ai_generated: bool = False
    lms_platform: str = "google"
    questions: Optional[List[Dict[str, Any]]] = None

class AssignmentUpdate(BaseModel):
    title: str = None
    status: str = None
    due_date: str = None

class ReviewItemUpdate(BaseModel):
    status: str
    teacher_edits: str = None

class GenerateRequest(BaseModel):
    topic: str
    difficulty: str = "mixed"
    num_questions: int = 5
    context: str = ""

class CourseCreate(BaseModel):
    name: str

class SubmissionCreate(BaseModel):
    assignment_id: int
    answers: dict

# ─────────────────────────────────────────────
# App
# ─────────────────────────────────────────────
app = FastAPI(title="EduAI Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Routes: Auth
# ─────────────────────────────────────────────
@app.post("/api/auth/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hash_password(user_data.password),
        role=user_data.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return Token(access_token=token, token_type="bearer", role=user.role, name=user.name, user_id=user.id)

@app.post("/api/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return Token(access_token=token, token_type="bearer", role=user.role, name=user.name, user_id=user.id)

@app.get("/api/users/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email, "name": current_user.name, "role": current_user.role}

# ─────────────────────────────────────────────
# Routes: Courses
# ─────────────────────────────────────────────
@app.get("/api/courses")
def get_courses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "teacher":
        courses = db.query(Course).filter(Course.teacher_id == current_user.id).all()
    else:
        courses = db.query(Course).all()
    return [{"id": c.id, "name": c.name, "totalStudents": c.student_count,
             "averageScore": c.average_score, "atRiskStudents": c.at_risk_students} for c in courses]

@app.post("/api/courses")
def create_course(data: CourseCreate, current_user: User = Depends(require_teacher), db: Session = Depends(get_db)):
    course = Course(name=data.name, teacher_id=current_user.id)
    db.add(course)
    db.commit()
    db.refresh(course)
    return {"id": course.id, "name": course.name}

# ─────────────────────────────────────────────
# Routes: Assignments
# ─────────────────────────────────────────────
@app.get("/api/assignments")
def get_assignments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "teacher":
        assignments = db.query(Assignment).filter(Assignment.teacher_id == current_user.id).all()
    else:
        assignments = db.query(Assignment).filter(Assignment.status.in_(["published", "synced"])).all()
    return [_serialize_assignment(a) for a in assignments]

@app.post("/api/assignments")
def create_assignment(data: AssignmentCreate, current_user: User = Depends(require_teacher), db: Session = Depends(get_db)):
    course: Optional[Course] = None
    if data.course_id is not None:
        course = db.query(Course).filter(Course.id == data.course_id, Course.teacher_id == current_user.id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
    else:
        course = db.query(Course).filter(Course.teacher_id == current_user.id).order_by(Course.id.asc()).first()
        if not course:
            course = Course(name="General", teacher_id=current_user.id, student_count=0)
            db.add(course)
            db.flush()

    due_date = data.due_date
    if not due_date:
        due_date = (datetime.now(timezone.utc) + timedelta(days=7)).strftime("%Y-%m-%d")

    status_value = data.status or "published"

    students_count = db.query(User).filter(User.role == "student").count()
    assignment = Assignment(
        title=data.title,
        due_date=due_date,
        status=status_value,
        course_id=course.id if course else None,
        teacher_id=current_user.id, ai_generated=data.ai_generated,
        lms_platform=data.lms_platform,
        student_count=students_count
    )
    db.add(assignment)
    db.flush()

    if data.questions:
        for raw in data.questions:
            question_text = str(raw.get("question") or raw.get("question_text") or "").strip()
            if not question_text:
                continue
            question_type = str(raw.get("type") or raw.get("question_type") or "short-answer").strip().lower()
            if question_type not in {"multiple-choice", "short-answer", "free-response"}:
                question_type = "short-answer"

            options_value = raw.get("options")
            options_json = None
            if isinstance(options_value, list):
                options_json = json.dumps([str(o) for o in options_value])
            elif isinstance(options_value, str) and options_value.strip():
                options_json = options_value

            db.add(
                Question(
                    assignment_id=assignment.id,
                    question_text=question_text,
                    question_type=question_type,
                    options=options_json,
                    correct_answer=str(raw.get("answer") or raw.get("correct_answer") or "").strip() or None,
                    hint=str(raw.get("hint") or "").strip() or None,
                    difficulty=str(raw.get("difficulty") or "medium").strip().lower(),
                    explanation=str(raw.get("explanation") or "").strip() or None,
                    ai_generated=data.ai_generated,
                )
            )

    db.commit()
    db.refresh(assignment)
    return _serialize_assignment(assignment)

@app.put("/api/assignments/{assignment_id}")
def update_assignment(assignment_id: int, data: AssignmentUpdate, current_user: User = Depends(require_teacher), db: Session = Depends(get_db)):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id, Assignment.teacher_id == current_user.id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if data.title is not None:
        assignment.title = data.title
    if data.status is not None:
        assignment.status = data.status
    if data.due_date is not None:
        assignment.due_date = data.due_date
    db.commit()
    db.refresh(assignment)
    return _serialize_assignment(assignment)

@app.delete("/api/assignments/{assignment_id}")
def delete_assignment(assignment_id: int, current_user: User = Depends(require_teacher), db: Session = Depends(get_db)):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id, Assignment.teacher_id == current_user.id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(assignment)
    db.commit()
    return {"ok": True}

def _serialize_assignment(a: Assignment):
    course_name = a.course.name if a.course else ""
    return {
        "id": str(a.id), "title": a.title, "status": a.status,
        "dueDate": a.due_date, "class": course_name,
        "students": a.student_count, "submissions": a.submissions_count,
        "aiGenerated": a.ai_generated, "lmsPlatform": a.lms_platform,
        "createdAt": a.created_at.isoformat() if a.created_at else None,
    }

# ─────────────────────────────────────────────
# Routes: Review Queue
# ─────────────────────────────────────────────
@app.get("/api/review")
def get_review_items(current_user: User = Depends(require_teacher), db: Session = Depends(get_db)):
    items = db.query(ReviewItem).order_by(ReviewItem.created_at.desc()).all()
    return [_serialize_review(i) for i in items]

@app.post("/api/review/{item_id}/approve")
def approve_review(item_id: int, teacher_edits: str = None, current_user: User = Depends(require_teacher), db: Session = Depends(get_db)):
    item = db.query(ReviewItem).filter(ReviewItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    item.status = "approved"
    if teacher_edits:
        item.original_content = item.content
        item.content = teacher_edits
        item.teacher_edits = teacher_edits
        item.status = "edited"
    db.commit()
    return {"ok": True}

@app.post("/api/review/{item_id}/reject")
def reject_review(item_id: int, current_user: User = Depends(require_teacher), db: Session = Depends(get_db)):
    item = db.query(ReviewItem).filter(ReviewItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    item.status = "rejected"
    db.commit()
    return {"ok": True}

def _serialize_review(i: ReviewItem):
    created = i.created_at
    now = datetime.now(timezone.utc)
    if created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    diff = (now - created).total_seconds()
    if diff < 3600:
        time_str = f"{int(diff / 60)} minutes ago"
    elif diff < 86400:
        time_str = f"{int(diff / 3600)} hours ago"
    else:
        time_str = f"{int(diff / 86400)} days ago"
    return {
        "id": str(i.id), "type": i.content_type, "content": i.content,
        "context": i.context, "createdAt": time_str, "status": i.status,
        "riskLevel": i.risk_level, "riskReasons": json.loads(i.risk_reasons or "[]"),
        "originalContent": i.original_content, "teacherEdits": i.teacher_edits,
    }


def _to_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _parse_due_date(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    text = value.strip()
    if not text:
        return None
    formats = [
        "%b %d, %Y",
        "%Y-%m-%d",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%S.%f",
    ]
    for fmt in formats:
        try:
            parsed = datetime.strptime(text, fmt)
            return parsed.replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    try:
        parsed = datetime.fromisoformat(text)
        return _to_utc(parsed)
    except ValueError:
        return None


def _risk_from_score(score: float) -> str:
    if score < 50:
        return "needs-support"
    if score < 70:
        return "needs-attention"
    return "on-track"


def _student_metrics(student_id: int, db: Session) -> Dict[str, Any]:
    submissions = (
        db.query(Submission)
        .filter(Submission.student_id == student_id)
        .order_by(Submission.submitted_at)
        .all()
    )
    scored_values = [sub.score for sub in submissions if sub.score is not None]
    avg_score = sum(scored_values) / len(scored_values) if scored_values else 0.0
    risk = _risk_from_score(avg_score)

    topic_rows = db.query(StudentProgress).filter(StudentProgress.student_id == student_id).all()
    topic_mastery = [{"topic": row.topic, "mastery": row.mastery} for row in topic_rows]
    weak_topics = [row.topic for row in topic_rows if row.mastery < 70]

    weekly_scores = [
        {"week": f"Week {idx}", "score": sub.score or 0}
        for idx, sub in enumerate(submissions[-6:], 1)
    ]

    timeliness = []
    recent_submissions = submissions[-5:]
    for sub in recent_submissions:
        assignment = db.query(Assignment).filter(Assignment.id == sub.assignment_id).first()
        if not assignment:
            continue
        due = _parse_due_date(assignment.due_date)
        submitted = _to_utc(sub.submitted_at)
        if due and submitted:
            hours = round((due - submitted).total_seconds() / 3600, 1)
        else:
            hours = 0.0
        if hours >= 1:
            label = f"{abs(hours):g}h early"
        elif hours >= 0:
            label = f"{int(abs(hours) * 60)}min early"
        else:
            label = f"{abs(hours):g}h late"
        timeliness.append(
            {
                "assignment": assignment.title,
                "hoursBeforeDeadline": hours,
                "onTime": hours >= 0,
                "label": label,
            }
        )

    now = datetime.now(timezone.utc)
    submission_counts_by_day = defaultdict(int)
    for sub in submissions:
        submitted = _to_utc(sub.submitted_at)
        if submitted:
            key = submitted.date().isoformat()
            submission_counts_by_day[key] += 1

    study_heatmap = []
    for offset in range(27, -1, -1):
        day = now - timedelta(days=offset)
        key = day.date().isoformat()
        count = submission_counts_by_day.get(key, 0)
        intensity = min(count, 5)
        study_heatmap.append(
            {
                "day": day.day,
                "weekday": day.weekday(),
                "intensity": intensity,
                "date": day.strftime("%b %d"),
            }
        )

    total_questions_answered = 0
    for sub in submissions:
        try:
            answers = json.loads(sub.answers or "{}")
        except (TypeError, ValueError):
            answers = {}
        if isinstance(answers, dict):
            total_questions_answered += len(answers)

    active_events = total_questions_answered
    passive_events = max(len(submissions) * 2 - active_events, 0)
    total_events = max(active_events + passive_events, 1)
    active_ratio = round(active_events / total_events * 100)

    time_on_task = []
    for idx, sub in enumerate(submissions[-4:], 1):
        try:
            answers = json.loads(sub.answers or "{}")
        except (TypeError, ValueError):
            answers = {}
        answered = len(answers) if isinstance(answers, dict) else 0
        raw_time = round(max(answered * 0.8, 1.0), 1)
        effective_time = round(raw_time * 0.7, 1)
        time_on_task.append(
            {
                "week": f"Week {idx}",
                "effectiveTime": effective_time,
                "rawTime": raw_time,
            }
        )

    gradebook_access = []
    for idx, week in enumerate(weekly_scores, 1):
        checks = 1 if week["score"] == 0 else 2
        gradebook_access.append({"week": f"W{idx}", "checks": checks})

    active_days = sum(1 for day in study_heatmap if day["intensity"] > 0)
    consistency_score = round((active_days / max(len(study_heatmap), 1)) * 100)

    return {
        "avg_score": avg_score,
        "risk": risk,
        "topic_mastery": topic_mastery,
        "weak_topics": weak_topics,
        "weekly_scores": weekly_scores,
        "timeliness": timeliness,
        "study_heatmap": study_heatmap,
        "engagement": {
            "active": active_ratio,
            "passive": 100 - active_ratio,
        },
        "active_ratio": active_ratio,
        "time_on_task": time_on_task,
        "gradebook_access": gradebook_access,
        "consistency_score": consistency_score,
        "network_centrality": round(min(max(len(submissions) / 20, 0.1), 1.0), 2),
    }

# ─────────────────────────────────────────────
# Routes: Students (teacher view)
# ─────────────────────────────────────────────
@app.get("/api/students")
def get_students(current_user: User = Depends(require_teacher), db: Session = Depends(get_db)):
    students = db.query(User).filter(User.role == "student").all()
    result = []
    for s in students:
        subs = db.query(Submission).filter(Submission.student_id == s.id).all()
        scores = [sub.score for sub in subs if sub.score is not None]
        avg = sum(scores) / len(scores) if scores else 0.0
        risk = "needs-support" if avg < 50 else ("needs-attention" if avg < 70 else "on-track")
        result.append({"id": str(s.id), "name": s.name, "risk": risk, "successScore": round(avg)})
    return result

@app.get("/api/analytics/student/{student_id}")
def get_student_analytics(student_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "student" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Access denied")
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    metrics = _student_metrics(student_id, db)
    achievements_rows = db.query(Achievement).filter(Achievement.student_id == student_id).all()
    achievements = [{"id": str(a.id), "title": a.title, "description": a.description,
                     "icon": a.icon, "earnedDate": a.earned_date.strftime("%b %d, %Y")} for a in achievements_rows]
    return {
        "id": str(student.id), "name": student.name, "risk": metrics["risk"],
        "successScore": round(metrics["avg_score"]),
        "topicMastery": metrics["topic_mastery"],
        "weeklyScores": metrics["weekly_scores"],
        "submissionTimeliness": metrics["timeliness"],
        "studyHeatmap": metrics["study_heatmap"],
        "engagementBreakdown": metrics["engagement"],
        "activePassiveRatio": metrics["active_ratio"],
        "timeOnTask": metrics["time_on_task"],
        "networkCentrality": metrics["network_centrality"],
        "gradebookAccess": metrics["gradebook_access"],
        "consistencyScore": metrics["consistency_score"],
        "achievements": achievements,
    }

@app.get("/api/analytics/class")
def get_class_analytics(current_user: User = Depends(require_teacher), db: Session = Depends(get_db)):
    courses = db.query(Course).filter(Course.teacher_id == current_user.id).all()
    students = db.query(User).filter(User.role == "student").all()
    total_students = sum(c.student_count for c in courses)
    assignments = db.query(Assignment).filter(Assignment.teacher_id == current_user.id).all()
    pending_reviews = db.query(ReviewItem).filter(ReviewItem.status == "pending").count()
    due_this_week = sum(1 for a in assignments if a.status in ["draft", "pending"])
    completed_this_week = sum(a.submissions_count for a in assignments)
    student_alerts = []
    for s in students[:6]:
        subs = db.query(Submission).filter(Submission.student_id == s.id).all()
        scores = [sub.score for sub in subs if sub.score is not None]
        avg = sum(scores) / len(scores) if scores else 0.0
        risk = "needs-support" if avg < 50 else ("needs-attention" if avg < 70 else "on-track")
        if risk != "on-track":
            latest_course = courses[0].name if courses else "Math"
            reasons = ["Low recent assessment scores"] if scores else ["No graded submissions yet"]
            engagement_text = "Below average" if scores else "No activity yet"
            student_alerts.append({
                "name": s.name, "class": latest_course, "label": risk,
                "reasons": reasons,
                "metrics": {"testScores": f"{round(avg)}%", "engagement": engagement_text}
            })
    return {
        "quickStats": {
            "totalStudents": total_students,
            "pendingReviews": pending_reviews,
            "assignmentsDue": due_this_week,
            "completedThisWeek": completed_this_week,
        },
        "classes": [{"className": c.name, "totalStudents": c.student_count,
                     "averageScore": c.average_score, "trend": "up",
                     "atRiskStudents": c.at_risk_students} for c in courses],
        "studentAlerts": student_alerts,
    }


@app.get("/api/analytics/class-insights")
def get_class_insights(current_user: User = Depends(require_teacher), db: Session = Depends(get_db)):
    courses = db.query(Course).filter(Course.teacher_id == current_user.id).all()
    class_name = courses[0].name if courses else "Class"
    students = db.query(User).filter(User.role == "student").all()

    student_rows = []
    topic_values = defaultdict(list)
    weekly_totals = defaultdict(list)
    topic_to_students = defaultdict(list)

    for student in students:
        metrics = _student_metrics(student.id, db)
        trend = "stable"
        if len(metrics["weekly_scores"]) >= 2:
            first = metrics["weekly_scores"][0]["score"]
            last = metrics["weekly_scores"][-1]["score"]
            if last > first + 3:
                trend = "up"
            elif last < first - 3:
                trend = "down"

        weak_topics = metrics["weak_topics"][:2]
        student_rows.append(
            {
                "name": student.name,
                "score": round(metrics["avg_score"]),
                "trend": trend,
                "risk": metrics["risk"],
                "weakTopics": weak_topics,
            }
        )

        for entry in metrics["topic_mastery"]:
            topic = entry["topic"]
            topic_values[topic].append(entry["mastery"])
            if entry["mastery"] < 70:
                topic_to_students[topic].append(student.name)

        for index, row in enumerate(metrics["weekly_scores"], 1):
            weekly_totals[index].append(row["score"])

    topic_mastery = []
    for topic, values in topic_values.items():
        avg_mastery = sum(values) / len(values)
        topic_mastery.append(
            {
                "topic": topic,
                "mastery": round(avg_mastery),
                "students": len(values),
                "trend": "up" if avg_mastery >= 75 else ("down" if avg_mastery < 60 else "stable"),
            }
        )
    topic_mastery.sort(key=lambda item: item["topic"])

    performance_trend = []
    for index in sorted(weekly_totals.keys()):
        values = weekly_totals[index]
        if not values:
            continue
        performance_trend.append(
            {
                "week": f"Week {index}",
                "average": round(sum(values) / len(values)),
                "class": class_name,
            }
        )

    misconceptions = []
    ranked_topics = sorted(topic_to_students.items(), key=lambda item: len(item[1]), reverse=True)
    for topic, names in ranked_topics[:3]:
        unique_names = sorted(set(names))
        preview = unique_names[:4]
        remaining = len(unique_names) - len(preview)
        if remaining > 0:
            preview.append(f"+{remaining} more")
        misconceptions.append(
            {
                "topic": topic,
                "description": f"Many students are showing weak mastery in {topic.lower()}.",
                "affectedStudents": len(unique_names),
                "studentList": preview,
                "suggestedIntervention": f"Assign targeted practice focused on {topic.lower()}.",
            }
        )

    return {
        "className": class_name,
        "topicMastery": topic_mastery,
        "performanceTrend": performance_trend,
        "studentHeatmap": student_rows,
        "misconceptions": misconceptions,
    }

# ─────────────────────────────────────────────
# Routes: Submissions
# ─────────────────────────────────────────────
@app.post("/api/submissions")
def submit_assignment(data: SubmissionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Students only")
    assignment = db.query(Assignment).filter(Assignment.id == data.assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    questions = db.query(Question).filter(Question.assignment_id == data.assignment_id).all()
    # Score: count correct answers
    correct = 0
    total = len(questions)
    for q in questions:
        user_answer = data.answers.get(str(q.id), "")
        if q.correct_answer and user_answer.strip().lower() == q.correct_answer.strip().lower():
            correct += 1
    score = (correct / total * 100) if total > 0 else 80.0
    existing = db.query(Submission).filter(Submission.assignment_id == data.assignment_id, Submission.student_id == current_user.id).first()
    if existing:
        existing.answers = json.dumps(data.answers)
        existing.score = score
        existing.submitted_at = datetime.now(timezone.utc)
        db.commit()
        return {"score": score, "correct": correct, "total": total}
    submission = Submission(
        assignment_id=data.assignment_id, student_id=current_user.id,
        answers=json.dumps(data.answers), score=score
    )
    db.add(submission)
    assignment.submissions_count = (assignment.submissions_count or 0) + 1
    db.commit()
    return {"score": score, "correct": correct, "total": total}

@app.get("/api/submissions/me")
def get_my_submissions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    subs = db.query(Submission).filter(Submission.student_id == current_user.id).all()
    return [{"id": s.id, "assignmentId": s.assignment_id, "score": s.score,
             "submittedAt": s.submitted_at.isoformat()} for s in subs]

# ─────────────────────────────────────────────
# Routes: Questions
# ─────────────────────────────────────────────
@app.get("/api/assignments/{assignment_id}/questions")
def get_questions(assignment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    questions = db.query(Question).filter(Question.assignment_id == assignment_id).all()
    return [_serialize_question(q) for q in questions]

def _serialize_question(q: Question):
    return {
        "id": str(q.id), "question": q.question_text,
        "type": q.question_type,
        "options": json.loads(q.options) if q.options else None,
        "correctAnswer": q.correct_answer,
        "hint": q.hint, "difficulty": q.difficulty,
        "explanation": q.explanation,
        "isSubmitted": False, "userAnswer": "", "isCorrect": None, "feedback": ""
    }

# ─────────────────────────────────────────────
# Routes: AI Content Generation
# ─────────────────────────────────────────────
@app.post("/api/ai/generate")
def generate_content(data: GenerateRequest, current_user: User = Depends(require_teacher), db: Session = Depends(get_db)):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="AI provider is not configured")
    questions = _generate_with_gemini(data)

    # Save to review queue
    for q in questions:
        ri = ReviewItem(
            content_type="question",
            content=q["question"],
            context=f"{data.context or 'General'} - {data.topic}",
            status="pending",
            risk_level="low",
            risk_reasons=json.dumps([]),
            teacher_id=current_user.id
        )
        db.add(ri)
    db.commit()
    return {"questions": questions, "addedToReviewQueue": True}

def _generate_with_gemini(data: GenerateRequest) -> list:
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)
        prompt = f"""Generate {data.num_questions} educational questions about "{data.topic}" for a student.
Difficulty: {data.difficulty}
Context: {data.context or 'General educational setting'}

Return a JSON array with this exact structure:
[{{"id": "1", "question": "...", "difficulty": "easy|medium|hard", "answer": "...", "explanation": "..."}}]

Return ONLY the JSON array, no other text."""
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                response_mime_type="application/json",
            ),
        )
        content = (response.text or "").strip()
        questions = json.loads(content)
        if not isinstance(questions, list):
            raise ValueError("Gemini response is not a list")
        return questions
    except Exception as e:
        print(f"Gemini generation error: {e}")
        raise HTTPException(status_code=502, detail="Gemini generation failed")

@app.get("/api/ai/feedback")
def get_ai_feedback(question_id: int, student_answer: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="AI provider is not configured")
    feedback = _get_gemini_feedback(question.question_text, student_answer, question.correct_answer)
    return {"feedback": feedback, "correctAnswer": question.correct_answer}

def _get_gemini_feedback(question: str, student_answer: str, correct_answer: str) -> str:
    try:
        from google import genai

        client = genai.Client(api_key=GEMINI_API_KEY)
        prompt = f"""A student answered an educational question. Give brief, encouraging feedback.

Question: {question}
Student's answer: {student_answer}
Correct answer: {correct_answer}

Give feedback in 2-3 sentences. Be encouraging and educational."""
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )
        return (response.text or "").strip()
    except Exception as e:
        print(f"Gemini feedback error: {e}")
        return f"The correct answer is: {correct_answer}"

# ─────────────────────────────────────────────
# Routes: Student Progress
# ─────────────────────────────────────────────
@app.get("/api/progress/me")
def get_my_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_student_analytics(current_user.id, current_user, db)

# ─────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────
@app.get("/")
def read_root():
    return {"message": "EduAI Backend is running"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "EduAI FastAPI"}
