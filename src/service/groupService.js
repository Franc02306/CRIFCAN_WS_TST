import API from "./axios.config";


// SERVICIOS GET
export const getCustomGroups = async (url = `/api/models/custom-groups/`) => { // OBTENER LOS CUSTOM GROUPS
  return API.get(url);
};

export const getCustomGroupByGroup = groupId => { // OBTENER LOS PARAMETROS DE UN GRUPO MÁS SUS DOCUMENTOS ASIGNADOS
  return API.get(`/api/models/custom-groups/${groupId}/`)
};

export const getGroupsByUserCreatorLogged = async () => {
  return API.get(`/api/models/custom-groups/user_creator/`)
}

export const getGroupsByUserAssignedLogged = async () => {
  return API.get(`/api/models/custom-groups/assigned_user/`);
};

// SERVICIO POST
export const addCustomGroup = data => { // CREAR EL CUSTOM GROUP CON EL NOMBRE OBTENIDO DEBES PASAR EL ID
  return API.post(`/api/models/custom-groups/`, data);
};


// SERVICIO PUT | PATCH
export const editCustomGroup = (groupId, data) => {
  return API.put(`/api/models/custom-groups/${groupId}/`, data);
};

export const editCustomGroupPatch = (groupId, data) => {
  return API.patch(`/api/models/custom-groups/${groupId}/`, data);
};

export const editGroup = (groupId, data) => {
  return API.put(`/api/models/groups/${groupId}/`, data);
};

export const editGroupPatch = (groupId, data) => {
  return API.patch(`/api/models/groups/${groupId}/`, data);
};


// SERVICIO DELETE
export const deleteCustomGroup = async groupId => {
  return API.delete(`/api/models/custom-groups/${groupId}/`);
};

export const deleteGroup = async groupId => {
  return API.delete(`/api/models/groups/${groupId}/`);;
};
