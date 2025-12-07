import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { type AxiosRequestHeaders } from "axios";
import { AGENT_BASE_URL, AUTH_KEY, GROCERY_BASE_URL } from "./variables";
import { getToken } from "./helper";

const groceryHttp = axios.create({
    baseURL: GROCERY_BASE_URL,
    timeout: 100000,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",

    },
});



groceryHttp.interceptors.request.use(
    async config => {
        config.headers = {
            ...config.headers,
            "Content-Type":
                config.data instanceof FormData
                    ? "multipart/form-data"
                    : "application/json",
        } as AxiosRequestHeaders;


        console.log("CONFIGGG", config);


        return config;
    },
    async error => {
        return await Promise.reject(error);
    },
);

export default groceryHttp;
