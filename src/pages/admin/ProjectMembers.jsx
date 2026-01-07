import { useEffect, useState } from "react";
import {
  getAvailableUsersApi,
  addMembersApi,
  getMembersApi,
  removeMemberApi,
} from "../../api/projectMembers.api";

const ProjectMembers = ({ projectId }) => {
  const [assigned, setAssigned] = useState([]);
  const [available, setAvailable] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
//run both api immediatley
      const [membersRes, usersRes] = await Promise.all([
        getMembersApi(projectId),
        getAvailableUsersApi(projectId),
      ]);

      setAssigned(membersRes.data);
      setAvailable(usersRes.data.available);
    } catch (err) {
      console.error("Failed to load project members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

    await addMembersApi(
      projectId,
      selectedUsers.map((id) => ({ userId: id }))
    );

    setSelectedUsers([]);
    fetchData();
  };

  const handleRemove = async (userId) => {
    if (!confirm("Remove this member from project?")) return;

    await removeMemberApi(projectId, userId);
    fetchData();
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
            {assigned.map((m, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-2 border-b"
              >
                <div>
                  <p className="font-medium">{m.user.name}</p>
                  <p className="text-sm text-gray-500">
                    {m.user.email}
                  </p>
                </div>

                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleRemove(m.userId)}
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
              <label
                key={u.id}
                className="flex items-center gap-2 mb-2"
              >
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
