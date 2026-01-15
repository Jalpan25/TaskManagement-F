import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getUserProjectsApi } from "../../api/user.api";

const UserDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getUserProjectsApi();
        setProjects(res.data);
      } catch {
        console.error("Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">My Projects</h1>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p>No projects assigned</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{projects.map((p) => (
  <div
    key={p.id}
    className="border rounded p-4 hover:shadow flex flex-col gap-3"
  >
    <div
      className="cursor-pointer"
      onClick={() => navigate(`/user/projects/${p.id}`)}
    >
      <h2 className="font-semibold">{p.name}</h2>
      <p className="text-sm text-gray-600">{p.description}</p>
    </div>


  </div>
))}

        </div>
      )}
    </MainLayout>
  );
};

export default UserDashboard;
