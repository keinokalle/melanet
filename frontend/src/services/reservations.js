import axios from 'axios'
const baseUrl = '/api/reservations'

const getConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const getByClubId = async (clubId, queryParams = {}) => {

  // Build query string from params
  const queryString = new URLSearchParams(queryParams).toString()
  const url = queryString ? `${baseUrl}/club/${clubId}?${queryString}` : `${baseUrl}/club/${clubId}`

  const response = await axios.get(url, getConfig())
  return response.data
}

const getAll = async () => {
  const response = await axios.get(baseUrl, getConfig())
  return response.data
}

const getById = async (id) => {
  const response = await axios.get(`${baseUrl}/${id}`, getConfig())
  return response.data
}

const create = async (reservationData) => {
  const response = await axios.post(baseUrl, reservationData, getConfig())
  return response.data
}

const update = async (id, reservationData) => {
  const response = await axios.put(`${baseUrl}/${id}`, reservationData, getConfig())
  return response.data
}

const remove = async (id) => {
  const response = await axios.delete(`${baseUrl}/${id}`, getConfig())
  return response.data
}

const reservationsService = {
  getAll,
  getById,
  getByClubId,
  create,
  update,
  remove
}

export default reservationsService