import { useMutation, useQuery } from "@tanstack/react-query";
import http from "../http";
import { DocumentPickerAsset } from "expo-document-picker";
import { uploadFile, validateFile } from "../../../lib/upload-helpers";


async function getGoals() {
    const { data } = await http.get('api/goals');


    return data;
}

export const useGetMyGoals = () => {
    return useQuery({
        queryKey: ['api/goals'],
        queryFn: getGoals,
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



async function addGoals(payload: any) {
    const data = await http.post("api/goals", (payload));

    return data;
}

export const useAddGoals = () => {
    return useMutation({
        mutationFn: addGoals,
    });
};
async function deleteBloodReports(payload: any) {

    const data = await http.delete(`api/blood-test-results/${payload}`);

    return data;
}

export const useDeleteBloodReports = () => {
    return useMutation({
        mutationFn: deleteBloodReports,
    });
};

async function getFoodLogs() {
    const { data } = await http.get('api/food-logs');


    return data;
}

export const useGetFoodLogs = () => {
    return useQuery({
        queryKey: ['api/food-logs'],
        queryFn: getFoodLogs,
    });
};
async function getMealPlans() {
    const { data } = await http.get('api/meal-plans');


    return data;
}

export const useGetMealPlans = () => {
    return useQuery({
        queryKey: ['api/meal-plans'],
        queryFn: getMealPlans,
    });
};






async function uploadFoodLog(payload: { file: DocumentPickerAsset; notes: string }) {
    const { file, notes } = payload;



    if (!file) {
        throw new Error("No file provided for upload");
    }

    const allowedTypes = [".pdf", ".png", ".jpeg", ".jpg"];
    const { valid, error } = validateFile(file, allowedTypes, 5 * 1024 * 1024);

    if (!valid) {
        throw new Error(error || "File validation failed.");
    }

    const additionalData: Record<string, string> = {};
    if (notes) {
        additionalData.notes = notes;
    }

    return uploadFile("/api/food-logs", file, additionalData);
}

export const useUploadFoodLog = () => {
    return useMutation({
        mutationFn: uploadFoodLog,
    });
};