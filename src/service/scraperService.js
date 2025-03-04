import API from './axios.config'

// SERVICIO GET
export const listUrls = (page = 1) => {
  return API.get(`/api/v1/urls/?page=${page}`)
};

export const getUrlByParams = (url) => {
  return API.get(`/api/v1/scraper-get-url/`, {
    params: {
      url: url
    }
  });
};

export const getReportUrl = (idUrl) => {
  return API.get(`/api/v1/report-comparison/${idUrl}`,
  )
}

// SERVICIO POST
export const scrapUrl = (body) => {
  return API.post('/api/v1/scraper-url/', body)
};

export const addUrl = (body) => {
  return API.post('/api/v1/urls/', body)
};

export const notificationsUrl = (body) => {
  return API.post('/api/notifications/toggle/', body)
}


// SERVICIO PUT
export const updateUrl = (id, body) => {
  return API.put(`/api/v1/urls/${id}/`, body)
};
