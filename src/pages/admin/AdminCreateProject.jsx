import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { createProjectApi } from "../../api/project.api";

const AdminCreateProject = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    //  Validate name
    if (!name.trim()) {
      return setError("Project name is required");
    }

    // Validate description (NEW)
    if (!description.trim()) {
      return setError("Project description is required");
    }

    try {
      setLoading(true);

      const res = await createProjectApi({
        name: name.trim(),
        description: description.trim(),
      });

      // Redirect to Edit Project page
      navigate(`/admin/projects/${res.data.id}/edit`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin")}
        className="text-blue-600 mb-3 hover:underline"
      >
        ← Back to Projects
      </button>

      <h1 className="text-xl font-bold mb-4">Create Project</h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-3">
          <label className="block mb-1 font-medium">Project Name</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            placeholder="Enter project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Enter project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>
    </MainLayout>
  );
};

export default AdminCreateProject;
