import api from "./axios";

export const getProjectTasksApi = (projectId) => {
  return api.get(`/projects/${projectId}/tasks`);
};

export const createTaskApi = (projectId, data) => {
  return api.post(`/projects/${projectId}/tasks`, data);
};

export const updateTaskApi = (taskId, data) => {
  return api.put(`/tasks/${taskId}`, data);
};

export const deleteTaskApi = (taskId) => {
  return api.delete(`/tasks/${taskId}`);
};
