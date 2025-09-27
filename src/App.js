import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5080/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [editCompleted, setEditCompleted] = useState(false);
  const pageSize = 5;

  const [filters, setFilters] = useState({
    priority: '',
    isCompleted: '',
    dueBefore: ''
  });

  useEffect(() => {
    fetchTasks();
  }, [page, filters]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams({
        page,
        pageSize,
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.isCompleted && { isCompleted: filters.isCompleted }),
        ...(filters.dueBefore && { dueBefore: filters.dueBefore })
      });

      const res = await fetch(`${API_URL}?${params}`);
      const data = await res.json();
      setTasks(data.items);
      setTotalItems(data.totalItems);
    } catch (err) {
      alert('Failed to fetch tasks');
    }
  };

  const addTask = async () => {
    if (!newTitle.trim()) return;

    const task = {
      title: newTitle,
      priority: newPriority,
      dueDate: newDueDate,
      isCompleted: false
    };

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      setNewTitle('');
      setNewDueDate('');
      fetchTasks();
    } catch {
      alert('Error adding task');
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch {
      alert('Error deleting task');
    }
  };

  const startEdit = (task) => {
  setEditId(task.id);
  setEditTitle(task.title);
  setEditCompleted(task.isCompleted);
};


  const updateTask = async () => {
  if (!editTitle.trim()) return;

  try {
    const response = await fetch(`${API_URL}/${editId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: editId,
        title: editTitle,
        isCompleted: editCompleted
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    // Only try to parse JSON if response has content
    const text = await response.text();
    const updatedTask = text ? JSON.parse(text) : null;

    if (updatedTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
    } else {
      // fallback: refetch tasks if server returns no body
      fetchTasks();
    }

    setEditId(null);
    setEditTitle('');
    setEditCompleted(false);

  } catch (error) {
    console.error(error);
    alert('Something went wrong while updating the task.');
  }
};


  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="App">
      <h1>Task Manager Api</h1>

      {/* New Task Form */}
      <div className="form">
        <input
          placeholder="Enter You Task Details"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
        />
        <button onClick={addTask}>Add</button>
      </div>

      {/* Filters */}
      <div className="filters">
        <select
          name="priority"
          onChange={(e) => {
            setFilters({ ...filters, priority: e.target.value });
            setPage(1);
          }}
        >
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          name="isCompleted"
          onChange={(e) => {
            setFilters({ ...filters, isCompleted: e.target.value });
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="true">Completed</option>
          <option value="false">Pending</option>
        </select>

        <input
          type="date"
          name="dueBefore"
          value={filters.dueBefore}
          onChange={(e) => {
            setFilters({ ...filters, dueBefore: e.target.value });
            setPage(1);
          }}
        />
      </div>

      {/* Task List */}
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {editId === task.id ? (
  <div className="flex items-center gap-2 flex-wrap">
    <input
      type="text"
      value={editTitle}
      onChange={(e) => setEditTitle(e.target.value)}
      className="border px-2 py-1 rounded"
    />
    <label className="flex items-center gap-1">
      <input
        type="checkbox"
        checked={editCompleted}
        onChange={() => setEditCompleted(!editCompleted)}
      />
      Completed
    </label>
    <button
      onClick={updateTask}
      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
    >
      Save
    </button>
    <button
      onClick={() => setEditId(null)}
      className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
    >
      Cancel
    </button>
  </div>
) : (

              <>
                <span>
                  <strong>{task.title}</strong> | {task.priority} | Due:{" "}
                  {task.dueDate?.split("T")[0] || "—"} |{" "}
                  {task.isCompleted ? "✅" : "❌"}
                </span>
                <button
                  onClick={() => {
                    setEditId(task.id);
                    setEditTitle(task.title);
                  }}
                >
                  Edit
                </button>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
