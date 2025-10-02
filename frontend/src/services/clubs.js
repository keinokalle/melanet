import axios from 'axios'

const baseUrl = '/api/clubs'

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const getById = async (id) => {
  const response = await axios.get(`${baseUrl}/${id}`)
  return response.data
}

const create = async (newClub) => {
  const response = await axios.post(baseUrl, newClub)
  return response.data
}

const update = async (id, updatedClub) => {
  const response = await axios.put(`${baseUrl}/${id}`, updatedClub)
  return response.data
}

const remove = async (id) => {
  const response = await axios.delete(`${baseUrl}/${id}`)
  return response.data
}

const clubsService = { getAll, getById, create, update, remove }
export default clubsService