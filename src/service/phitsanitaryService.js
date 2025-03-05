import API from './axios.config';

// SERVICIOS GET
export const listData = async () => {
	try {
		let allResults = []
		let nextUrl = '/api/v1/species'

		while (nextUrl) {
			const response = await API.get(nextUrl)

			allResults = [...allResults, ...response.data.results]
			nextUrl = response.data.next ? new URL(response.data.next).pathname + new URL(response.data.next).search : null
		}

		return { data: allResults }
	} catch (error) {
		console.error('Error al obtener la lista de URLs paginadas: ', error)
		throw error
	}
}

export const listSubscription = () => {
	return API.get('/api/v1/subscription/')
}

// SERVICIOS POST
export const createSubscription = (body) => {
	return API.post('/api/v1/subscription/', body)
}


// SERVICIO DELETE
export const deleteSubscription = (idSubscription) => {
	return API.delete(`/api/v1/subscription/${idSubscription}/`)
}
