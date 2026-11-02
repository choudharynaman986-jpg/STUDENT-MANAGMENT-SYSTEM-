const STORAGE_KEY = "campusDeskStudents";
const ATTENDANCE_KEY = "campusDeskAttendance";
const MARKS_KEY = "campusDeskMarks";

const sampleStudents = [
  {id:"s1",name:"Aarav Patil",roll:"BCA001",course:"BCA",email:"aarav@example.com"},
  {id:"s2",name:"Aditi Sharma",roll:"BCA002",course:"BCA",email:"aditi@example.com"},
  {id:"s3",name:"Rohan Deshmukh",roll:"BCA003",course:"BCA",email:"rohan@example.com"},
  {id:"s4",name:"Sneha Kulkarni",roll:"BCA004",course:"BCA",email:"sneha@example.com"}
];
let students = load(STORAGE_KEY, sampleStudents);
let attendance = load(ATTENDANCE_KEY, {});
let marks = load(MARKS_KEY, []);

function load(key, fallback) {
  try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : fallback; }
  catch { return fallback; }
}
function saveAll() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
  localStorage.setItem(MARKS_KEY, JSON.stringify(marks));
}
function todayKey() { return document.getElementById("attendance-date").value; }
function safe(value) {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function initials(name) { return name.split(" ").map(part => part[0]).slice(0,2).join("").toUpperCase(); }
function studentCell(student) {
  return `<div class="student-cell"><span class="student-avatar">${safe(initials(student.name))}</span>${safe(student.name)}</div>`;
}
function showPage(page) {
  document.querySelectorAll(".page").forEach(el => el.classList.remove("active-page"));
  document.getElementById(`${page}-page`).classList.add("active-page");
  document.querySelectorAll(".nav-link").forEach(el => el.classList.toggle("active", el.dataset.page === page));
  document.getElementById("page-title").textContent = page[0].toUpperCase() + page.slice(1);
  renderAll();
}
document.querySelectorAll(".nav-link").forEach(btn => btn.addEventListener("click", () => showPage(btn.dataset.page)));
document.getElementById("today").textContent = new Date().toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"});
document.getElementById("attendance-date").value = new Date().toISOString().slice(0,10);

function renderDashboard() {
  const todays = attendance[todayKey()] || {};
  const present = Object.values(todays).filter(value => value === "Present").length;
  const totalMarked = Object.keys(todays).length;
  const allMarks = marks.map(item => Number(item.score));
  document.getElementById("total-students").textContent = students.length;
  document.getElementById("present-count").textContent = present;
  document.getElementById("average-marks").textContent = allMarks.length ? `${Math.round(allMarks.reduce((a,b)=>a+b,0)/allMarks.length)}%` : "—";
  document.getElementById("attendance-rate").textContent = totalMarked ? `${Math.round(present/totalMarked*100)}%` : "—";
  const recent = [...students].slice(-5).reverse();
  document.getElementById("recent-table").innerHTML = recent.length ? recent.map(s => `<tr><td>${studentCell(s)}</td><td>${safe(s.roll)}</td><td>${safe(s.course)}</td><td>${safe(s.email)}</td></tr>`).join("") : `<tr><td colspan="4">No students added yet.</td></tr>`;
}
function renderStudents() {
  const query = document.getElementById("student-search").value.toLowerCase();
  const filtered = students.filter(s => [s.name,s.roll,s.course,s.email].some(v => v.toLowerCase().includes(query)));
  document.getElementById("student-total").textContent = `${filtered.length} student(s)`;
  document.getElementById("students-table").innerHTML = filtered.length ? filtered.map(s => `<tr><td>${studentCell(s)}</td><td>${safe(s.roll)}</td><td>${safe(s.course)}</td><td>${safe(s.email)}</td><td><button class="action-btn" data-edit="${s.id}">Edit</button><button class="action-btn delete-btn" data-delete="${s.id}">Delete</button></td></tr>`).join("") : `<tr><td colspan="5">No matching students found.</td></tr>`;
}
function renderAttendance() {
  const daily = attendance[todayKey()] || {};
  document.getElementById("attendance-table").innerHTML = students.length ? students.map(s => `<tr><td>${studentCell(s)}</td><td>${safe(s.roll)}</td><td><select class="status-select" data-attendance="${s.id}"><option ${daily[s.id] === "Present" ? "selected" : ""}>Present</option><option ${daily[s.id] === "Absent" ? "selected" : ""}>Absent</option></select></td></tr>`).join("") : `<tr><td colspan="3">Add students before recording attendance.</td></tr>`;
}
function grade(score) {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}
function renderMarks() {
  const selector = document.getElementById("marks-student");
  const previous = selector.value;
  selector.innerHTML = students.map(s => `<option value="${s.id}">${safe(s.name)} (${safe(s.roll)})</option>`).join("");
  if (students.some(s => s.id === previous)) selector.value = previous;
  document.getElementById("marks-table").innerHTML = marks.length ? [...marks].reverse().map(m => {
    const student = students.find(s => s.id === m.studentId);
    return `<tr><td>${student ? safe(student.name) : "Deleted student"}</td><td>${safe(m.subject)}</td><td>${m.score}/100</td><td><strong>${grade(Number(m.score))}</strong></td><td><button class="action-btn delete-btn" data-mark-delete="${m.id}">Delete</button></td></tr>`;
  }).join("") : `<tr><td colspan="5">No marks recorded yet.</td></tr>`;
}
function renderAll() { renderDashboard(); renderStudents(); renderAttendance(); renderMarks(); }
function openDialog(student = null) {
  document.getElementById("student-form").reset();
  document.getElementById("form-feedback").textContent = "";
  document.getElementById("edit-id").value = student ? student.id : "";
  document.getElementById("dialog-title").textContent = student ? "Edit student" : "Add new student";
  if (student) {
    document.getElementById("student-name").value = student.name;
    document.getElementById("student-roll").value = student.roll;
    document.getElementById("student-course").value = student.course;
    document.getElementById("student-email").value = student.email;
  }
  document.getElementById("student-dialog").showModal();
}
document.getElementById("add-student-btn").addEventListener("click", () => openDialog());
document.getElementById("dashboard-add").addEventListener("click", () => { showPage("students"); openDialog(); });
document.getElementById("close-dialog").addEventListener("click", () => document.getElementById("student-dialog").close());
document.getElementById("cancel-dialog").addEventListener("click", () => document.getElementById("student-dialog").close());

document.getElementById("student-form").addEventListener("submit", event => {
  event.preventDefault();
  const id = document.getElementById("edit-id").value;
  const student = {
    id: id || `s${Date.now()}`,
    name: document.getElementById("student-name").value.trim(),
    roll: document.getElementById("student-roll").value.trim().toUpperCase(),
    course: document.getElementById("student-course").value.trim(),
    email: document.getElementById("student-email").value.trim()
  };
  const duplicate = students.some(s => s.roll.toLowerCase() === student.roll.toLowerCase() && s.id !== id);
  if (duplicate) { document.getElementById("form-feedback").textContent = "That roll number is already registered."; return; }
  if (id) students = students.map(s => s.id === id ? student : s);
  else students.push(student);
  saveAll(); document.getElementById("student-dialog").close(); renderAll();
});

document.getElementById("students-table").addEventListener("click", event => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;
  if (editId) openDialog(students.find(s => s.id === editId));
  if (deleteId && confirm("Delete this student record?")) {
    students = students.filter(s => s.id !== deleteId);
    marks = marks.filter(m => m.studentId !== deleteId);
    Object.values(attendance).forEach(day => delete day[deleteId]);
    saveAll(); renderAll();
  }
});
document.getElementById("student-search").addEventListener("input", renderStudents);
document.getElementById("attendance-date").addEventListener("change", renderAttendance);
document.getElementById("save-attendance").addEventListener("click", () => {
  const day = todayKey(); attendance[day] = attendance[day] || {};
  document.querySelectorAll("[data-attendance]").forEach(select => attendance[day][select.dataset.attendance] = select.value);
  saveAll(); renderAll(); document.getElementById("attendance-feedback").textContent = "Attendance saved successfully.";
});
document.getElementById("add-mark").addEventListener("click", () => {
  const studentId = document.getElementById("marks-student").value;
  const subject = document.getElementById("subject-name").value.trim();
  const score = Number(document.getElementById("subject-marks").value);
  const feedback = document.getElementById("marks-feedback");
  if (!studentId) { feedback.textContent = "Please add a student first."; return; }
  if (!subject) { feedback.textContent = "Enter a subject name."; return; }
  if (document.getElementById("subject-marks").value === "" || score < 0 || score > 100) { feedback.textContent = "Enter marks between 0 and 100."; return; }
  marks.push({id:`m${Date.now()}`,studentId,subject,score});
  saveAll(); renderAll(); document.getElementById("subject-name").value = ""; document.getElementById("subject-marks").value = ""; feedback.textContent = "Marks added successfully.";
});
document.getElementById("marks-table").addEventListener("click", event => {
  const id = event.target.dataset.markDelete;
  if (id && confirm("Delete this marks record?")) { marks = marks.filter(m => m.id !== id); saveAll(); renderAll(); }
});
renderAll();
