import axios from 'axios';
const baseUrl = '/api/paddles';

const getAll = async () => {
  const response = await axios.get(baseUrl);
  return response.data;
};

const create = async (newPaddle) => {
  const response = await axios.post(baseUrl, newPaddle);
  return response.data;
};

const update = async (id, updatedPaddle) => {
  const response = await axios.put(`${baseUrl}/${id}`, updatedPaddle);
  return response.data;
};

const remove = async (id) => {
  const response = await axios.delete(`${baseUrl}/${id}`);
  return response.data;
};

const paddlesService = {
  getAll,
  create,
  update,
  remove,
};

export default paddlesService;
