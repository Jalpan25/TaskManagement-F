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

  //  Only IDs 
  const [selectedAssignees, setSelectedAssignees] = useState(new Set());
  const [originalAssignees, setOriginalAssignees] = useState(new Set());

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load task + initial members
  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);

        const res = await getTaskForEditApi(taskId, 1, 10, "");

        setTask(res.data.task);
        setMembers(res.data.members);
        setTotalPages(res.data.pagination.totalPages);

        const assignedIds = res.data.members
          .filter((m) => m.assigned)
          .map((m) => m.id);

        setSelectedAssignees(new Set(assignedIds));
        setOriginalAssignees(new Set(assignedIds));
      } catch {
        setError("Failed to load task");
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [taskId]);

  // Load members on search/page
  useEffect(() => {
    if (loading) return;

    const loadMembers = async () => {
      try {
        setMembersLoading(true);
        const res = await getTaskForEditApi(taskId, page, 10, search);
        setMembers(res.data.members);
        setTotalPages(res.data.pagination.totalPages);
      } catch {
        setError("Failed to load members");
      } finally {
        setMembersLoading(false);
      }
    };

    loadMembers();
  }, [taskId, page, search, loading]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  // Toggle assignee
  const toggleAssignee = (id) => {
    setSelectedAssignees((prev) => {
      const updated = new Set(prev);
      updated.has(id) ? updated.delete(id) : updated.add(id);
      return updated;
    });
  };

  // Save task
  const handleUpdate = async () => {
    if (!task.title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const current = [...selectedAssignees];
      const original = [...originalAssignees];

      const addAssigneeIds = current.filter(
        (id) => !original.includes(id)
      );
      const removeAssigneeIds = original.filter(
        (id) => !current.includes(id)
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
    } finally {
      setSaving(false);
    }
  };

  const assignedCount = selectedAssignees.size;

  // UI states
  if (loading) {
    return (
      <MainLayout>
        <div className="py-20 text-center">Loading task...</div>
      </MainLayout>
    );
  }

  if (!task) {
    return (
      <MainLayout>
        <div className="text-red-600">Task not found</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
     <div className="max-w-4xl mx-auto px-4 py-6">

    <button
      onClick={() => navigate(-1)}
      className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
    >
      ← Back
    </button>
          {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-red-700 text-sm">
    {error}
  </div>
        )}
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">

          {/* Title */}
          <input
            type="text"
            value={task.title}
            onChange={(e) =>
              setTask({ ...task, title: e.target.value })
            }
            placeholder="Task title"
            className="border p-2 w-full"
          />

          {/* Description */}
          <textarea
            value={task.description || ""}
            onChange={(e) =>
              setTask({ ...task, description: e.target.value })
            }
            placeholder="Description"
           className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
             min-h-[90px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Status / Priority / Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={task.status}
              onChange={(e) =>
                setTask({ ...task, status: e.target.value })
              }
              className="border p-2"
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>

            <select
              value={task.priority}
              onChange={(e) =>
                setTask({ ...task, priority: e.target.value })
              }
              className="border p-2"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>

            <input
              type="date"
              value={task.dueDate?.slice(0, 10) || ""}
              onChange={(e) =>
                setTask({ ...task, dueDate: e.target.value })
              }
              className="border p-2"
            />
          </div>

          {/* Member search */}
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Members */}
          <div className="border border-gray-200 rounded-md p-3 max-h-56 overflow-y-auto space-y-2">
            {membersLoading ? (
              <p>Loading...</p>
            ) : members.length === 0 ? (
              <p>No members</p>
            ) : (
              members.map((m) => (
                <label key={m.id} className="flex items-center gap-3 text-sm px-2 py-1 rounded
             hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAssignees.has(m.id)}
                    onChange={() => toggleAssignee(m.id)}
                  />
                  {m.name}
                </label>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}

          {/* Actions */}
          <button
            onClick={handleUpdate}
            disabled={saving}
           className="w-full md:w-auto rounded-md bg-blue-600 px-6 py-2 text-sm font-medium
             text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default EditTaskPage;

// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import MainLayout from "../../layouts/MainLayout";
// import {
//   getTaskForEditApi,
//   updateTaskApi,
// } from "../../api/task.api";

// const EditTaskPage = () => {

//   const [page, setPage] = useState(1);
// const [totalPages, setTotalPages] = useState(1);
// const [search, setSearch] = useState("");
//   const { taskId } = useParams();
// // console.log(taskId);




//   const navigate = useNavigate();

//   const [task, setTask] = useState(null);
//   const [members, setMembers] = useState([]);

//   //  IMPORTANT: store original assigned members
//   const [originalAssignedIds, setOriginalAssignedIds] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // ============================
//   // Load task edit data
//   // ============================
// useEffect(() => {
//   const loadTask = async () => {
//     try {
//       setLoading(true);

//       const res = await getTaskForEditApi(
//         taskId,
//         page,
//         10,
//         search
//       );

//       setTask(res.data.task);
//       setMembers(res.data.members);
//       setTotalPages(res.data.pagination.totalPages);

//       // Store original assigned only ON FIRST PAGE LOAD
//       if (page === 1 && search === "") {
//         setOriginalAssignedIds(
//           res.data.members
//             .filter((m) => m.assigned)
//             .map((m) => m.id)
//         );
//       }
//     } catch {
//       setError("Failed to load task");
//     } finally {
//       setLoading(false);
//     }
//   };

//   loadTask();
// }, [taskId, page, search]);

// useEffect(() => {
//   setPage(1);
// }, [search, taskId]);


//   // ============================
//   // Toggle assignee
//   // ============================
//   const toggleAssignee = (id) => {
//     setMembers((prev) =>
//       prev.map((m) =>
//         m.id === id ? { ...m, assigned: !m.assigned } : m
//       )
//     );
//   };

//   // ============================
//   // Save changes (FIXED LOGIC)
//   // ============================
//   const handleUpdate = async () => {
//     try {
//       const currentAssignedIds = members
//         .filter((m) => m.assigned)
//         .map((m) => m.id);

//       //  DIFF LOGIC (THIS FIXES UNCHECK ISSUE)
//       const addAssigneeIds = currentAssignedIds.filter(
//         (id) => !originalAssignedIds.includes(id)
//       );

//       const removeAssigneeIds = originalAssignedIds.filter(
//         (id) => !currentAssignedIds.includes(id)
//       );

//       await updateTaskApi(taskId, {
//         title: task.title,
//         description: task.description,
//         status: task.status,
//         priority: task.priority,
//         dueDate: task.dueDate,
//         addAssigneeIds,
//         removeAssigneeIds,
//       });

//       navigate(-1);
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Failed to update task"
//       );
//     }
//   };

//   // ============================
//   // UI STATES
//   // ============================
//   if (loading) {
//     return (
//       <MainLayout>
//         <p>Loading task...</p>
//       </MainLayout>
//     );
//   }

//   if (!task) {
//     return (
//       <MainLayout>
//         <p className="text-red-600">Task not found</p>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout>
//       {/* Back */}
//       <button
//         onClick={() => navigate(-1)}
//         className="text-blue-600 mb-3 hover:underline"
//       >
//         ← Back
//       </button>

//       <h1 className="text-xl font-bold mb-4">Edit Task</h1>

//       {error && <p className="text-red-600 mb-3">{error}</p>}

//       {/* Title */}
//       <input
//         className="border p-2 w-full rounded mb-3"
//         placeholder="Task title"
//         value={task.title}
//         onChange={(e) =>
//           setTask({ ...task, title: e.target.value })
//         }
//       />

//       {/* Description */}
//       <textarea
//         className="border p-2 w-full rounded mb-3"
//         placeholder="Description"
//         value={task.description || ""}
//         onChange={(e) =>
//           setTask({ ...task, description: e.target.value })
//         }
//       />

//       {/* Status, Priority, Due Date */}
//       <div className="flex gap-3 mb-4">
//         <select
//           className="border p-2 rounded"
//           value={task.status}
//           onChange={(e) =>
//             setTask({ ...task, status: e.target.value })
//           }
//         >
//           <option value="TODO">TODO</option>
//           <option value="IN_PROGRESS">IN PROGRESS</option>
//           <option value="UNDER_REVIEW">UNDER REVIEW</option>
//           <option value="DONE">DONE</option>
//         </select>

//         <select
//           className="border p-2 rounded"
//           value={task.priority}
//           onChange={(e) =>
//             setTask({ ...task, priority: e.target.value })
//           }
//         >
//           <option value="LOW">LOW</option>
//           <option value="MEDIUM">MEDIUM</option>
//           <option value="HIGH">HIGH</option>
//         </select>

//         <input
//           type="date"
//           className="border p-2 rounded"
//           value={task.dueDate ? task.dueDate.slice(0, 10) : ""}
//           onChange={(e) =>
//             setTask({ ...task, dueDate: e.target.value })
//           }
//         />
//       </div>
//       <input
//   type="text"
//   placeholder="Search members..."
//   value={search}
//   onChange={(e) => setSearch(e.target.value)}
//   className="border p-2 w-full rounded mb-2"
// />


//       {/* Assignees */}
//       <div className="mb-4">
//         <p className="font-medium mb-2">Assign to:</p>
//         <div className="flex flex-wrap gap-3">
//           {members.map((m) => (
//             <label key={m.id} className="flex items-center gap-1">
//               <input
//                 type="checkbox"
//                 checked={m.assigned}
//                 onChange={() => toggleAssignee(m.id)}
//               />
//               {m.name}
//             </label>
//           ))}
//         </div>
//       </div>
//       <div className="flex items-center gap-3 mt-3">
//   <button
//     type="button"
//     disabled={page === 1}
//     onClick={() => setPage((p) => p - 1)}
//     className="px-3 py-1 border rounded disabled:opacity-50"
//   >
//     Prev
//   </button>

//   <span className="text-sm">
//     Page {page} of {totalPages}
//   </span>

//   <button
//     type="button"
//     disabled={page === totalPages}
//     onClick={() => setPage((p) => p + 1)}
//     className="px-3 py-1 border rounded disabled:opacity-50"
//   >
//     Next
//   </button>
// </div>


//       {/* Save */}
//       <button
//         onClick={handleUpdate}
//         className="bg-blue-600 text-white px-4 py-2 rounded"
//       >
//         Save Changes
//       </button>
//     </MainLayout>
//   );
// };

// export default EditTaskPage;
