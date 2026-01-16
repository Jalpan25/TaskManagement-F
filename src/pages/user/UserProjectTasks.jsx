import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
  getProjectTasksApi,
  deleteTaskApi,
} from "../../api/task.api";


const UserProjectTasks = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  //  Data
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);

  //  UI state
  const [loading, setLoading] = useState(true);

  //  Pagination
  const [page, setPage] = useState(1);
  const limit = 5;

  //  Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  //  Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);

      const res = await getProjectTasksApi(projectId, {
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
      });

      setTasks(res.data.data);              
      setPagination(res.data.pagination);   

    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  //  Re-fetch when params change
  useEffect(() => {
    fetchTasks();
  }, [projectId, page, search, status, priority]);

  //  Delete task
  const handleDelete = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    await deleteTaskApi(taskId);
    fetchTasks();
  };

//   const isOverdue = (dueDate, status) => {
//   if (!dueDate || status === "DONE") return false;

//   const today = new Date();
//   today.setHours(0, 0, 0, 0); // normalize today

//   const taskDueDate = new Date(dueDate);
//   taskDueDate.setHours(0, 0, 0, 0);

//   return taskDueDate < today;
// };


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
      <button
  onClick={() => navigate(`/projects/${projectId}/tasks/create`)}
  className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
>
  + Create Task
</button>


      {/*  Filters */}
      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded flex-1"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => {
            setPage(1);       // reset page on search
            setSearch(e.target.value);
          }}
        />

        <select
          className="border p-2 rounded"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All Status</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="UNDER_REVIEW">UNDER REVIEW</option>
          <option value="DONE">DONE</option>
        </select>

        <select
          className="border p-2 rounded"
          value={priority}
          onChange={(e) => {
            setPage(1);
            setPriority(e.target.value);
          }}
        >
          <option value="">All Priority</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </div>

      {/* Task List */}
      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="border p-3 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-sm text-gray-500">
                  {t.status} • {t.priority}
                </p>
              </div>

<div className="flex gap-3">
  <button
    onClick={() => navigate(`/tasks/${t.id}/edit`)}
    className="text-blue-600 hover:underline"
  >
    Edit
  </button>

  <button
    onClick={() => navigate(`/tasks/${t.id}/comments`)}
    className="text-green-600 hover:underline"
  >
    Comments
  </button>

  {/*  NEW: Task Logs */}
  <button
    onClick={() => navigate(`/tasks/${t.id}/logs`)}
    className="text-purple-600 hover:underline"
  >
    Logs
  </button>

  <button
    onClick={() => handleDelete(t.id)}
    className="text-red-600 hover:underline"
  >
    Delete
  </button>
</div>

            </li>
          ))}
        </ul>
      )}

      {/*  Pagination */}
      {pagination && (
        <div className="flex items-center gap-4 mt-4">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </MainLayout>
  );
};

export default UserProjectTasks;
