import API from './axios.config'

// SERVICIO GET
export const listUrls = async () => {
  try {
    let allResults = []
    let nextUrl = '/api/v1/urls/' // Comenzamos con la primera página

    while (nextUrl) {
      const response = await API.get(nextUrl)
      
      allResults = [...allResults, ...response.data.results] // Acumulamos los registros
      nextUrl = response.data.next ? new URL(response.data.next).pathname + new URL(response.data.next).search : null // Extraemos solo la ruta de la URL
    }

    return { data: allResults }
  } catch (error) {
    console.error('Error al obtener la lista de URLs paginadas: ', error)
    throw error
  }
}

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
