import { useMutation, useQuery } from "@tanstack/react-query";
import http from "../http";

async function getChats() {
    const { data } = await http.get('api/chat');
    


    return data;
}

export const useGetChats = () => {
    return useQuery({
        queryKey: ['api/chat'],
        queryFn: getChats,
    });
};
async function getBlog() {
    const { data } = await http.get('api/blog');


    return data;
}

export const useGetBlog = () => {
    return useQuery({
        queryKey: ['api/blog'],
        queryFn: getBlog,
    });
};



async function sendMessage(payload: any) {
    const data = await http.post("api/chat", (payload));

    return data;
}

export const useSendMessage = () => {
    return useMutation({
        mutationFn: sendMessage,
    });
};