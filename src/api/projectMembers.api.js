import api from "./axios";

/* Get assigned & available users */
export const getAvailableUsersApi = (projectId) =>
  api.get(`/projects/${projectId}/available-users`);

/* Bulk add members */
export const addMembersApi = (projectId, members) =>
  api.post(`/projects/${projectId}/members`, { members });

/* Get members */
export const getMembersApi = (projectId) =>
  api.get(`/projects/${projectId}/members`);

/* Remove member */
export const removeMemberApi = (projectId, userId) =>
  api.delete(`/projects/${projectId}/members/${userId}`);
