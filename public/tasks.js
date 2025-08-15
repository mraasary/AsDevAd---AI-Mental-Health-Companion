const DEFAULT_TASKS = [
  { task: 'Drink a glass of water', time: '08:00' },
  { task: '5-minute mindful breathing', time: '09:00' },
  { task: 'Take a short walk (10 mins)', time: '11:00' },
  { task: 'Eat a nourishing meal', time: '13:00' },
  { task: "Write 3 things you're grateful for", time: '18:00' },
  { task: 'Stretch or light yoga (5 mins)', time: '19:30' },
  { task: 'Sleep by 10:30 PM', time: '22:30' },
];

async function loadTodayTasks() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const email = user?.email;
  if (!email) return;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const taskList = document.getElementById("task-list");
  if (!taskList) return; // Not on dashboard page
  
  taskList.innerHTML = "";

  try {
    const res = await fetch(`http://localhost:3000/api/tasks/${email}`);
    const data = await res.json();
    const todayTasks = [];

    // All tasks from DB for today
    const allTasks = data.groupedTasks?.[todayStr] || [];

    // Add DB tasks first (completed + custom ones)
    allTasks.forEach(task => {
      todayTasks.push({ ...task, source: "db" });
    });

    // Add default tasks only if not already in DB
    DEFAULT_TASKS.forEach(defaultTask => {
      const exists = allTasks.some(
        t => t.task === defaultTask.task && t.time === defaultTask.time
      );
      if (!exists) todayTasks.push({ ...defaultTask, completed: false, source: "default" });
    });

    // Render tasks
    for (const task of todayTasks) {
      const item = document.createElement("li");
      item.className = "task-item" + (task.completed ? " task-completed" : "");

      item.innerHTML = `
        <div class="task-checkbox ${task.completed ? "completed" : ""}"></div>
        <div class="task-text">${task.task}</div>
        <div class="task-due">${task.time}</div>
      `;

      // Toggle complete/incomplete
      item.querySelector(".task-checkbox").addEventListener("click", async () => {
        const checkbox = item.querySelector(".task-checkbox");
        checkbox.classList.toggle("completed");
        item.classList.toggle("task-completed");

        const isCompleted = checkbox.classList.contains("completed");

        await fetch("http://localhost:3000/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            task: task.task,
            time: task.time,
            date: todayStr,
            completed: isCompleted,
          }),
        });
      });

      taskList.appendChild(item);
    }
  } catch (err) {
    console.error("Failed to load tasks:", err);
    taskList.innerHTML = "<li class='task-item'>Could not load tasks</li>";
  }
}

async function addCustomTask() {
  const taskInput = document.getElementById("custom-task-name");
  const timeInput = document.getElementById("custom-task-time");
  const task = taskInput.value.trim();
  const time = timeInput.value || "Anytime";

  if (!task) return alert("Please enter a task name.");

  const user = JSON.parse(localStorage.getItem("currentUser"));
  const email = user?.email;
  if (!email) return alert("User not logged in");

  const today = new Date().toISOString().split("T")[0];

  try {
    const res = await fetch("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        task,
        time,
        date: today,
        completed: false,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      alert("New task added!");
      taskInput.value = "";
      timeInput.value = "";
      loadTodayTasks(); // Refresh task list
    } else {
      alert("Failed to add task: " + result.error);
    }
  } catch (err) {
    console.error(err);
    alert("Error adding task.");
  }
}

async function loadTaskHistory() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const email = user?.email;

  if (!email) {
    const container = document.getElementById('task-history-container');
    if (container) {
      container.innerHTML = "<p>User not found.</p>";
    }
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/tasks/${email}`);
    const data = await res.json();
    console.log("Fetched data from server:", data);

    const groupedTasks = data.groupedTasks || {};
    const container = document.getElementById("task-history-container");
    if (!container) return; // Not on task history page

    if (Object.keys(groupedTasks).length === 0) {
      container.innerHTML = "<p>No tasks completed yet.</p>";
      return;
    }

    container.innerHTML = "";
    for (const [date, tasks] of Object.entries(groupedTasks)) {
      const section = document.createElement("div");
      section.classList.add("task-day");
      section.innerHTML = `
        <h2>${date}</h2>
        <ul>
          ${tasks.map(t => `<li>${t.task} (${t.time})</li>`).join("")}
        </ul>
      `;
      container.appendChild(section);
    }

  } catch (error) {
    console.error("Error loading task history:", error);
    const container = document.getElementById("task-history-container");
    if (container) {
      container.innerHTML = "<p>Failed to load tasks.</p>";
    }
  }
}

// Initialize based on current page
document.addEventListener("DOMContentLoaded", function() {
  // Check if we're on the dashboard page
  if (document.getElementById("task-list")) {
    loadTodayTasks();
  }
  
  // Check if we're on the task history page
  if (document.getElementById("task-history-container")) {
    loadTaskHistory();
  }
});