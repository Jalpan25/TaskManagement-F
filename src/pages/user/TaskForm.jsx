import { useEffect, useState } from "react";
import { createTaskApi } from "../../api/task.api";
import { getMembersApi } from "../../api/projectMembers.api";

const TaskForm = ({ projectId, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [status, setStatus] = useState("TODO");
  const [dueDate, setDueDate] = useState("");
  const [assigneeIds, setAssigneeIds] = useState([]);// array of selected user IDs

  const [members, setMembers] = useState([]); // project members fetched from backend
  const [loading, setLoading] = useState(false); // submission in progress
  const [error, setError] = useState("");// error message for user feedback

  // 🔄 Fetch project members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await getMembersApi(projectId);
        setMembers(res.data);
      } catch {
        setError("Failed to load project members");
      }
    };

    fetchMembers();
  }, [projectId]);

  const toggleAssignee = (userId) => {
    setAssigneeIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

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
        description: description || undefined,
        priority,
        status,
        dueDate: dueDate || undefined,
        assigneeIds: assigneeIds.length ? assigneeIds : undefined,
      });

      // reset form
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setStatus("TODO");
      setDueDate("");
      setAssigneeIds([]);

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-3">
      {error && <p className="text-red-600">{error}</p>}

      <input
        className="border p-2 w-full rounded"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="border p-2 w-full rounded"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex gap-2">
        <select
          className="border p-2 rounded"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>

        <select
          className="border p-2 rounded"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="UNDER_REVIEW">UNDER REVIEW</option>
          <option value="DONE">DONE</option>
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      {/* 👥 Assignee selection */}
      <div>
        <p className="font-medium mb-1">Assign to:</p>
        <div className="flex flex-wrap gap-3">
          {members.map((m) => (
            <label key={m.id} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={assigneeIds.includes(m.id)}
                onChange={() => toggleAssignee(m.id)}
              />
              {m.name}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
};

export default TaskForm;
