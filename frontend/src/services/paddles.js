import axios from 'axios';
const baseUrl = '/api/paddles';

const getConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

const getAll = async () => {
  const response = await axios.get(baseUrl);
  return response.data;
};

const getByClubId = async (clubId, queryParams = null) => {
  let url = `${baseUrl}/club/${clubId}`;
  if (queryParams) {
    url += `?${queryParams.toString()}`;
  }
  
  const response = await axios.get(url, getConfig());
  console.log("got these paddles", response.data);
  
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
