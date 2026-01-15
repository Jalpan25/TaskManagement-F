import api from "./axios"; // your axios instance

export const getTaskActivityLogsApi = (taskId, cursor) => {
  return api.get(`/tasks/${taskId}/activity-logs`, {
    params: {
      cursor,
    },
  });
};
