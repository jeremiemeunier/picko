import axios from "axios";

let urlRequest = "";

if (process.env.DEV === "1") {
  urlRequest = "http://localhost:4000";
} else {
  urlRequest = "http://localhost:3000";
}

const StatyAxios = axios.create({
  baseURL: urlRequest,
  headers: {
    "PooksApi-Key": process.env.API_KEY,
  },
});

StatyAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error.response.data);
    return Promise.reject(error.response.data);
  }
);

export default StatyAxios;
