// =============================
//  Данные
// =============================
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// =============================
//  Элементы страницы
// =============================
const taskInput    = document.getElementById('taskInput');
const addBtn       = document.getElementById('addBtn');
const taskList     = document.getElementById('taskList');
const taskCount    = document.getElementById('taskCount');
const clearDoneBtn = document.getElementById('clearDoneBtn');
const clearAllBtn  = document.getElementById('clearAllBtn');
const filterBtns   = document.querySelectorAll('.filter-btn');
const statTotal    = document.getElementById('statTotal');
const statActive   = document.getElementById('statActive');
const statDone     = document.getElementById('statDone');

// =============================
//  Сохранение
// =============================
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// =============================
//  Добавить задачу
// =============================
function addTask() {
  const text = taskInput.value.trim();
  if (!text) { taskInput.focus(); return; }

  tasks.push({ id: Date.now(), text, done: false });
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

// =============================
//  Переключить выполнение
// =============================
function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveTasks();
  renderTasks();
}

// =============================
//  Удалить задачу
// =============================
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// =============================
//  Очистить выполненные
// =============================
function clearDone() {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  renderTasks();
}

// =============================
//  Очистить всё
// =============================
function clearAll() {
  if (tasks.length === 0) return;
  if (confirm('Удалить все задачи?')) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
}

// =============================
//  Отрисовка
// =============================
function renderTasks() {
  // Фильтр
  let filtered;
  if (currentFilter === 'active') filtered = tasks.filter(t => !t.done);
  else if (currentFilter === 'done') filtered = tasks.filter(t => t.done);
  else filtered = tasks;

  // Список
  taskList.innerHTML = '';
  if (filtered.length === 0) {
    taskList.innerHTML = '<p class="empty-msg">Задач нет 🎉</p>';
  } else {
    filtered.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' done' : '');
      li.innerHTML = `
        <input type="checkbox" ${task.done ? 'checked' : ''} />
        <span class="task-text">${escapeHTML(task.text)}</span>
        <button class="delete-btn" title="Удалить">✕</button>
      `;
      li.querySelector('input').addEventListener('change', () => toggleTask(task.id));
      li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
      taskList.appendChild(li);
    });
  }

  // Статистика
  const total  = tasks.length;
  const done   = tasks.filter(t => t.done).length;
  const active = total - done;

  statTotal.textContent  = total;
  statActive.textContent = active;
  statDone.textContent   = done;

  taskCount.textContent = `${active} ${pluralize(active, 'задача', 'задачи', 'задач')} осталось`;
}

// =============================
//  Вспомогательные
// =============================
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pluralize(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m100 >= 11 && m100 <= 19) return many;
  if (m10 === 1) return one;
  if (m10 >= 2 && m10 <= 4) return few;
  return many;
}

// =============================
//  События
// =============================
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

// =============================
//  Старт
// =============================
renderTasks();