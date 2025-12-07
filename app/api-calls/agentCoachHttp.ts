import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { type AxiosRequestHeaders } from "axios";
import { AGENT_BASE_URL, API_BASE_URL, AUTH_KEY } from "./variables";
import { getToken, getUserID } from "./helper";
import { useAuth } from "../context/useAuth";

const agentHttp = axios.create({
    baseURL: AGENT_BASE_URL,
    timeout: 200000,
    headers: {
        "Content-Type": "application/json",
    },
});

const jsonToFormData = (json: Record<string, any>) => {
    let formData = new FormData()
    Object.keys(json).map((item) => {
        formData.append(item, json[item])
    })

    console.log("FORM DARTA", formData);

    return formData


};



agentHttp.interceptors.request.use(
    async config => {
        let token = await AsyncStorage.getItem(AUTH_KEY);
        console.log("CONFIG>DATA", config.data);
        // if (!(config.data instanceof FormData)) {
        //     config.data = jsonToFormData(config.data)
        // }

        let userID = await AsyncStorage.getItem("userId");
        console.log("USER ID", userID);

        if (token) {
            token = await getToken();
        }

        if (config.headers) {
            (config.headers as any)["Client-Id"] = userID;
            (config.headers as any)["Content-Type"] =
                config.data instanceof FormData
                    ? "multipart/form-data"
                    : "application/json";
            (config.headers as any)["Authorization"] = `Bearer ${token ?? ""}`;
        }
        console.log("CONFIG", config);

        return config;
    },
    async error => {
        return await Promise.reject(error);
    },
);

export default agentHttp;