import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import TaskForm from "./TaskForm";

const CreateTaskPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  return (
    <MainLayout>
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 mb-3 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-xl font-bold mb-4">Create Task</h1>

      <TaskForm
        projectId={projectId}
        onSuccess={() =>
          navigate(-1)
        }
      />

    </MainLayout>
  );
};

export default CreateTaskPage;
