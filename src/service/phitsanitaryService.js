import API from './axios.config';


// SERVICIOS GET
export const listData = () => {
    return API.get('/api/v1/species')
}

// SERVICIOS POST
export const listSubscription = () => {
    return API.post('/api/v1/subscription/')
}
