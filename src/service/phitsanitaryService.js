import API from './axios.config';


// SERVICIOS GET
export const listData = () => {
    return API.get('/api/v1/species')
}
