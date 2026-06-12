let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentSort = 'newest';

const taskInput    = document.getElementById('taskInput');
const addBtn       = document.getElementById('addBtn');
const taskList     = document.getElementById('taskList');
const clearDoneBtn = document.getElementById('clearDoneBtn');
const clearAllBtn  = document.getElementById('clearAllBtn');
const filterBtns   = document.querySelectorAll('.filter-btn');
const sortSelect   = document.getElementById('sortSelect');
const statTotal    = document.getElementById('statTotal');
const statActive   = document.getElementById('statActive');
const statDone     = document.getElementById('statDone');

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) { taskInput.focus(); return; }
  tasks.push({ id: Date.now(), text, done: false });
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function clearDone() {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  renderTasks();
}

function clearAll() {
  if (tasks.length === 0) return;
  if (confirm('Удалить все задачи?')) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
}

function getSorted(arr) {
  const copy = [...arr];
  if (currentSort === 'newest') return copy.sort((a, b) => b.id - a.id);
  if (currentSort === 'oldest') return copy.sort((a, b) => a.id - b.id);
  if (currentSort === 'az') return copy.sort((a, b) => a.text.localeCompare(b.text, 'ru'));
  if (currentSort === 'za') return copy.sort((a, b) => b.text.localeCompare(a.text, 'ru'));
  return copy;
}

function renderTasks() {
  let filtered;
  if (currentFilter === 'active') filtered = tasks.filter(t => !t.done);
  else if (currentFilter === 'done') filtered = tasks.filter(t => t.done);
  else filtered = tasks;

  const sorted = getSorted(filtered);

  taskList.innerHTML = '';
  if (sorted.length === 0) {
    taskList.innerHTML = '<p class="empty-msg">Задач нет 🎉</p>';
  } else {
    sorted.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' done' : '');
      li.innerHTML = `
        <span class="task-num">${sorted.indexOf(task) + 1}</span>
        <input type="checkbox" ${task.done ? 'checked' : ''} />
        <span class="task-text">${escapeHTML(task.text)}</span>
        <button class="delete-btn" title="Удалить">✕</button>
      `;
      li.querySelector('input').addEventListener('change', () => toggleTask(task.id));
      li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
      taskList.appendChild(li);
    });
  }

  const total  = tasks.length;
  const done   = tasks.filter(t => t.done).length;
  const active = total - done;
  statTotal.textContent  = total;
  statActive.textContent = active;
  statDone.textContent   = done;
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
clearDoneBtn.addEventListener('click', clearDone);
clearAllBtn.addEventListener('click', clearAll);

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

sortSelect.addEventListener('change', () => {
  currentSort = sortSelect.value;
  renderTasks();
});

renderTasks();