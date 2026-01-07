import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
  getProjectTasksApi,
  deleteTaskApi,
  updateTaskApi,
} from "../../api/task.api";
import TaskForm from "./TaskForm";

const UserProjectTasks = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [search, setSearch] = useState("");

  // Edit state
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState("MEDIUM");

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await getProjectTasksApi(projectId);
      setTasks(res.data);
    } catch {
      console.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  // On project change
  useEffect(() => {
    fetchTasks();
    setSearch(""); // clear search on project switch
  }, [projectId]);

  // Delete task
  const handleDelete = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    await deleteTaskApi(taskId);
    fetchTasks();
  };

  // Start editing
  const startEdit = (task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditPriority(task.priority);
  };

  // Update task
  const handleUpdate = async () => {
    if (!editTitle.trim()) return;

    await updateTaskApi(editingTaskId, {
      title: editTitle.trim(),
      priority: editPriority,
    });

    setEditingTaskId(null);
    fetchTasks();
  };

  // Filter tasks (title + priority)
  const filteredTasks = tasks.filter((task) => {
    const q = search.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      task.priority.toLowerCase().includes(q)
    );
  });

  return (
    <MainLayout>
      {/* Back */}
      <button
        onClick={() => navigate("/dashboard")}
        className="text-blue-600 mb-3 hover:underline"
      >
        ← Back to Projects
      </button>

      <h1 className="text-xl font-bold mb-4">Project Tasks</h1>

      {/* Create Task */}
      <TaskForm projectId={projectId} onSuccess={fetchTasks} />

      {/* Search */}
      <input
        type="text"
        placeholder="Search tasks by title or priority..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      {/* Task List */}
      {loading ? (
        <p>Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <p>No matching tasks</p>
      ) : (
        <ul className="space-y-2">
          {filteredTasks.map((t) => (
            <li
              key={t.id}
              className="border p-3 rounded flex justify-between items-center"
            >
              {editingTaskId === t.id ? (
                <div className="flex gap-2 flex-1">
                  <input
                    className="border p-1 flex-1 rounded"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />

                  <select
                    className="border p-1 rounded"
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              ) : (
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-sm text-gray-500">
                    {t.status} • {t.priority}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                {editingTaskId === t.id ? (
                  <>
                    <button
                      onClick={handleUpdate}
                      className="text-green-600 hover:underline"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingTaskId(null)}
                      className="text-gray-600 hover:underline"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(t)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </MainLayout>
  );
};

export default UserProjectTasks;
