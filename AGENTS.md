# 🤖 AGENTS.md - Instructions for AI Coding Assistants

Welcome to the **Modern Todo App** codebase. This file contains strict guidelines, architectural rules, and commands that all AI agents (Cursor, Copilot, Opencode, etc.) must follow when operating within this repository. 

Our goal is to maintain a clean, purely functional, and highly polished UI using Glassmorphism aesthetics without relying on external UI frameworks (React, Vue, etc.).

---

## 🏗️ 1. Project Architecture & Paradigm

### Functional Programming (Strict Requirement)
This project strictly follows the **Functional Programming** paradigm for its core logic.
- **Pure Functions:** All state calculations must be done using pure functions. A function must return the same output given the same input and must not produce side effects.
- **Immutability:** Never mutate state directly (e.g., `state.tasks.push(...)` is forbidden). Always use immutable array methods like `.map()`, `.filter()`, and the spread operator (`...`).
- **No Classes:** Do not use ES6 classes or object-oriented patterns for data management. Use factory functions to create objects (e.g., `createTask()`).
- **Separation of Concerns:** 
  - Data logic (pure functions) must be completely separated from DOM manipulation.
  - Side effects (localStorage, DOM updates) must be isolated in specific functions (`saveState`, `render`).
- **Unidirectional Data Flow:** State updates must flow through the central `dispatch` function, which then triggers `saveState` and `render()`.

### Tech Stack
- **HTML5:** Semantic HTML, native `<template>` elements for components.
- **CSS3:** Custom CSS, CSS Variables for theming, Glassmorphism techniques (`backdrop-filter`). No Tailwind, no Bootstrap.
- **JavaScript (ES6+):** Vanilla JS, Functional Programming, LocalStorage API. No build tools (Webpack/Vite) required for the core app, but they can be added for testing.

---

## 🎨 2. Code Style & Conventions

### JavaScript (`assets/js/app.js`)
- **Naming Conventions:**
  - `camelCase` for variables and functions (e.g., `toggleTask`, `isModalOpen`).
  - `PascalCase` for factory functions or mock types.
  - `UPPER_SNAKE_CASE` for constants and action types (e.g., `STORAGE_KEY`, `TOGGLE_THEME`).
- **State Management:**
  - Keep the state shape flat and predictable: `{ tasks: [], theme: 'light', editingId: null }`.
- **DOM Queries:**
  - Cache all DOM queries in a central `DOM` object at the top of the file to avoid repetitive `document.getElementById` calls.
- **Event Listeners:**
  - Attach event listeners only once during initialization or strictly tie them to dynamically generated elements inside the `render` function using closures to pass data.

### CSS (`assets/css/style.css`)
- **CSS Variables:** All colors, spacing, and border-radii must be defined in `:root`. 
- **Theming:** Use the `[data-theme="dark"]` attribute selector to override CSS variables for Dark Mode. Never hardcode colors outside of variables if they are theme-dependent.
- **Glassmorphism:** Use `rgba()` with `backdrop-filter: blur(px)` for modals and cards to maintain the "Soft UI" aesthetic.
- **Units:** Use `px` for borders and small spacing, `rem` or `%` for layout where appropriate.
- **Structure:** Group CSS rules logically: Reset -> Variables -> Layout -> Components -> Responsive.

### HTML (`index.html`)
- **Semantics:** Use `<header>`, `<main>`, `<section>`, `<article>`, etc.
- **Accessibility:** Ensure all buttons have `aria-label` attributes if they only contain SVG icons. Use correct label bindings.
- **Templates:** Use `<template id="...">` for any repeating structures (like task cards) to keep JS clean from long string literals.

---

## 🚀 3. Commands & Scripts

Currently, this is a Vanilla JS project that runs directly in the browser. However, for agents tasked with writing tests or linting in the future, follow these conventions:

### Running the App
Since there is no build step, simply serve the root directory using any local server.
```bash
# Using python 3
python3 -m http.server 8000

# Using Node.js (http-server)
npx http-server . -p 8000
```

### Linting (Future implementation)
When adding a linter, ensure it enforces functional programming rules (e.g., `eslint-plugin-fp`).
```bash
# Run ESLint (when configured)
npm run lint
```

### Testing (Future implementation)
If instructed to write tests, use **Vitest** or **Jest**. Only write tests for the **pure functions** (Data logic) inside `app.js`. Do not write DOM tests unless explicitly requested.
```bash
# Run all tests
npm run test

# Run a single test file (Agent specific command)
# Usage: npm run test -- path/to/file.test.js
npx vitest run test/app.test.js
```

---

## 🤖 4. Cursor & Copilot Rules (.cursorrules)

If you are an agent reading this file, treat the following as strict `.cursorrules` or Copilot instructions:

1. **DO NOT** introduce state mutation. If asked to add a feature, you must return a new array/object.
   - *Bad:* `state.tasks[index].completed = true;`
   - *Good:* `state.tasks = state.tasks.map(t => t.id === id ? { ...t, completed: true } : t);`
2. **DO NOT** use inline CSS (`style="..."`) in JavaScript rendering. Toggle CSS classes instead.
3. **DO NOT** import external libraries (React, Lodash, jQuery). Use native ES6+ methods (`Array.prototype.reduce`, `Map`, `Set`).
4. **ALWAYS** respect the current UI aesthetic. If generating a new component, use the existing `--glass-bg`, `--surface-color`, and pastel color variables.
5. **ALWAYS** use `crypto.randomUUID()` or `Date.now().toString()` for unique IDs, do not rely on array indices.
6. When explaining code, be brief. When writing code, be complete but concise. Do not remove comments that serve as architectural documentation.
7. If asked to fix a bug in the view, check the `render()` function. If the bug is in the data, check the pure functions and the `dispatch()` payload.

---
*End of AGENTS.md. By reading this, you agree to adhere to the functional paradigm and design system established in this repository.*
