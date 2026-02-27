/**
 * Todo App Core Logic
 * Paradigm: Functional Programming
 */

// ==========================================
// 1. PURE FUNCTIONS (Data Logic)
// ==========================================

/**
 * Creates a new task object
 */
const createTask = (title, subtitle, priority, colorTheme) => ({
    id: crypto.randomUUID(),
    title,
    subtitle,
    priority,
    colorTheme,
    completed: false,
    createdAt: new Date().toISOString()
});

/**
 * Adds a new task to the task list immutably
 */
const addTask = (tasks, newTask) => [...tasks, newTask];

/**
 * Toggles the completion status of a task by ID immutably
 */
const toggleTask = (tasks, id) => 
    tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);

/**
 * Deletes a task by ID immutably
 */
const deleteTask = (tasks, id) => 
    tasks.filter(task => task.id !== id);

/**
 * Updates a task by ID immutably
 */
const updateTask = (tasks, id, updates) => 
    tasks.map(task => task.id === id ? { ...task, ...updates } : task);

/**
 * Toggles theme between 'light' and 'dark'
 */
const toggleTheme = (currentTheme) => currentTheme === 'light' ? 'dark' : 'light';

// ==========================================
// 2. STATE MANAGEMENT & SIDE EFFECTS
// ==========================================

const STORAGE_KEY = 'todo_app_state';

// Initial default state
const defaultState = {
    tasks: [
        {
            id: '1',
            title: '3D Character Cute Robot',
            subtitle: 'UI Design',
            priority: 'Important',
            colorTheme: 'purple',
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            title: 'Illustration for Caraso',
            subtitle: 'Marketing',
            priority: 'Normal',
            colorTheme: 'blue',
            completed: false,
            createdAt: new Date().toISOString()
        }
    ],
    theme: 'light',
    editingId: null // null if adding, string ID if editing
};

/**
 * Loads state from localStorage or returns default
 */
const loadState = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : defaultState;
    } catch (e) {
        console.error("Error loading state", e);
        return defaultState;
    }
};

/**
 * Saves state to localStorage
 */
const saveState = (state) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Error saving state", e);
    }
};

// Global mutable state container (Only modified through dispatch)
let state = loadState();
let pendingDeleteId = null; // Stores the ID of the task to be deleted

// ==========================================
// 3. DOM RENDERER (View)
// ==========================================

const DOM = {
    root: document.documentElement,
    themeBtn: document.getElementById('themeToggleBtn'),
    sunIcon: document.querySelector('.sun-icon'),
    moonIcon: document.querySelector('.moon-icon'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    modal: document.getElementById('taskModal'),
    modalTitle: document.getElementById('modalTitle'),
    form: document.getElementById('taskForm'),
    cancelBtn: document.getElementById('cancelBtn'),
    taskList: document.getElementById('taskList'),
    taskTemplate: document.getElementById('taskTemplate'),
    totalTasksCount: document.getElementById('totalTasksCount'),
    inProgressCount: document.getElementById('inProgressCount'),
    pendingCountHeader: document.getElementById('pendingCountHeader'),
    
    // Inputs
    titleInp: document.getElementById('taskTitle'),
    subtitleInp: document.getElementById('taskSubtitle'),
    priorityInp: document.getElementById('taskPriority'),
    colorInp: document.getElementById('taskColor'),
    
    // Delete Modal
    deleteModal: document.getElementById('deleteModal'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    
    // Toast
    toastContainer: document.getElementById('toastContainer')
};

/**
 * Toast Notification System
 */
const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icons based on type
    const icons = {
        success: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        delete: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        edit: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>'
    };

    toast.innerHTML = `
        ${icons[type] || icons.success}
        <span>${message}</span>
    `;

    DOM.toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

/**
 * Formats a date string to "DD MMM YYYY"
 */
const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/**
 * Calculates statistics using reduce and filter
 */
const calculateStats = (tasks) => {
    const total = tasks.length;
    const inProgress = tasks.filter(t => !t.completed).length;
    return { total, inProgress };
};

/**
 * Main render function. Updates the DOM based on the current state.
 */
const render = (currentState) => {
    // 1. Render Theme
    DOM.root.setAttribute('data-theme', currentState.theme);
    if (currentState.theme === 'dark') {
        DOM.sunIcon.style.display = 'block';
        DOM.moonIcon.style.display = 'none';
    } else {
        DOM.sunIcon.style.display = 'none';
        DOM.moonIcon.style.display = 'block';
    }

    // 2. Render Stats
    const stats = calculateStats(currentState.tasks);
    DOM.totalTasksCount.innerHTML = `${stats.total} <span>Tasks</span>`;
    DOM.inProgressCount.innerHTML = `${stats.inProgress} <span>Tasks</span>`;
    DOM.pendingCountHeader.textContent = stats.inProgress;

    // 3. Render Task List
    DOM.taskList.innerHTML = '';
    
    currentState.tasks.forEach(task => {
        const clone = DOM.taskTemplate.content.cloneNode(true);
        const li = clone.querySelector('li');
        
        // Add styling classes based on data
        li.classList.add(`theme-${task.colorTheme}`);
        if (task.completed) li.classList.add('completed');
        
        // Populate content
        li.querySelector('.task-title').textContent = task.title;
        li.querySelector('.task-subtitle').textContent = task.subtitle || '';
        
        const priorityBadge = li.querySelector('.priority-badge');
        priorityBadge.textContent = task.priority;
        priorityBadge.classList.add(task.priority);
        
        li.querySelector('.date-badge').textContent = formatDate(task.createdAt);

        // Attach Event Listeners to rendered buttons
        const completeBtn = li.querySelector('.complete-btn');
        completeBtn.addEventListener('click', () => dispatch({ type: 'TOGGLE_TASK', payload: task.id }));
        
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => dispatch({ type: 'REQUEST_DELETE_TASK', payload: task.id }));
        
        const editBtn = li.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            dispatch({ type: 'OPEN_EDIT_MODAL', payload: task });
        });

        DOM.taskList.appendChild(clone);
    });
};

