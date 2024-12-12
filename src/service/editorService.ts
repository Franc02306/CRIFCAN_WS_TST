import axios from 'axios'

export const getComments = async (documentId: string) => {
  const response = await axios.get(`/api/comments/${documentId}`)
  
  return response.data
}

export const postComment = async (documentId: string, comment: any) => {
  const response = await axios.post(`/api/comments/${documentId}`, comment)

  return response.data
}

export const updateComment = async (documentId: string, threadId: string, commentId: string, data: any) => {
  const response = await axios.patch(`/api/comments/${documentId}/${threadId}/${commentId}`, data)

  return response.data
}

// Enviar nueva versión del párrafo
export const sendParagraphVersion = async (documentId: string, paragraphId: string, content: string) => {
  const response = await axios.post(`/api/versions/${documentId}/${paragraphId}`, { content })
  
  return response.data
}

export const getParagraphVersions = async (documentId: string, paragraphId: string) => {
  const response = await axios.get(`/api/versions/${documentId}/${paragraphId}`)
  
  return response.data
}
