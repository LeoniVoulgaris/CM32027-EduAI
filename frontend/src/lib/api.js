const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("eduai_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("eduai_token");
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

// Auth
export async function login(email, password) {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
}

export async function register(email, name, password, role) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, name, password, role }),
  });
}

export async function getMe() {
  return request("/api/users/me");
}

// Dashboard / Analytics
export async function getClassAnalytics() {
  return request("/api/analytics/class");
}

export async function getClassInsights() {
  return request("/api/analytics/class-insights");
}

export async function getStudentAnalytics(studentId) {
  return request(`/api/analytics/student/${studentId}`);
}

export async function getMyProgress() {
  return request("/api/progress/me");
}

// Students
export async function getStudents() {
  return request("/api/students");
}

// Courses
export async function getCourses() {
  return request("/api/courses");
}

export async function createCourse(name) {
  return request("/api/courses", { method: "POST", body: JSON.stringify({ name }) });
}

// Assignments
export async function getAssignments() {
  return request("/api/assignments");
}

export async function createAssignment(data) {
  return request("/api/assignments", { method: "POST", body: JSON.stringify(data) });
}

export async function updateAssignment(id, data) {
  return request(`/api/assignments/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteAssignment(id) {
  return request(`/api/assignments/${id}`, { method: "DELETE" });
}

export async function getAssignmentQuestions(assignmentId) {
  return request(`/api/assignments/${assignmentId}/questions`);
}

// Submissions
export async function submitAssignment(assignmentId, answers) {
  return request("/api/submissions", {
    method: "POST",
    body: JSON.stringify({ assignment_id: assignmentId, answers }),
  });
}

export async function getMySubmissions() {
  return request("/api/submissions/me");
}

// Review Queue
export async function getReviewItems() {
  return request("/api/review");
}

export async function approveReviewItem(id, teacherEdits = null) {
  return request(`/api/review/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ teacher_edits: teacherEdits }),
  });
}

export async function rejectReviewItem(id) {
  return request(`/api/review/${id}/reject`, { method: "POST" });
}

// AI Generation
export async function generateContent(topic, difficulty, numQuestions, context = "") {
  return request("/api/ai/generate", {
    method: "POST",
    body: JSON.stringify({ topic, difficulty, num_questions: numQuestions, context }),
  });
}

export async function getAIFeedback(questionId, studentAnswer) {
  return request(`/api/ai/feedback?question_id=${questionId}&student_answer=${encodeURIComponent(studentAnswer)}`);
}
