import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
  getTaskForEditApi,
  updateTaskApi,
} from "../../api/task.api";

const EditTaskPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);

  // 🔹 IMPORTANT: store original assigned members
  const [originalAssignedIds, setOriginalAssignedIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================
  // Load task edit data
  // ============================
  useEffect(() => {
    const loadTask = async () => {
      try {
        const res = await getTaskForEditApi(taskId);

        setTask(res.data.task);
        setMembers(res.data.members);

        // 👇 Save original assigned members
        setOriginalAssignedIds(
          res.data.members
            .filter((m) => m.assigned)
            .map((m) => m.id)
        );
      } catch {
        setError("Failed to load task");
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [taskId]);

  // ============================
  // Toggle assignee
  // ============================
  const toggleAssignee = (id) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, assigned: !m.assigned } : m
      )
    );
  };

  // ============================
  // Save changes (FIXED LOGIC)
  // ============================
  const handleUpdate = async () => {
    try {
      const currentAssignedIds = members
        .filter((m) => m.assigned)
        .map((m) => m.id);

      // 🔥 DIFF LOGIC (THIS FIXES UNCHECK ISSUE)
      const addAssigneeIds = currentAssignedIds.filter(
        (id) => !originalAssignedIds.includes(id)
      );

      const removeAssigneeIds = originalAssignedIds.filter(
        (id) => !currentAssignedIds.includes(id)
      );

      await updateTaskApi(taskId, {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        addAssigneeIds,
        removeAssigneeIds,
      });

      navigate(-1);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update task"
      );
    }
  };

  // ============================
  // UI STATES
  // ============================
  if (loading) {
    return (
      <MainLayout>
        <p>Loading task...</p>
      </MainLayout>
    );
  }

  if (!task) {
    return (
      <MainLayout>
        <p className="text-red-600">Task not found</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 mb-3 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-xl font-bold mb-4">Edit Task</h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      {/* Title */}
      <input
        className="border p-2 w-full rounded mb-3"
        placeholder="Task title"
        value={task.title}
        onChange={(e) =>
          setTask({ ...task, title: e.target.value })
        }
      />

      {/* Description */}
      <textarea
        className="border p-2 w-full rounded mb-3"
        placeholder="Description"
        value={task.description || ""}
        onChange={(e) =>
          setTask({ ...task, description: e.target.value })
        }
      />

      {/* Status, Priority, Due Date */}
      <div className="flex gap-3 mb-4">
        <select
          className="border p-2 rounded"
          value={task.status}
          onChange={(e) =>
            setTask({ ...task, status: e.target.value })
          }
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="UNDER_REVIEW">UNDER REVIEW</option>
          <option value="DONE">DONE</option>
        </select>

        <select
          className="border p-2 rounded"
          value={task.priority}
          onChange={(e) =>
            setTask({ ...task, priority: e.target.value })
          }
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={task.dueDate ? task.dueDate.slice(0, 10) : ""}
          onChange={(e) =>
            setTask({ ...task, dueDate: e.target.value })
          }
        />
      </div>

      {/* Assignees */}
      <div className="mb-4">
        <p className="font-medium mb-2">Assign to:</p>
        <div className="flex flex-wrap gap-3">
          {members.map((m) => (
            <label key={m.id} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={m.assigned}
                onChange={() => toggleAssignee(m.id)}
              />
              {m.name}
            </label>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleUpdate}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Changes
      </button>
    </MainLayout>
  );
};

export default EditTaskPage;
