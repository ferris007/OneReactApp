import { useMutation, useQuery } from "@tanstack/react-query";
import http from "../http";
import agentHttp from "../agentCoachHttp";
import axios from "axios";

async function getConversation() {
    const { data } = await http.get('/api/ai-coach-conversations');



    return data;
}

export const useGetConversation = () => {
    return useQuery({
        queryKey: ['/api/ai-coach-conversations'],
        queryFn: getConversation,
    });
};
// async function getVoiceTypes() {
//     try {
//         const response = await axios.get("https://api.elevenlabs.io/v1/voices", {
//             headers: {
//                 "xi-api-key": ELEVEN_API_KEY,
//             },
//         });

//         console.log("Available Voices:", response.data.voices);
//         return response?.data?.voices;
//     } catch (error: any) {
//         console.error("Error fetching voices:", error?.response?.data || error.message);
//         return [];
//     }



// }

// export const useGetVoiceTypes = () => {
//     return useQuery({
//         queryKey: ['https://api.elevenlabs.io/v1/voices'],
//         queryFn: getVoiceTypes,
//     });
// };



async function sendAiMessage(payload: any) {




    const { data } = await agentHttp.post("chat", payload);

    return data;
}

export const useSendAiMessage = () => {
    return useMutation({
        mutationFn: sendAiMessage,
    });
};

async function sendAiVoiceMessage(payload: any) {

    const { data } = await agentHttp.post("api/ai-coach-voice", payload);

    return data;
}

export const useSendAiVoiceMessage = () => {
    return useMutation({
        mutationFn: sendAiVoiceMessage,
    });
};

async function sendAiImageMessage(payload: any) {

    const { data } = await agentHttp.post("analyze-image", payload);

    return data;
}

export const useSendAiImageMessage = () => {
    return useMutation({
        mutationFn: sendAiImageMessage,
    });
};
async function speechToText(payload: any) {

    const { data } = await agentHttp.post("api/speech-to-text", payload);

    return data;
}

export const useSpeechTotext = () => {
    return useMutation({
        mutationFn: speechToText,
    });
};




