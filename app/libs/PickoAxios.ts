import axios from "axios";

const { DEV } = process.env;
const pickoAxios = axios.create({
  baseURL:
    DEV === "1" ? "http://localhost:5173/api/v1" : "https://picko.tech/api/v1",
  headers: {
    Authorization: `Bearer ${process.env.PICKO_TOKEN}`,
  },
});

pickoAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response.data);
  }
);

export default pickoAxios;
