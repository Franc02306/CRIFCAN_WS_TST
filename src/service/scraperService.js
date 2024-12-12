import API from './axios.config'

// SERVICIO GET
export const listUrls = () => {
  return API.get('/api/v1/urls/')
};

export const getUrlByParams = (url) => {
  return API.get(`/api/v1/scraper-get-url/`, {
    params: {
      url: url
    }
  });
};


// SERVICIO POST
export const scrapUrl = (body) => {
  return API.post('/api/v1/scraper-url/', body)
};

export const addUrl = (body) => {
  return API.post('/api/v1/urls/', body)
};


// SERVICIO PUT
export const updateUrl = (id, body) => {
  return API.put(`/api/v1/urls/${id}/`, body)
};


// http://127.0.0.1:8000/api/v1/scrape-url/