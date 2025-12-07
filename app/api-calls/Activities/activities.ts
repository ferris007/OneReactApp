import { useMutation, useQuery } from "@tanstack/react-query";
import http from "../http";

async function getActivities() {
    const { data } = await http.get('api/activities');
    


    return data;
}

export const useGetActivities = () => {
    return useQuery({
        queryKey: ['api/activities'],
        queryFn: getActivities,
    });
};

async function addActivities(payload: any) {
    const data = await http.post("api/activities", payload);

    return data;
}

export const useAddActivities = () => {
    return useMutation({
        mutationFn: addActivities,
    });
};