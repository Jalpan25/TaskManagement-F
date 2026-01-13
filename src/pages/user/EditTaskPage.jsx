import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
  getTaskForEditApi,
  updateTaskApi,
} from "../../api/task.api";

const EditTaskPage = () => {

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { taskId } = useParams();
// console.log(taskId);

  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);

  //  IMPORTANT: store original assigned members
  const [originalAssignedIds, setOriginalAssignedIds] = useState([]);
  
  //  Track current assigned state across re-renders
  const currentAssignedRef = useRef(new Map());
  
  //  Ref to maintain focus on search input
  const searchInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ============================
  // Debounce search input
  // ============================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [search]);

  // ============================
  // Load task edit data (initial load only)
  // ============================
  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);

        const res = await getTaskForEditApi(
          taskId,
          1,
          10,
          ""
        );

        setTask(res.data.task);
        
        const newMembers = res.data.members.map(member => {
          currentAssignedRef.current.set(member.id, member.assigned);
          return member;
        });
        
        setMembers(newMembers);
        setTotalPages(res.data.pagination.totalPages);

        setOriginalAssignedIds(
          newMembers
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
  // Load members when search/page changes
  // ============================
  useEffect(() => {
    // Skip initial load
    if (loading) return;
    
    const loadMembers = async () => {
      try {
        setMembersLoading(true);

        const res = await getTaskForEditApi(
          taskId,
          page,
          10,
          debouncedSearch
        );
        
        // Preserve the assigned state using the ref
        const newMembers = res.data.members.map(newMember => {
          const hasCurrentState = currentAssignedRef.current.has(newMember.id);
          
          return {
            ...newMember,
            assigned: hasCurrentState 
              ? currentAssignedRef.current.get(newMember.id) 
              : newMember.assigned
          };
        });
        
        // Update the ref with current state
        newMembers.forEach(member => {
          currentAssignedRef.current.set(member.id, member.assigned);
        });
        
        setMembers(newMembers);
        setTotalPages(res.data.pagination.totalPages);
      } catch {
        setError("Failed to load members");
      } finally {
        setMembersLoading(false);
      }
    };

    loadMembers();
  }, [taskId, page, debouncedSearch, loading]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, taskId]);


  // ============================
  // Toggle assignee
  // ============================
  const toggleAssignee = (id) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newAssignedState = !m.assigned;
          // Update the ref to track this change
          currentAssignedRef.current.set(id, newAssignedState);
          return { ...m, assigned: newAssignedState };
        }
        return m;
      })
    );
  };

  // ============================
  // Save changes (FIXED LOGIC)
  // ============================
  const handleUpdate = async () => {
    //console.log("handleUpdate called");
    
    if (!task.title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Get ALL currently assigned members from the ref (not just current page)
      const currentAssignedIds = Array.from(currentAssignedRef.current.entries())
        .filter(([id, assigned]) => assigned)
        .map(([id]) => id);

      //console.log("Original assigned IDs:", originalAssignedIds);
     // console.log("Current assigned IDs:", currentAssignedIds);

      //  DIFF LOGIC (THIS FIXES UNCHECK ISSUE)
      const addAssigneeIds = currentAssignedIds.filter(
        (id) => !originalAssignedIds.includes(id)
      );

      const removeAssigneeIds = originalAssignedIds.filter(
        (id) => !currentAssignedIds.includes(id)
      );

     // console.log("Add assignees:", addAssigneeIds);
     // console.log("Remove assignees:", removeAssigneeIds);

      const payload = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        addAssigneeIds,
        removeAssigneeIds,
      };

      //console.log("Payload to send:", payload);
      //console.log("Calling updateTaskApi with taskId:", taskId);

      const response = await updateTaskApi(taskId, payload);
      
      //console.log("API response:", response);

      navigate(-1);
    } catch (err) {
      console.error("Error updating task:", err);
      setError(
        err.response?.data?.message || "Failed to update task"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // Get assigned count
  // ============================
  const assignedCount = members.filter((m) => m.assigned).length;

  // ============================
  // UI STATES
  // ============================
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading task...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!task) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Task not found
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              name="taskTitle"
              type="text"
              className="border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Enter task title"
              value={task.title}
              onChange={(e) =>
                setTask({ ...task, title: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="task-description"
              name="taskDescription"
              className="border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition min-h-[120px] resize-y"
              placeholder="Add task description (optional)"
              value={task.description || ""}
              onChange={(e) =>
                setTask({ ...task, description: e.target.value })
              }
              rows={5}
            />
          </div>

          {/* Status, Priority, Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label htmlFor="task-status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="task-status"
                name="taskStatus"
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                value={task.status}
                onChange={(e) =>
                  setTask({ ...task, status: e.target.value })
                }
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="task-priority"
                name="taskPriority"
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                value={task.priority}
                onChange={(e) =>
                  setTask({ ...task, priority: e.target.value })
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                id="task-due-date"
                name="taskDueDate"
                type="date"
                className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={task.dueDate ? task.dueDate.slice(0, 10) : ""}
                onChange={(e) =>
                  setTask({ ...task, dueDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Assignees Section */}
          <div>
            <label htmlFor="member-search" className="block text-sm font-medium text-gray-700 mb-2">
              Assign Members
              {assignedCount > 0 && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {assignedCount} assigned
                </span>
              )}
            </label>

            {/* Search Input */}
            <input
              ref={searchInputRef}
              id="member-search"
              name="memberSearch"
              type="text"
              placeholder="Search members by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 p-2.5 w-full rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />

            {/* Members List */}
            <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 max-h-64 overflow-y-auto">
              {membersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Searching...</span>
                </div>
              ) : members.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  {search ? "No members found matching your search" : "No members available"}
                </p>
              ) : (
                <div className="space-y-2">
                  {members.map((m) => (
                    <label
                      key={m.id}
                      className="flex items-center gap-2 p-2 hover:bg-white rounded-md cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={m.assigned}
                        onChange={() => toggleAssignee(m.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{m.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  ← Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                </span>

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving Changes...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
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

//   // 🔹 IMPORTANT: store original assigned members
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

//       // 🔥 DIFF LOGIC (THIS FIXES UNCHECK ISSUE)
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
