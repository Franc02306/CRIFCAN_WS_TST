import API from './axios.config';


// SERVICIOS GET
export const listUser = () => {
	return API.get('/api/users/');
};

export const getUserById = id => {
	return API.get(`/api/users/${id}/`);
};

// export const getSystemRoles = () => {
// 	return API.get(`/api/data/system-roles/`);
// };


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
