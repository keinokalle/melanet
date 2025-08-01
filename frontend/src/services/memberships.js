import axios from 'axios'

const baseUrl = '/api/memberships'

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const getByUserId = async (userId) => {
  const response = await axios.get(`${baseUrl}/user/${userId}`)
  return response.data
}

const getById = async (id) => {
  const response = await axios.get(`${baseUrl}/${id}`)
  return response.data
}

const getByClubId = async (clubId) => {
  const response = await axios.get(`${baseUrl}/club/${clubId}`)
  return response.data
}

const create = async (newMembership) => {
  const response = await axios.post(baseUrl, newMembership)
  return response.data
}

const remove = async (id) => {
  const response = await axios.delete(`${baseUrl}/${id}`)
  return response.data
}

const membershipsService = { getAll, getByUserId, getById, getByClubId, create, remove }
export default membershipsService 