import { highlight } from "@ariakit/ui/utils/highlight.server";
import type { HighlightLanguage } from "@ariakit/ui/utils/highlight.server";
import { getFileIcon } from "../file-icons.ts";

const files: Record<string, string> = {
  "todo-app.tsx": `import { TodoForm } from "./todo-form.tsx";
import { TodoList } from "./todo-list.tsx";
import { useTodos } from "./use-todos.ts";
import "./todos.css";

export function TodoApp() {
  const { todos, addTodo, toggleTodo } = useTodos();
  return (
    <main className="todo-app">
      <TodoForm onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} />
    </main>
  );
}`,
  "todo-form.tsx": `import { useState } from "react";

export function TodoForm({ onAdd }) {
  const [title, setTitle] = useState("");
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onAdd(title);
        setTitle("");
      }}
    >
      <input
        aria-label="New task"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  );
}`,
  "todo-list.tsx": `import { TodoItem } from "./todo-item.tsx";

export function TodoList({ todos, onToggle }) {
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} />
      ))}
    </ul>
  );
}`,
  "todo-item.tsx": `export function TodoItem({ todo, onToggle }) {
  return (
    <li>
      <label>
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle(todo.id)}
        />
        {todo.title}
      </label>
    </li>
  );
}`,
  "use-todos.ts": `import { useState } from "react";
import type { Todo } from "./types.ts";

export function useTodos(initialTodos: Todo[] = []) {
  const [todos, setTodos] = useState(initialTodos);
  const addTodo = (title: string) => {
    const todo = { id: crypto.randomUUID(), title, done: false };
    setTodos((todos) => [...todos, todo]);
  };
  const toggleTodo = (id: string) => {
    setTodos((todos) =>
      todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
    );
  };
  return { todos, addTodo, toggleTodo };
}`,
  "types.ts": `export interface Todo {
  id: string;
  title: string;
  done: boolean;
}`,
  "todos.css": `.todo-app {
  display: grid;
  gap: 1rem;
}

.todo-list {
  display: grid;
  gap: 0.5rem;
  padding: 0;
  list-style: none;
}`,
  "todos.json": `[
  { "id": "1", "title": "Water the plants", "done": true },
  { "id": "2", "title": "Call the bank", "done": false }
]`,
};

function getLanguage(name: string): HighlightLanguage {
  const extension = name.split(".").pop();
  if (extension === "css") return "css";
  if (extension === "json") return "json";
  if (extension === "ts") return "ts";
  return "tsx";
}

export function load() {
  return {
    files: Object.entries(files).map(([name, code]) => ({
      name,
      icon: getFileIcon(name),
      ...highlight(code, getLanguage(name)),
    })),
  };
}
