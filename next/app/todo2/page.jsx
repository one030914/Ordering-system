"use client";
import { useEffect, useState } from "react";

export default function TodoPage() {
    const [todos, setTodos] = useState([]);
    const [title, setTitle] = useState("");

    // 取得初始資料
    useEffect(() => {
        fetch("/api/todo")
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text(); // 或許是錯誤訊息
                    throw new Error(`伺服器錯誤：${res.status} - ${text}`);
                }
                return res.json();
            })
            .then((data) => setTodos(data))
            .catch((err) => {
                console.error("抓資料失敗", err);
            });
    }, []);

    // 新增 todo
    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const res = await fetch("/api/todo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title }),
        });

        const newTodo = await res.json();
        setTodos((prevTodos) => [...prevTodos, newTodo]);
        setTitle("");
    };

    // 切換完成狀態
    const handleToggleTodo = async (e, id, isDone) => {
        e.preventDefault();

        await fetch(`/api/todo/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ isDone: !isDone }),
        });

        const newTodos = todos.map((todo) =>
            todo.id !== id ? todo : { ...todo, isDone: !isDone }
        );

        setTodos(newTodos);
    };

    // 刪除 todo
    const handleDeleteTodo = async (e, id) => {
        e.preventDefault();
        await fetch(`/api/todo/${id}`, {
            method: "DELETE",
        });

        const newTodos = todos.filter((todo) => todo.id !== id);
        setTodos(newTodos);
    };

    return (
        <main className="container mx-auto px-4">
            <h1 className="text-2xl font-bold text-center my-6">Todo List</h1>

            {/* 輸入區 */}
            <form className="mb-4" onSubmit={handleAddTodo}>
                <input
                    type="text"
                    name="title"
                    placeholder="Add a new todo"
                    className="shadow appearance-none border rounded py-2 px-3 mr-2 text-black"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <button
                    type="submit"
                    className="bg-gray-700 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Add Todo
                </button>
            </form>

            {/* Todo 列表 */}
            <ul>
                {todos.map((todo) => (
                    <li
                        key={todo.id}
                        className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded shadow my-2"
                    >
                        <span
                            className={`${
                                todo.isDone ? "line-through text-gray-500" : "text-black"
                            } text-lg`}
                        >
                            {todo.title}
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={(e) => handleToggleTodo(e, todo.id, todo.isDone)}
                            >
                                {todo.isDone ? "Undo" : "Done"}
                            </button>

                            <button
                                type="button"
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                onClick={(e) => handleDeleteTodo(e, todo.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    );
}
