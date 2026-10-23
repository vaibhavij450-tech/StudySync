
import { useEffect, useState } from "react";
import "./App.css";

const subjects = [
  { name: "Computer Science", short: "CS", color: "#8c7ce7", progress: 76, hours: "12.5h" },
  { name: "Web Development", short: "WD", color: "#54a7c9", progress: 62, hours: "8.5h" },
  { name: "DBMS", short: "DB", color: "#e6a45c", progress: 48, hours: "6h" },
  { name: "Operating Systems", short: "OS", color: "#60b99b", progress: 85, hours: "10h" },
];

const week = [
  { day: "Mon", date: 19 },
  { day: "Tue", date: 20 },
  { day: "Wed", date: 21 },
  { day: "Thu", date: 22 },
  { day: "Fri", date: 23 },
  { day: "Sat", date: 24 },
  { day: "Sun", date: 25 },
];

const emptyForm = {
  title: "",
  subject: "Computer Science",
  time: "10:00 AM",
  duration: "45 min",
  priority: "Medium",
};

const API_URL = "http://localhost:5000/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedDay, setSelectedDay] = useState(22);
  const [showModal, setShowModal] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [newTask, setNewTask] = useState(emptyForm);

  const completed = tasks.filter((task) => task.done).length;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Could not load tasks.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid response from backend.");
        }

        if (!cancelled) {
          setTasks(data);
          setApiError("");
        }
      } catch {
        if (!cancelled) {
          setApiError(
            "Cannot connect to the backend. Make sure the server is running on port 5000."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  function notify(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  async function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);

    if (!task) return;

    const updatedDone = !task.done;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ done: updatedDone }),
      });

      if (!response.ok) {
        throw new Error("Could not update task.");
      }

      const updatedTask = await response.json();

      setTasks((current) =>
        current.map((item) => (item.id === id ? updatedTask : item))
      );

      setApiError("");
    } catch {
      notify("Task update failed. Check your backend.");
    }
  }

  async function addTask(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create task.");
      }

      const createdTask = data.task || data;

      setTasks((current) => [...current, createdTask]);
      setNewTask(emptyForm);
      setShowModal(false);
      setActivePage("Tasks");
      setApiError("");
      notify("Study task saved successfully!");
    } catch (error) {
      notify(error.message || "Could not connect to the backend.");
    } finally {
      setSaving(false);
    }
  }

  const pageTitle = {
    Dashboard: "Your study space",
    "My Schedule": "Your weekly schedule",
    Tasks: "Your study tasks",
    Subjects: "Your subjects",
  }[activePage];

  return (
    <div className="study-app">
      <aside className="sidebar">
        <a
          className="logo"
          href="#top"
          onClick={() => setActivePage("Dashboard")}
        >
          <span className="logo-icon">✳</span>
          <span>
            study<span>sync</span>
          </span>
        </a>

        <div className="nav-label">WORKSPACE</div>

        <nav className="nav-menu">
          {[
            ["Dashboard", "▦"],
            ["My Schedule", "▦"],
            ["Tasks", "☑"],
            ["Subjects", "▤"],
          ].map(([label, icon]) => (
            <button
              key={label}
              className={`nav-link ${activePage === label ? "active" : ""}`}
              onClick={() => setActivePage(label)}
            >
              <span className="nav-icon">{icon}</span>
              {label}
              {label === "Tasks" && (
                <span className="nav-count">
                  {tasks.filter((task) => !task.done).length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-tip">
          <div className="tip-art">🌱</div>
          <h3>
            Little steps,
            <br />
            big progress.
          </h3>
          <p>
            Consistency is the secret to reaching your goals.
          </p>
          <div className="tip-progress">
            <span style={{ width: `${progress}%` }} />
          </div>
          <small>{progress}% of your tasks complete</small>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">S</div>
          <div>
            <strong>Student workspace</strong>
            <small>Keep learning ✨</small>
          </div>
          <span className="profile-dots">•••</span>
        </div>
      </aside>

      <main className="main-area" id="top">
        <header className="topbar">
          <div className="mobile-logo">
            <span className="logo-icon">✳</span> studysync
          </div>

          <div className="breadcrumbs">
            Workspace <span>/</span> {activePage}
          </div>

          <div className="topbar-actions">
            <span className="date-label">◷ &nbsp; Thursday, October 22</span>
            <button
              className="notification-button"
              onClick={() => notify("You're all caught up!")}
              aria-label="Notifications"
            >
              ♧<i />
            </button>
            <div className="top-avatar">S</div>
          </div>
        </header>

        {notice && <div className="toast">✓ &nbsp;{notice}</div>}

        <div className="page-container">
          {apiError && (
            <div
              role="alert"
              style={{
                padding: "12px 15px",
                marginBottom: 18,
                borderRadius: 8,
                background: "#fff0ef",
                color: "#b54848",
                fontSize: 12,
              }}
            >
              {apiError}
              <button
                onClick={() => window.location.reload()}
                style={{
                  marginLeft: 12,
                  border: 0,
                  background: "transparent",
                  color: "inherit",
                  fontWeight: 700,
                }}
              >
                Retry
              </button>
            </div>
          )}

          {activePage === "Dashboard" && (
            <>
              <section className="welcome-panel">
                <div className="welcome-copy">
                  <div className="eyebrow">
                    <span /> YOUR PERSONAL LEARNING SPACE
                  </div>
                  <h1>
                    Make today
                    <br />
                    <span>count.</span>
                  </h1>
                  <p>
                    A little progress every day adds up to big results.
                    Ready to make this a good study day?
                  </p>
                  <button
                    className="primary-button"
                    onClick={() => setShowModal(true)}
                  >
                    ＋ Plan a study session <span>↗</span>
                  </button>
                  <div className="welcome-note">
                    <span>✦</span> You've got this. One task at a time.
                  </div>
                </div>

                <div className="welcome-illustration">
                  <div className="illustration-circle">
                    <div className="orbit orbit-one" />
                    <div className="orbit orbit-two" />
                    <div className="book-stack">
                      <div className="book book-back" />
                      <div className="book book-middle" />
                      <div className="book book-front">✳</div>
                    </div>
                    <div className="plant">🌿</div>
                    <span className="float-note note-one">✦ Stay curious</span>
                    <span className="float-note note-two">☁ Keep growing</span>
                  </div>
                </div>
              </section>

              <section className="stats-row">
                <Stat
                  icon="◷"
                  tone="blue"
                  label="Study time"
                  value="4.5 hrs"
                  detail="Your weekly goal: 20 hrs"
                />
                <Stat
                  icon="☑"
                  tone="green"
                  label="Tasks completed"
                  value={`${completed}/${tasks.length}`}
                  detail={`${progress}% of your task list`}
                />
                <Stat
                  icon="✳"
                  tone="orange"
                  label="Day streak"
                  value="5 days"
                  detail="Keep the momentum going!"
                />
                <Stat
                  icon="▤"
                  tone="purple"
                  label="Active subjects"
                  value={subjects.length}
                  detail="Your learning journey"
                />
              </section>
            </>
          )}

          <section className="content-section">
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  <span />
                  {activePage === "Subjects"
                    ? "YOUR LEARNING AREAS"
                    : activePage === "Tasks"
                      ? "STAY ON TRACK"
                      : "YOUR PERSONAL PLAN"}
                </div>
                <h2>
                  {pageTitle} <span className="heading-star">✳</span>
                </h2>
                <p>
                  {activePage === "Subjects"
                    ? "See how you're progressing across your subjects."
                    : activePage === "Tasks"
                      ? "Every completed task is a step forward."
                      : activePage === "My Schedule"
                        ? "Make space for learning, breaks, and everything in between."
                        : "Here's what's happening with your learning today."}
                </p>
              </div>

              <button
                className="outline-button"
                onClick={() => setShowModal(true)}
              >
                ＋ Add task
              </button>
            </div>

            {activePage === "My Schedule" && (
              <div className="week-picker">
                {week.map((item) => (
                  <button
                    key={item.day}
                    onClick={() => setSelectedDay(item.date)}
                    className={
                      selectedDay === item.date
                        ? "day-tile selected-day"
                        : "day-tile"
                    }
                  >
                    <span>{item.day}</span>
                    <strong>{item.date}</strong>
                    <i className={item.date % 2 === 0 ? "has-event" : ""} />
                  </button>
                ))}
              </div>
            )}

            {activePage === "Subjects" ? (
              <div className="subject-grid">
                {subjects.map((subject) => (
                  <article className="subject-card" key={subject.name}>
                    <div className="subject-top">
                      <div
                        className="subject-symbol"
                        style={{
                          background: `${subject.color}20`,
                          color: subject.color,
                        }}
                      >
                        {subject.short}
                      </div>
                      <span className="subject-menu">•••</span>
                    </div>
                    <h3>{subject.name}</h3>
                    <div className="subject-hours">
                      {subject.hours} <span>studied</span>
                    </div>
                    <div className="progress-track">
                      <span
                        style={{
                          width: `${subject.progress}%`,
                          background: subject.color,
                        }}
                      />
                    </div>
                    <div className="progress-label">
                      <span>Preparation</span>
                      <strong>{subject.progress}%</strong>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="tasks-layout">
                <div className="task-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>
                        {activePage === "My Schedule"
                          ? "Thursday's sessions"
                          : "Your study sessions"}
                      </h3>
                      <p>
                        {loading
                          ? "Loading tasks..."
                          : `${tasks.filter((task) => !task.done).length} tasks left to tackle`}
                      </p>
                    </div>
                    <span className="today-pill">● TODAY</span>
                  </div>

                  <div className="task-list">
                    {loading && <p>Loading your study tasks...</p>}

                    {!loading && tasks.length === 0 && !apiError && (
                      <div className="empty-tasks">
                        No tasks yet. Add your first study session!
                      </div>
                    )}

                    {!loading &&
                      tasks.map((task) => (
                        <article
                          className={`task-item ${task.done ? "task-done" : ""}`}
                          key={task.id}
                        >
                          <button
                            className={`task-check ${task.done ? "checked" : ""}`}
                            onClick={() => toggleTask(task.id)}
                            aria-label={
                              task.done ? "Mark incomplete" : "Mark complete"
                            }
                          >
                            {task.done ? "✓" : ""}
                          </button>

                          <div className="task-time">
                            {task.time}
                            <span>{task.duration}</span>
                          </div>

                          <div className="task-description">
                            <h4>{task.title}</h4>
                            <span className="task-subject">
                              {task.subject}
                            </span>
                          </div>

                          <span
                            className={`priority priority-${(task.priority || "Medium").toLowerCase()}`}
                          >
                            {task.priority || "Medium"}
                          </span>
                        </article>
                      ))}
                  </div>

                  <button
                    className="add-task-row"
                    onClick={() => setShowModal(true)}
                  >
                    ＋ Add another study session
                  </button>
                </div>

                <aside className="focus-panel">
                  <div className="focus-header">
                    <span>✳</span>
                    <span>YOUR DAILY FOCUS</span>
                  </div>
                  <h3>
                    Progress over
                    <br />
                    perfection.
                  </h3>
                  <p>
                    Keep showing up for yourself. Every minute spent learning
                    matters.
                  </p>
                  <div
                    className="progress-ring"
                    style={{ "--progress": `${progress * 3.6}deg` }}
                  >
                    <div>
                      <strong>{progress}%</strong>
                      <span>completed</span>
                    </div>
                  </div>
                  <div className="focus-bottom">
                    <span>✓</span>
                    <div>
                      <strong>{completed} tasks done</strong>
                      <small>You're building a great habit!</small>
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </section>

          {activePage !== "Subjects" && (
            <section className="subjects-section">
              <div className="mini-section-heading">
                <div>
                  <div className="eyebrow">
                    <span /> KEEP LEARNING
                  </div>
                  <h2>In your study mix</h2>
                </div>
                <button onClick={() => setActivePage("Subjects")}>
                  View all subjects →
                </button>
              </div>
              <div className="mini-subject-grid">
                {subjects.slice(0, 3).map((subject) => (
                  <button
                    className="mini-subject"
                    key={subject.name}
                    onClick={() => setActivePage("Subjects")}
                  >
                    <span
                      className="mini-subject-icon"
                      style={{
                        background: `${subject.color}20`,
                        color: subject.color,
                      }}
                    >
                      {subject.short}
                    </span>
                    <span className="mini-subject-info">
                      <strong>{subject.name}</strong>
                      <small>{subject.hours} studied</small>
                      <span className="mini-track">
                        <i
                          style={{
                            width: `${subject.progress}%`,
                            background: subject.color,
                          }}
                        />
                      </span>
                    </span>
                    <b>{subject.progress}%</b>
                  </button>
                ))}
              </div>
            </section>
          )}

          <footer className="footer">
            <span>✳ StudySync</span>
            <span>Made for your next big breakthrough. ✨</span>
          </footer>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="task-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <div className="eyebrow">
                  <span /> MAKE TIME FOR YOURSELF
                </div>
                <h2>Plan a study session ✳</h2>
                <p>Break your goals into small, achievable steps.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="close-modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={addTask}>
              <label>
                Task name
                <input
                  required
                  value={newTask.title}
                  onChange={(event) =>
                    setNewTask({ ...newTask, title: event.target.value })
                  }
                  placeholder="e.g. Revise chapter 3"
                />
              </label>

              <label>
                Subject
                <select
                  value={newTask.subject}
                  onChange={(event) =>
                    setNewTask({ ...newTask, subject: event.target.value })
                  }
                >
                  {subjects.map((subject) => (
                    <option key={subject.name}>{subject.name}</option>
                  ))}
                </select>
              </label>

              <div className="form-columns">
                <label>
                  Start time
                  <input
                    required
                    value={newTask.time}
                    onChange={(event) =>
                      setNewTask({ ...newTask, time: event.target.value })
                    }
                    placeholder="10:00 AM"
                  />
                </label>

                <label>
                  Duration
                  <select
                    value={newTask.duration}
                    onChange={(event) =>
                      setNewTask({ ...newTask, duration: event.target.value })
                    }
                  >
                    {[
                      "15 min",
                      "30 min",
                      "45 min",
                      "60 min",
                      "90 min",
                      "120 min",
                    ].map((duration) => (
                      <option key={duration}>{duration}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Priority
                <select
                  value={newTask.priority}
                  onChange={(event) =>
                    setNewTask({ ...newTask, priority: event.target.value })
                  }
                >
                  {["Low", "Medium", "High"].map((priority) => (
                    <option key={priority}>{priority}</option>
                  ))}
                </select>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="outline-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Create study task ↗"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, tone, label, value, detail }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-detail">{detail}</span>
    </article>
  );
}

export default App;
