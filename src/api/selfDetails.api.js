import api from "./axios"

export const getSelfDeatils=()=>{
    return api.get(`/self`)
};