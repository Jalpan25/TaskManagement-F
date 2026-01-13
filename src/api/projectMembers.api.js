import api from "./axios";

/* Get assigned & available users */
export const getAvailableUsersApi = (projectId) =>
  api.get(`/projects/${projectId}/available-users`);

/* Bulk add members */
export const addMembersApi = (projectId, members) =>
  api.post(`/projects/${projectId}/members`, { members });

/* Get members */
//here shows all the member of that particular id project
//removed api 
export const getMembersApi = (projectId, page = 1, limit = 10, search = "") =>
  api.get(`/projects/${projectId}/members`, {
    params: { page, limit, search },
  });

/* Remove member */
export const removeMemberApi = (projectId, userId) =>
  api.delete(`/projects/${projectId}/members/${userId}`);
