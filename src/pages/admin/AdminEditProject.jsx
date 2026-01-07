import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import {
  getProjectByIdApi,
  updateProjectApi,
  deleteProjectApi,
} from "../../api/project.api";
import ProjectMembers from "./ProjectMembers";

const AdminEditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);//initial data loading
  const [saving, setSaving] = useState(false);//Update request in progress
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await getProjectByIdApi(id);
        setName(res.data.name);
        setDescription(res.data.description || "");
      } catch {
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  const handleUpdate = async () => {
    setError("");

    if (!name.trim()) {
      return setError("Project name is required");
    }
    if (!description.trim()) {
  return setError("Project description is required");
}

    try {
      setSaving(true);
      await updateProjectApi(id, { name, description });
      alert("Project updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    )
      return;

    try {
      await deleteProjectApi(id);
      navigate("/admin");
    } catch {
      alert("Failed to delete project");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <p>Loading project...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin")}
        className="text-blue-600 mb-3 hover:underline"
      >
        ← Back to Projects
      </button>

      <h1 className="text-xl font-bold mb-4">Edit Project</h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      {/* Project Details */}
      <div className="max-w-md mb-8">
        <div className="mb-3">
          <label className="block mb-1 font-medium">Project Name</label>
          <input
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            className="w-full border p-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          onClick={handleUpdate}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>



      {/* Project Members Section */}
      <ProjectMembers projectId={id} />

      {/* Danger Zone */}
      <div className="border-t pt-4 mt-8">
        <h2 className="text-red-600 font-semibold mb-2">Danger Zone</h2>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete Project
        </button>
      </div>
    </MainLayout>
  );
};

export default AdminEditProject;
