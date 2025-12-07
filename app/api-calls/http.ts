import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { type AxiosRequestHeaders } from "axios";
import { AGENT_BASE_URL, AUTH_KEY } from "./variables";
import { getToken } from "./helper";

const http = axios.create({
  baseURL: AGENT_BASE_URL,
  timeout: 100000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",

  },
});

// ✅ JSON → FormData converter (local only in this file)
const jsonToFormData = (json: Record<string, any>) => {
  let formData = new FormData()
  Object.keys(json).map((item) => {
    formData.append(item, json[item])
  })

  console.log("FORM DARTA", formData);

  return formData


};

http.interceptors.request.use(
  async config => {
    let token = await AsyncStorage.getItem(AUTH_KEY);
    if (token) {
      token = await getToken();
    }
    // if (!(config.data instanceof FormData) && config.method === "post") {
    //   config.data = jsonToFormData(config.data)
    // }


    config.headers = {
      ...config.headers,
      "Content-Type":
        config.data instanceof FormData
          ? "multipart/form-data"
          : "application/json",
      Authorization: `Bearer ${token ?? ""}`,
    } as AxiosRequestHeaders;


    console.log("CONFIGGG", config);


    return config;
  },
  async error => {
    return await Promise.reject(error);
  },
);

export default http;
