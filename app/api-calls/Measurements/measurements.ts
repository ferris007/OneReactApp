import { useMutation, useQuery } from "@tanstack/react-query";
import http from "../http";





async function getMeasurements() {
    const { data } = await http.get('api/measurements');



    return data;
}

export const useGetMeasurements = () => {
    return useQuery({
        queryKey: ['api/measurements'],
        queryFn: getMeasurements,
    });
};



async function addMeasurements(payload: any) {
    const data = await http.post("api/measurements", payload);

    return data;
}

export const useAddMeasurements = () => {
    return useMutation({
        mutationFn: addMeasurements,
    });
};