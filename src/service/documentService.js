import API from "./axios.config";


// SERVICIOS GET
export const listDoc = async (url = `/api/models/documents/`) => {
  return API.get(url);
};

export const listDocId = id => {
	return API.get(`/api/models/documents/${id}/`);
};

export const listDocType = async () => {
  return API.get(`/api/data/document-type/`);
};

export const getPermissionsById = async id => {
  return API.get(`/api/data/permissions/${id}/`);
};

export const listPermissions = async () => {
  return API.get(`/api/data/permissions/`);
};

export const getRoles = async () => {
  return API.get(`/api/data/document-roles/`)
};

export const getRolesById = async id => {
  return API.get(`/api/data/document-roles/${id}/`)
}

export const listDocsByUserCreatorLogged = async () => {
  return API.get(`/api/models/documents/creator_user/`)
};

export const listDocsByUserAssignedLogged = async () => {
  return API.get(`/api/models/documents/assigned_user/`);
};

export const listDocState = async () => {
  return API.get(`/api/data/document-state/`);
}

export const getTypeComment = async () => { // API USADA PARA EL EDITOR
  return API.get(`/api/data/comment-type/`);
};


// SERVICIO POST
export const createDocs = data => {
  return API.post('/api/models/documents/', data);
};

export const assignRolesInDoc = async data => {
  return API.post(`/api/models/assign-roles/`, data);
};


// SERVICIO PUT PATCH
export const editAssignRolesInDoc = async (id) => {
  return API.put(`/api/models/assign-roles/${id}/`);
};

export const editDocById = async (docId, data) => {
  return API.put(`/api/models/documents/${docId}/`, data);
};

export const editDocByIdPatch = async (docId, data) => {
  return API.patch(`/api/models/documents/${docId}/`, data);
};


// SERVICIO DELETE
export const deleteDoc = docId => {
  return API.delete(`/api/models/documents/${docId}/`);
};
