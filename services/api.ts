import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000", // 나중에 백엔드 연결
});