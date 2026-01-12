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

  const [members, setMembers] = useState([]);// project members fetched from backend
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
 
  const [loading, setLoading] = useState(false); // submission in progress
  const [error, setError] = useState("");// error message for user feedback
  const [search, setSearch] = useState("");//searching fo user 
  const [totalPages, setTotalPages] = useState(1);



  useEffect(() => {
    setPage(1);
  }, [projectId, search]);


  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setMembersLoading(true);

        const res = await getMembersApi(projectId, page, 10, search);

        setMembers(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      } catch {
        setError("Failed to load project members");
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, [projectId, page, search]);



  useEffect(() => {
    setMembers([]);
    setPage(1);
    setHasMore(true);
  }, [projectId, search]);



  //  Fetch project members
  // useEffect(() => {
  //   const fetchMembers = async () => {
  //     try {
  //       const res = await getMembersApi(projectId);
  //       setMembers(res.data);
  //     } catch {
  //       setError("Failed to load project members");
  //     }
  //   };

  //   fetchMembers();
  // }, [projectId]);

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Task Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Task Title <span className="text-red-500">*</span>
        </label>
        <input
          className="border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          className="border border-gray-300 p-2.5 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition min-h-[100px] resize-y"
          placeholder="Add task description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      {/* Priority, Status, and Due Date Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      {/* Assignees Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assign Members
          {assigneeIds.length > 0 && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {assigneeIds.length} selected
            </span>
          )}
        </label>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search members by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 p-2.5 w-full rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        />

        {/* Members List */}
        <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
          {membersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Loading members...</span>
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
                    checked={assigneeIds.includes(m.id)}
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
              disabled={page === 1 || membersLoading}
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
              disabled={page === totalPages || membersLoading}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating Task...
            </span>
          ) : (
            "Create Task"
          )}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;








// import { useEffect, useState } from "react";
// import { createTaskApi } from "../../api/task.api";
// import { getMembersApi } from "../../api/projectMembers.api";

// const TaskForm = ({ projectId, onSuccess }) => {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [priority, setPriority] = useState("MEDIUM");
//   const [status, setStatus] = useState("TODO");
//   const [dueDate, setDueDate] = useState("");
//   const [assigneeIds, setAssigneeIds] = useState([]);// array of selected user IDs

//  const [members, setMembers] = useState([]);// project members fetched from backend
// const [page, setPage] = useState(1);
// const [hasMore, setHasMore] = useState(true);
// const [membersLoading, setMembersLoading] = useState(false);
 
//   const [loading, setLoading] = useState(false); // submission in progress
//   const [error, setError] = useState("");// error message for user feedback
//   const [search, setSearch] = useState("");//searching fo user 
//   const [totalPages, setTotalPages] = useState(1);



// useEffect(() => {
//   setPage(1);
// }, [projectId, search]);


// useEffect(() => {
//   const fetchMembers = async () => {
//     try {
//       setMembersLoading(true);

//       const res = await getMembersApi(projectId, page, 10, search);

//       setMembers(res.data.data);
//       setTotalPages(res.data.pagination.totalPages);
//     } catch {
//       setError("Failed to load project members");
//     } finally {
//       setMembersLoading(false);
//     }
//   };

//   fetchMembers();
// }, [projectId, page, search]);



// useEffect(() => {
//   setMembers([]);
//   setPage(1);
//   setHasMore(true);
// }, [projectId, search]);



//   //  Fetch project members
//   // useEffect(() => {
//   //   const fetchMembers = async () => {
//   //     try {
//   //       const res = await getMembersApi(projectId);
//   //       setMembers(res.data);
//   //     } catch {
//   //       setError("Failed to load project members");
//   //     }
//   //   };

//   //   fetchMembers();
//   // }, [projectId]);

//   const toggleAssignee = (userId) => {
//     setAssigneeIds((prev) =>
//       prev.includes(userId)
//         ? prev.filter((id) => id !== userId)
//         : [...prev, userId]
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!title.trim()) {
//       return setError("Task title is required");
//     }

//     try {
//       setLoading(true);

//       await createTaskApi(projectId, {
//         title: title.trim(),
//         description: description || undefined,
//         priority,
//         status,
//         dueDate: dueDate || undefined,
//         assigneeIds: assigneeIds.length ? assigneeIds : undefined,
//       });

//       // reset form
//       setTitle("");
//       setDescription("");
//       setPriority("MEDIUM");
//       setStatus("TODO");
//       setDueDate("");
//       setAssigneeIds([]);

//       onSuccess();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to create task");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="mb-4 space-y-3">
//       {error && <p className="text-red-600">{error}</p>}

//       <input
//         className="border p-2 w-full rounded"
//         placeholder="Task title"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//       />

//       <textarea
//         className="border p-2 w-full rounded"
//         placeholder="Description (optional)"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//       />

//       <div className="flex gap-2">
//         <select
//           className="border p-2 rounded"
//           value={priority}
//           onChange={(e) => setPriority(e.target.value)}
//         >
//           <option value="LOW">LOW</option>
//           <option value="MEDIUM">MEDIUM</option>
//           <option value="HIGH">HIGH</option>
//         </select>

//         <select
//           className="border p-2 rounded"
//           value={status}
//           onChange={(e) => setStatus(e.target.value)}
//         >
//           <option value="TODO">TODO</option>
//           <option value="IN_PROGRESS">IN PROGRESS</option>
//           <option value="UNDER_REVIEW">UNDER REVIEW</option>
//           <option value="DONE">DONE</option>
//         </select>

//         <input
//           type="date"
//           className="border p-2 rounded"
//           value={dueDate}
//           onChange={(e) => setDueDate(e.target.value)}
//         />
//       </div>

// <input
//   type="text"
//   placeholder="Search members..."
//   value={search}
//   onChange={(e) => setSearch(e.target.value)}
//   className="border p-2 w-full rounded mb-2"
// />
// {/* 👥 Members list */}
// <div className="flex flex-wrap gap-3 border p-2 rounded max-h-40 overflow-y-auto">
//   {members.length === 0 && !membersLoading && (
//     <p className="text-sm text-gray-500">No members found</p>
//   )}

//   {members.map((m) => (
//     <label key={m.id} className="flex items-center gap-1">
//       <input
//         type="checkbox"
//         checked={assigneeIds.includes(m.id)}
//         onChange={() => toggleAssignee(m.id)}
//       />
//       {m.name}
//     </label>
//   ))}
// </div>



//       {/* 👥 Assignee selection */}
// <div className="flex items-center gap-3 mt-2">
//   <button
//     type="button"
//     disabled={page === 1 || membersLoading}
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
//     disabled={page === totalPages || membersLoading}
//     onClick={() => setPage((p) => p + 1)}
//     className="px-3 py-1 border rounded disabled:opacity-50"
//   >
//     Next
//   </button>
// </div>



//       <button
//         type="submit"
//         disabled={loading}
//         className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
//       >
//         {loading ? "Creating..." : "Create Task"}
//       </button>
//     </form>
//   );
// };

// export default TaskForm;
