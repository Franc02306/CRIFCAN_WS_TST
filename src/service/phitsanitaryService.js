import API from './axios.config';


// SERVICIOS GET
export const listData = () => {
    return API.get('/api/v1/species')
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
    return API.delete(`/api/v1/subscription/${idSubscription}`)
}
