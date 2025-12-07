import { useQuery } from "@tanstack/react-query";
import http from "../http";

async function getAttendance() {
    const { data } = await http.get('api/attendance');
    


    return data;
}

export const useGetAttendance = () => {
    return useQuery({
        queryKey: ['api/attendance'],
        queryFn: getAttendance,
    });
};