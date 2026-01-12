import api from "./axios";

export const getCommentsApi = (taskId) =>
  api.get(`/tasks/${taskId}/comments`);

export const createCommentApi = (taskId, data) =>
  api.post(`/tasks/${taskId}/comments`, data);

export const updateCommentApi = (commentId, data) =>
  api.put(`/comments/${commentId}`, data);

export const deleteCommentApi = (commentId) =>
  api.delete(`/comments/${commentId}`);