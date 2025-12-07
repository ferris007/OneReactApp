import { useQuery } from "@tanstack/react-query";
import http from "../http";

async function getWorkouts() {
    const { data } = await http.get('api/workout-plans');



    return data;
}

export const useGetWorkouts = () => {
    return useQuery({
        queryKey: ['/api/workout-plans'],
        queryFn: getWorkouts,
    });
};

