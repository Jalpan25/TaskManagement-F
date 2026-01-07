import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getProjectsApi, deleteProjectApi } from "../../api/project.api";

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await getProjectsApi();
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    await deleteProjectApi(id);
    fetchProjects();
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        <button
          onClick={() => navigate("/admin/projects/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create Project
        </button>
      </div>

      {loading ? (
        <p>Loading projects...</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Description</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.description}</td>
                <td className="p-2">{p.status}</td>
                <td className="p-2 space-x-3">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() =>
                      navigate(`/admin/projects/${p.id}/edit`)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(p.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </MainLayout>
  );
};

export default AdminDashboard;
