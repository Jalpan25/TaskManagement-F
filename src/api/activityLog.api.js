import api from "./axios"; // your axios instance

export const getProjectActivityLogsApi = (projectId, cursor) => {
  return api.get(`/projects/${projectId}/activity-logs`, {
    params: {
      limit: 20,
      ...(cursor && { cursor }),
    },
  });
};
