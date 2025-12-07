import { useMutation } from "@tanstack/react-query";
import http from "../http";
import groceryHttp from "../groceryHttp";

async function orderGrocery(payload: any) {

    const data = await groceryHttp.post("/order", (payload));

    return data;
}

export const useSendOrderGrocery = () => {
    return useMutation({
        mutationFn: orderGrocery,
    });
};