import axios from 'axios';
const baseUrl = '/api/paddles';

const getConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const getAll = async () => {
  const response = await axios.get(baseUrl);
  return response.data;
};

const getByClubId = async (clubId) => {
  console.log("getting paddles by club id", clubId)
  console.log("config", getConfig())
  const response = await axios.get(`${baseUrl}/club/${clubId}`, getConfig());
  return response.data;
}

const getById = async (id) => {
  const response = await axios.get(`${baseUrl}/${id}`);
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
