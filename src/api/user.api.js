import api from "./axios.js";

export const getUserProjectsApi = () => {
  return api.get("/user/projects");
};
