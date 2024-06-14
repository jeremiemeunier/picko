import axios from "axios";

let urlRequest = "";

const StatyAxios = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    Authorization: `Bearer ${process.env.BOT_ID}`,
  },
});

StatyAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response.data);
  }
);

export default StatyAxios;
