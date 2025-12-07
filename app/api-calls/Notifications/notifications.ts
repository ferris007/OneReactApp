import { useMutation, useQuery } from "@tanstack/react-query";
import http from "../http";

async function getNotificationSettings() {
    const data = await http.get('api/notification-settings');
    console.log("", data);



    return data?.data;
}

export const useGetNotificationSettings = () => {
    return useQuery({
        queryKey: ['api/notification-settings'],
        queryFn: getNotificationSettings,
    });
};



async function addNotSetting(payload: any) {
    const data = await http.post("api/notification-settings", (payload));

    return data;
}

export const useAddNotificationSetting = () => {
    return useMutation({
        mutationFn: addNotSetting,
    });
};
async function testNotification(payload: any) {
    const data = await http.post("api/test-sms", (payload));

    return data;
}

export const useTestNotification = () => {
    return useMutation({
        mutationFn: testNotification,
    });
};
