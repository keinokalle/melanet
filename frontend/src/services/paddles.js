import axios from 'axios';
const baseUrl = '/api/paddles';

const getConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const getAll = async () => {
  const response = await axios.get(baseUrl, getConfig());
  return response.data;
};

const getByClubId = async (clubId, queryParams = {}) => {
  console.log("getting paddles by club id", clubId, "with params:", queryParams)
  console.log("config", getConfig())
  
  // Build query string from params
  const queryString = new URLSearchParams(queryParams).toString()
  const url = queryString ? `${baseUrl}/club/${clubId}?${queryString}` : `${baseUrl}/club/${clubId}`
  
  const response = await axios.get(url, getConfig());
  return response.data;
}

const getById = async (id) => {
  const response = await axios.get(`${baseUrl}/${id}`, getConfig());
  return response.data;
};

const create = async (newPaddle) => {
  console.log(newPaddle)
  const response = await axios.post(baseUrl, newPaddle, getConfig());
  console.log("response", response.data)
  return response.data
}

const update = async (id, updatedPaddle) => {
  const response = await axios.put(`${baseUrl}/${id}`, updatedPaddle, getConfig());
  return response.data;
};

const remove = async (id) => {
  const response = await axios.delete(`${baseUrl}/${id}`, getConfig());
  return response.data
}

const paddlesService = {
  getAll,
  getByClubId,
  getById,
  create,
  update,
  remove,
};

export default paddlesService;
