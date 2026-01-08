import api from "./axios";

// Get tasks of a project ///pagination API
export const getProjectTasksApi = (projectId, params) => {
  return api.get(`/projects/${projectId}/tasks`, { params });
};


// Create task
export const createTaskApi = (projectId, data) => {
  return api.post(`/projects/${projectId}/tasks`, data);
};

// 🔹 Get task data for edit screen
export const getTaskForEditApi = (taskId) => {
  return api.get(`/tasks/${taskId}/edit`);
};

// 🔹 Update task (PATCH, not PUT)
export const updateTaskApi = (taskId, data) => {
  return api.patch(`/tasks/${taskId}`, data);
};

// Delete task
export const deleteTaskApi = (taskId) => {
  return api.delete(`/tasks/${taskId}`);
};
