import API from './axios.config';

// Servicio GET con URL dinámica
export const getInstitutions = (url = `/api/models/institution/`) => {
	return API.get(url);
};

export const getInstitutionById = id => {
	return API.get(`/api/models/institution/${id}/`);
};


// SERVCIO POST
export const addInstitution = data => {
	return API.post(`/api/models/institution/`, data);
};


// SERVICIOS PUT | PATCH
export const editInstitutionById = (id, body) => {
	return API.put(`/api/models/institution/${id}/`, body);
};

export const editInstitutionByIdPatch = (id, body) => {
	return API.put(`/api/models/institution/${id}/`, body);
};


// SERVICIO DELETE
export const deleteInstitution = id => {
	return API.delete(`/api/models/institution/${id}/`);
};
