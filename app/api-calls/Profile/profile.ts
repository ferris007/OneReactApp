import { useMutation, useQuery } from "@tanstack/react-query";
import http from "../http";
import agentHttp from "../agentCoachHttp";


// async function getProfile() {
//     const { data } = await http.get('api/user');



//     return data;
// }

// export const useGetMyProfile = () => {
//     return useQuery({
//         queryKey: ['api/user'],
//         queryFn: getProfile,
//     });
// };

async function getProfile() {
    const {data} = await http.get('api/user');


    console.log("DATATA", data);

    return data;
}

export const useGetMyProfile = () => {
    return useQuery({
        queryKey: ['api/user'],
        queryFn: getProfile,
    });
};



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
async function getBloodReports() {
    const { data } = await http.get('api/blood-test-results');



    return data;
}

export const useGetBloodReports = () => {
    return useQuery({
        queryKey: ['api/blood-test-results'],
        queryFn: getBloodReports,
    });
};



async function updateProfile(payload: any) {
    const data = await http.put("api/mobile/profile", (payload));

    return data;
}

export const useUpdateProfile = () => {
    return useMutation({
        mutationFn: updateProfile,
    });
};
async function uploadBloodReports(payload: any) {
    const data = await http.post("api/blood-test-results", payload);

    return data;
}

export const useUploadBloodReports = () => {
    return useMutation({
        mutationFn: uploadBloodReports,
    });
};
async function uploadBloodconv(payload: any) {
    const data = await agentHttp.post("bloodwork/upload", payload);

    return data;
}

export const useUploadBloodConv = () => {
    return useMutation({
        mutationFn: uploadBloodconv,
    });
};