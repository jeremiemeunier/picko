import axios from "axios";

let urlRequest = "";

const DiscordAxios = axios.create({
  baseURL: "https://discord.com/api/v10",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

DiscordAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response.data);
  }
);

export default DiscordAxios;
