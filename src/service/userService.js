import API from './axios.config';


// SERVICIOS GET
export const listUser = (url = `/api/users/`) => {
	return API.get(url);
};

export const getUserById = id => {
	return API.get(`/api/users/${id}/`);
};

export const listUserDocId = id => {
	return API.get(`/usuario/usuario/${id}/`);
};

export const getIdentification = () => {
	return API.get(`/api/data/identification/`);
};

export const getSystemRoles = () => {
	return API.get(`/api/data/system-roles/`);
};

export const getPositionId = id => {
	return API.get(`/api/models/position/${id}/`);
};

export const getCountry = () => {
	return API.get(`/api/data/country/`);
};


// SERVICIOS POST
export const addUser = data => {
	return API.post(`/api/users/`, data);
};


// SERVICIO DELETE
export const deleteUser = id => {
	return API.delete(`/api/users/${id}/`);
};


// SERVICIOS PUT | PATCH
export const updateUserById = (id, body) => {
	return API.put(`/api/users/${id}/`, body);
};

export const updateUserByIdPatch = (id, body) => {
	return API.patch(`/api/users/${id}/`, body);
};