/**
 * Modal Controller
 */
const toggleModal = (isOpen, taskToEdit = null) => {
    // Reset validation state
    DOM.titleInp.parentElement.classList.remove('error');
    
    if (isOpen) {
        DOM.modal.classList.remove('hidden');
        if (taskToEdit) {
            DOM.modalTitle.textContent = 'Edit Task';
            DOM.titleInp.value = taskToEdit.title;
            DOM.subtitleInp.value = taskToEdit.subtitle;
            DOM.priorityInp.value = taskToEdit.priority;
            DOM.colorInp.value = taskToEdit.colorTheme;
        } else {
            DOM.modalTitle.textContent = 'New Task';
            DOM.form.reset();
        }
    } else {
        DOM.modal.classList.add('hidden');
    }
};

// ==========================================
// 4. DISPATCHER (Controller)
// ==========================================

/**
 * Handles all state transitions centrally to maintain unidirectional data flow
 */
const dispatch = (action) => {
    switch (action.type) {
        case 'ADD_TASK':
            state = { ...state, tasks: addTask(state.tasks, action.payload), editingId: null };
            toggleModal(false);
            showToast('Task created successfully', 'success');
            break;
        case 'UPDATE_TASK':
            state = { ...state, tasks: updateTask(state.tasks, state.editingId, action.payload), editingId: null };
            toggleModal(false);
            showToast('Task updated successfully', 'edit');
            break;
        case 'TOGGLE_TASK':
            state = { ...state, tasks: toggleTask(state.tasks, action.payload) };
            
            // Determine if completed or uncompleted for toast
            const toggledTask = state.tasks.find(t => t.id === action.payload);
            if (toggledTask) {
                showToast(`Task marked as ${toggledTask.completed ? 'completed' : 'pending'}`, 'success');
            }
            break;
        case 'REQUEST_DELETE_TASK':
            pendingDeleteId = action.payload;
            DOM.deleteModal.classList.remove('hidden');
            return; // No need to save/render
        case 'CANCEL_DELETE_TASK':
            pendingDeleteId = null;
            DOM.deleteModal.classList.add('hidden');
            return; // No need to save/render
        case 'CONFIRM_DELETE_TASK':
            if (!pendingDeleteId) return;
            state = { ...state, tasks: deleteTask(state.tasks, pendingDeleteId) };
            pendingDeleteId = null;
            DOM.deleteModal.classList.add('hidden');
            showToast('Task deleted', 'delete');
            break;
        case 'TOGGLE_THEME':
            state = { ...state, theme: toggleTheme(state.theme) };
            break;
        case 'OPEN_ADD_MODAL':
            state = { ...state, editingId: null };
            toggleModal(true);
            return; // No need to save/render just for modal open
        case 'OPEN_EDIT_MODAL':
            state = { ...state, editingId: action.payload.id };
            toggleModal(true, action.payload);
            return;
        case 'CLOSE_MODAL':
            state = { ...state, editingId: null };
            toggleModal(false);
            return;
    }

    saveState(state);
    render(state);
};

// ==========================================
// 5. EVENT LISTENERS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initial Render
    render(state);

    // Theme Toggle
    DOM.themeBtn.addEventListener('click', () => dispatch({ type: 'TOGGLE_THEME' }));

    // Modal Triggers
    DOM.addTaskBtn.addEventListener('click', () => dispatch({ type: 'OPEN_ADD_MODAL' }));
    DOM.cancelBtn.addEventListener('click', () => dispatch({ type: 'CLOSE_MODAL' }));
    
    // Delete Modal Triggers
    DOM.cancelDeleteBtn.addEventListener('click', () => dispatch({ type: 'CANCEL_DELETE_TASK' }));
    DOM.confirmDeleteBtn.addEventListener('click', () => dispatch({ type: 'CONFIRM_DELETE_TASK' }));
    
    // Close modal on outside click
    DOM.modal.addEventListener('click', (e) => {
        if (e.target === DOM.modal) dispatch({ type: 'CLOSE_MODAL' });
    });
    DOM.deleteModal.addEventListener('click', (e) => {
        if (e.target === DOM.deleteModal) dispatch({ type: 'CANCEL_DELETE_TASK' });
    });

    // Form Submission
    DOM.form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = DOM.titleInp.value.trim();
        const subtitle = DOM.subtitleInp.value.trim();
        const priority = DOM.priorityInp.value;
        const color = DOM.colorInp.value;

        // Validation
        if (!title) {
            DOM.titleInp.parentElement.classList.add('error');
            return;
        }
        
        DOM.titleInp.parentElement.classList.remove('error');

        if (state.editingId) {
            dispatch({ type: 'UPDATE_TASK', payload: { title, subtitle, priority, colorTheme: color } });
        } else {
            const newTask = createTask(title, subtitle, priority, color);
            dispatch({ type: 'ADD_TASK', payload: newTask });
        }
    });
});
