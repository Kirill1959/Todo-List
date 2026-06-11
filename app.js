// =============================
//  Данные
// =============================

// Загружаем задачи из localStorage, если они там есть
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Текущий фильтр: 'all' | 'active' | 'done'
let currentFilter = 'all';

// =============================
//  Ссылки на элементы страницы
// =============================

const taskInput   = document.getElementById('taskInput');
const addBtn      = document.getElementById('addBtn');
const taskList    = document.getElementById('taskList');
const taskCount   = document.getElementById('taskCount');
const clearDoneBtn = document.getElementById('clearDoneBtn');
const filterBtns  = document.querySelectorAll('.filter-btn');

// =============================
//  Сохранение в localStorage
// =============================

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// =============================
//  Добавить задачу
// =============================

function addTask() {
  const text = taskInput.value.trim();

  // Не добавляем пустую задачу
  if (!text) {
    taskInput.focus();
    return;
  }

  // Создаём объект задачи
  const task = {
    id: Date.now(),       // уникальный id — текущее время в мс
    text: text,
    done: false
  };

  tasks.push(task);
  saveTasks();
  renderTasks();

  // Очищаем поле ввода
  taskInput.value = '';
  taskInput.focus();
}

// =============================
//  Переключить выполнение
// =============================

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, done: !task.done } : task
  );
  saveTasks();
  renderTasks();
}

// =============================
//  Удалить задачу
// =============================

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

// =============================
//  Удалить все выполненные
// =============================

function clearDone() {
  tasks = tasks.filter(task => !task.done);
  saveTasks();
  renderTasks();
}

// =============================
//  Отрисовка списка
// =============================

function renderTasks() {
  // Фильтруем задачи по выбранной вкладке
  let filtered;
  if (currentFilter === 'active') {
    filtered = tasks.filter(t => !t.done);
  } else if (currentFilter === 'done') {
    filtered = tasks.filter(t => t.done);
  } else {
    filtered = tasks;
  }

  // Очищаем список
  taskList.innerHTML = '';

  // Если задач нет — показываем сообщение
  if (filtered.length === 0) {
    taskList.innerHTML = '<p class="empty-msg">Задач нет 🎉</p>';
  } else {
    // Рисуем каждую задачу
    filtered.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' done' : '');

      li.innerHTML = `
        <input type="checkbox" ${task.done ? 'checked' : ''} />
        <span class="task-text">${escapeHTML(task.text)}</span>
        <button class="delete-btn" title="Удалить">✕</button>
      `;

      // Чекбокс — отметить выполненной
      li.querySelector('input').addEventListener('change', () => toggleTask(task.id));

      // Кнопка удаления
      li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

      taskList.appendChild(li);
    });
  }

  // Обновляем счётчик активных задач
  const activeCount = tasks.filter(t => !t.done).length;
  taskCount.textContent = `${activeCount} ${pluralize(activeCount, 'задача', 'задачи', 'задач')} осталось`;
}

// =============================
//  Вспомогательные функции
// =============================

// Защита от XSS — экранируем HTML-символы в тексте задачи
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Склонение слова в зависимости от числа
function pluralize(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

// =============================
//  Обработчики событий
// =============================

// Кнопка "Добавить"
addBtn.addEventListener('click', addTask);

// Нажатие Enter в поле ввода
taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// Кнопки фильтра
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Убираем active у всех кнопок
    filterBtns.forEach(b => b.classList.remove('active'));
    // Добавляем active текущей
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Очистить выполненные
clearDoneBtn.addEventListener('click', clearDone);

// =============================
//  Первый запуск
// =============================

renderTasks();
