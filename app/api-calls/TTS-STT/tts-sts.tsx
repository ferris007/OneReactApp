import { useMutation } from "@tanstack/react-query";
import http from "../http";

async function speechToText(formData: any) {
    const data = await http.post("api/speech-to-text", formData);
    return data;
}

export const useConvertSpeechToText = () => {
    return useMutation({
        mutationFn: speechToText,
    });
};
async function textToSpeech(formData: any) {
    const data = await http.post("api/text-to-speech", formData);
    return data;
}

export const useConvertTextToSpeech = () => {
    return useMutation({
        mutationFn: textToSpeech,
    });
};