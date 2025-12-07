import { useMutation, useQuery } from "@tanstack/react-query";
import http from "../http";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AUTH_KEY } from "../variables";

async function getUser() {
    const { data } = await http.get('api/user');
    return data;
}

export const useUserDetails = () => {
    // const [token, setToken] = useState<string | null>(null);


    return useQuery({
        queryKey: ['api/user'],
        queryFn: getUser,
        // enabled: !!token
    });
};




async function login(payload: any) {
    const data = await http.post("api/mobile/login", (payload));

    return data;
}

export const useLogin = () => {
    return useMutation({
        mutationFn: login,
    });
};
async function register(payload: any) {
    const data = await http.post("/api/mobile/register", (payload));

    return data;
}

export const useRegister = () => {
    return useMutation({
        mutationFn: register,
    });
};
async function resetPassword(payload: any) {
    const { data } = await http.post("/api/reset-password", (payload));

    return data;
}

export const useResetPassword = () => {
    return useMutation({
        mutationFn: resetPassword,
    });
};
async function deleteAccount(payload: any) {
    const { data } = await http.post("/api/mobile/delete_user");
    console.log("DATATATAT 1111", data);

    return data;
}

export const useDeleteAccount = () => {
    return useMutation({
        mutationFn: deleteAccount,
    });
};








