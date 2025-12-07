import { useMutation, useQuery } from "@tanstack/react-query";
import http from "../http";

async function getRewards() {
    const { data } = await http.get('api/viift/balance');



    return data;
}

export const useGetRewards = () => {
    return useQuery({
        queryKey: ['api/viift/balance'],
        queryFn: getRewards,
    });
};
async function getWeightClaims() {
    console.log("CALLED",);

    const { data } = await http.get('api/viift/weight-claims');
    console.log("CALLED", data);
    return data;
}

export const useGetWeightClaims = () => {
    return useQuery({
        queryKey: ['api/viift/weight-claims'],
        queryFn: getWeightClaims,
    });
};
async function getTrustedDevices() {
    const { data } = await http.get('api/viift/trusted-devices');
    return data;
}

export const useGetTrustedDevices = () => {
    return useQuery({
        queryKey: ['api/viift/trusted-devices'],
        queryFn: getTrustedDevices,
    });
};

async function submitWeightProof(payload: any) {
    console.log("PPPPP", payload);

    const data = await http.post("api/viift/submit-weight-proof", payload);
    console.log("DATA", data);


    return data;
}

export const useSubmitWeightProof = () => {
    return useMutation({
        mutationFn: submitWeightProof,
    });
};









async function getCompletedGoals() {
    const { data } = await http.get('api/viift/completed-goals');



    return data;
}

export const useGetCompletedGoals = () => {
    return useQuery({
        queryKey: ['api/viift/completed-goals'],
        queryFn: getCompletedGoals,
    });
};
async function getTransactions() {
    const data = await http.get('api/viift/transactions');

    console.log("DATATATA", data);


    return data?.data;
}

export const useGetTransactions = () => {
    return useQuery({
        queryKey: ['api/viift/transactions'],
        queryFn: getTransactions,
    });
};


async function conenctWallet(payload: any) {
    const data = await http.post("api/viift/connect-wallet", payload);
    console.log("DATA", data);


    return data;
}

export const useConenctXRPWallet = () => {
    return useMutation({
        mutationFn: conenctWallet,
    });
};
async function claimTokens(payload: any) {
    const { data } = await http.post("/api/viift/claim", payload);
    console.log("DATA", data);


    return data;
}

export const useClaimTokens = () => {
    return useMutation({
        mutationFn: claimTokens,
    });
};

async function verifyTrustLine(id: string) {
    const { data } = await http.get(`api/viift/verify-trustline/${id}`)
    return data
}

export const getVerifyTrustLine = (id: string) => {
    return useQuery({
        queryKey: [`api/viift/verify-trustline/${id}`],
        queryFn: () => verifyTrustLine(id),
    });
};
async function getInstructions() {
    const { data } = await http.get(`/api/viift/trustline-instructions`)
    return data
}

export const useGetTrustInstructions = () => {
    return useQuery({
        queryKey: [`/api/viift/trustline-instructions`],
        queryFn: getInstructions,
    });
};