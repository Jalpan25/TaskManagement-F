import { useState } from "react";
import { createTaskApi } from "../../api/task.api";

const TaskForm = ({ projectId, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      return setError("Task title is required");
    }

    try {
      setLoading(true);
      await createTaskApi(projectId, {
        title: title.trim(),
        priority,
      });
      setTitle("");
      setPriority("MEDIUM");
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="flex gap-2">
        <input
          className="border p-2 flex-1 rounded"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 rounded disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
