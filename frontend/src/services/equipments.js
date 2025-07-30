import axios from 'axios'

const baseUrl = '/api/equipments'

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const getById = async (id) => {
  const response = await axios.get(`${baseUrl}/${id}`)
  return response.data
}

const create = async (newEquipment) => {
  const response = await axios.post(baseUrl, newEquipment)
  return response.data
}

const update = async (id, updatedEquipment) => {
  const response = await axios.put(`${baseUrl}/${id}`, updatedEquipment)
  return response.data
}

const remove = async (id) => {
  const response = await axios.delete(`${baseUrl}/${id}`)
  return response.data
}

const equipmentsService = { getAll, getById, create, update, remove }
export default equipmentsService 