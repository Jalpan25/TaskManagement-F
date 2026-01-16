import { useEffect, useState } from "react";
import {
  addMembersApi,
  getAvailableUsersApi,
  removeMemberApi,
} from "../../api/projectMembers.api";

const ProjectMembers = ({ projectId }) => {
  const [assigned, setAssigned] = useState([]);
  const [available, setAvailable] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (pID) => {
    try {
      setLoading(true);
      const membersRes = await getAvailableUsersApi(pID);
      setAssigned(membersRes.data.assigned);
      setAvailable(membersRes.data.available);
    } catch (err) {
      console.error("Failed to load project members", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchData(projectId);
    }
  }, [projectId]);

  const toggleSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;

    const payload = selectedUsers.map((id) => ({ userId: id }));
    await addMembersApi(projectId, payload);
    setSelectedUsers([]);
    fetchData(projectId);
  };
  const handleRemove = async (user) => {
    const message = user.hasAssignedTasks
      ? "This user is already assigned to tasks in this project.\n\nAre you sure you want to remove them from the project?"
      : "Remove this member from the project?";

    if (!window.confirm(message)) return;

    try {
      await removeMemberApi(projectId, user.id);
      fetchData(projectId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  if (loading) return <p>Loading members...</p>;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-3">Project Members</h2>

      {/* Assigned Members */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Assigned Members</h3>

        {assigned.length === 0 ? (
          <p className="text-gray-500">No members assigned</p>
        ) : (
          <ul className="border rounded">
            {assigned.map((user) => (
              <li
                key={user.id}
                className="flex justify-between items-center p-2 border-b"
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>

                  {user.hasAssignedTasks && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠ Assigned to tasks
                    </p>
                  )}
                </div>

                <button
                  className={`hover:underline ${
                    user.hasAssignedTasks
                      ? "text-orange-600"
                      : "text-red-600"
                  }`}
                  onClick={() => handleRemove(user)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Available Users */}
      <div>
        <h3 className="font-medium mb-2">Add Members</h3>

        {available.length === 0 ? (
          <p className="text-gray-500">No available users</p>
        ) : (
          <div className="border rounded p-3">
            {available.map((u) => (
              <label key={u.id} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u.id)}
                  onChange={() => toggleSelect(u.id)}
                />
                <span>
                  {u.name}{" "}
                  <span className="text-gray-500 text-sm">
                    ({u.email})
                  </span>
                </span>
              </label>
            ))}

            <button
              onClick={handleAddMembers}
              disabled={selectedUsers.length === 0}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Add Selected Members
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectMembers;
