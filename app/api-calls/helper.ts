import AsyncStorage from "@react-native-async-storage/async-storage";
import { AUTH_KEY, ELEVEN_API_KEY, OPENAIKEY } from "./variables";
import { useAuth } from "../context/useAuth";
import * as FileSystem from 'expo-file-system';
import axios from "axios";
import { Audio } from "expo-av";
import Toast from "react-native-toast-message";
// import * as Sharing from 'expo-sharing';

export async function getToken() {
    let token: any = await AsyncStorage.getItem(AUTH_KEY);

    if (token[0] === "" && token[token.length - 1] === "") {
        token = token.slice(1, -1);
    }

    return token;
}
export async function getUserID() {
    const { user } = useAuth()

    return user?.id;
}



export async function getLocalId() {
    const id = await AsyncStorage.getItem("userId")

    return id;
}



export const extractPdfDetails = (text: string) => {
    const pdfRegex = /(https?:\/\/[^\s]+\/([^\/]+\.pdf)(\?[^\s]*)?)/i;
    let match
    if (text && pdfRegex) {
        match = text?.match(pdfRegex);
    }



    if (match) {
        const fullFileName = match[2]; // e.g. "de8feb9a-xxxx_Workout_Plan.pdf"
        const nameWithoutExtension = fullFileName.replace(/\.pdf$/i, "");

        // Extract only readable name (after the last underscore if UUID present)
        const displayName = nameWithoutExtension.includes("_")
            ? nameWithoutExtension.split("_").slice(1).join(" ") // Remove UUID
            : nameWithoutExtension;
        return {
            fileName: match[2],
            url: match[1],
            displayName: displayName
        };
    }
    return null;
}

export const workoutPdfMessage = (message: string) => {
    const pdfDetails = extractPdfDetails(message);
    let beforePdf
    let afterPdf
    if (pdfDetails) {

        beforePdf = message.split(/\[Download PDF\]\(.*?\.pdf.*?\)/i)[0];
        afterPdf = message.split(/\[Download PDF\]\(.*?\.pdf.*?\)/i)[1];
    }

    if (pdfDetails) {
        return {
            beforePdf: beforePdf,
            response: pdfDetails,
            afterPdf: afterPdf,
            type: message?.includes("workout") || message?.includes("Workout") ? "workout" : ""
        }
    }





}



export const countPdfsInMessage = (message: string): number => {
    if (!message) return 0;

    const pdfRegex = /(https?:\/\/[^\s]+\/([^\/]+\.pdf)(\?[^\s]*)?)/gi;
    const matches = message.match(pdfRegex);

    return matches ? matches.length : 0;
};


export const extractAllPdfDetails = (message: string) => {
    if (!message) return [];

    // Regex to capture all PDFs (global flag "g")
    const pdfRegex = /(https?:\/\/[^\s]+\/([^\/]+\.pdf)(\?[^\s]*)?)/gi;

    let match;
    const results: {
        fileName: string;
        url: string;
        displayName: string;
    }[] = [];

    while ((match = pdfRegex.exec(message)) !== null) {
        const fileName = match[2];
        const url = match[1];

        // Clean display name from fileName (remove UUIDs, underscores)
        let displayName = fileName.replace(/\.pdf$/i, "");
        if (displayName.includes("_")) {
            displayName = displayName.split("_").slice(1).join(" ");
        }

        // Surrounding context (50 chars before/after)
        const before = message.slice(Math.max(0, match.index - 50), match.index);
        const after = message.slice(match.index, match.index + 50);
        const context = (before + " " + after).toLowerCase();

        // Keyword matching for categorization
        const workoutKeywords = [
            "workout",
            "exercise",
            "training",
            "gym",
            "fitness",
            "strength",
        ];
        const mealKeywords = [
            "meal",
            "nutrition",
            "diet",
            "food",
            "recipe",
            "calorie",
            "eating",
        ];

        if (workoutKeywords.some((kw) => context.includes(kw))) {
            displayName = "Workout Plan";
        } else if (mealKeywords.some((kw) => context.includes(kw))) {
            displayName = "Meal Plan";
        }

        results.push({
            fileName,
            url,
            displayName,
        });
    }

    return results;
};










export const bloodWorkPdfMessage = (response: string) => {

    if (!response) return {};
    let isBloodReport = false
    if (response?.includes("Blood") || response?.includes("blood")) {
        isBloodReport = true
    }
    const pdfRegex = /(https?:\/\/[^\s]+\/([^\/]+\.pdf)(\?[^\s]*)?)/i // find URL inside markdown link


    const match = response.match(pdfRegex);




    let beforePdf = "";
    let afterPdf = "";
    let type = isBloodReport
    let displayName = ""; // default if no match

    if (match) {
        const url = match[1];
        const nameFromUrl = "Blood Work";
        displayName = decodeURIComponent(nameFromUrl);

        const parts = response.split(match[0]);



        beforePdf = parts[0]; // replace intro text
        afterPdf = parts[1] || "";
    }


    const bloodResponse = {
        beforePdf,
        afterPdf,
        type: type,
        response: {
            displayName,
            url: match ? match[1] : ""
        }
    }




    return bloodResponse
};




// export const convertSpeechToText = async (formData: any) => {
//     try {
//         const response = await axios.post(
//             "https://api.openai.com/v1/audio/transcriptions",
//             formData,
//             {
//                 headers: {
//                     Authorization: `Bearer ${OPENAIKEY}`,
//                     "Content-Type": "multipart/form-data",
//                 },
//                 maxBodyLength: Infinity,
//             }
//         );
//         console.log("RESPONSE", response);


//         return response.data;
//     } catch (error: any) {
//         console.log("error", error.response?.data || error.message);
//         throw error;
//     }
// };



export const fetchUser = async () => {
    let token = getToken()
    try {
        const response = await fetch(
            "https://one-fitness-api-python-810351594632.us-central1.run.app/api/text-to-speech",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${token}`,
                },

            }
        );
        console.log("RESPONSE", response);

        if (!response.ok) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Something went wrong. Try again"
            })
            throw new Error(`❌ TTS API failed: ${response.status}`);
        }

        return response;
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error",
            text2: "Something went wrong. Try again"
        })
        console.error("TTS Error:", error);
        throw error;
    }
}

export const callTTS = async (text: string, voiceType: string) => {
    let token = await getToken()
    try {
        const response = await fetch(
            "https://one-fitness-api-python-810351594632.us-central1.run.app/api/text-to-speech",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${token}`,
                },
                body: JSON.stringify({
                    text,
                    voice_type: voiceType, // same as in curl
                }),
            }
        );

        // if (!response.ok) {
        //     Toast.show({
        //         type: "error",
        //         text1: "Error",
        //         text2: "Something went wrong. Try again"
        //     })
        //     throw new Error(`❌ TTS API failed: ${response.status}`);
        // }

        // response is probably audio (mp3) — adjust if backend returns JSON
        // const arrayBuffer = await response.arrayBuffer();
        // const audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" });
        // const audioUrl = URL.createObjectURL(audioBlob);
        // console.log("audioURK", audioUrl);

        return response;
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error",
            text2: "Something went wrong. Try again"
        })
        console.error("TTS Error:", error);
        throw error;
    }
};


export const speakWithElevenLabs = async (text: string, voiceType: string) => {

    console.log("VOICE TYPE", voiceType);


    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceType}`,
            {
                method: "POST",
                headers: {
                    "Accept": "audio/mpeg",
                    "Content-Type": "application/json",
                    "xi-api-key": ELEVEN_API_KEY,
                },
                body: JSON.stringify({
                    text,
                    model_id: "eleven_monolingual_v1",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5,
                    },
                }),
            }
        );

        console.log("RESSSPONSEEE", response);



        return response




        //     const arrayBuffer = await response.arrayBuffer();
        //     const buffer = Buffer.from(arrayBuffer);

        //     // Save to file in RN (needs react-native-fs)
        //     const RNFS = require("react-native-fs");
        //     const path = RNFS.DocumentDirectoryPath + "/tts.mp3";
        //     await RNFS.writeFile(path, buffer.toString("base64"), "base64");

        //     // Play the audio (needs react-native-sound)
        //     const Sound = require("react-native-sound");
        //     const sound = new Sound(path, "", (err) => {
        //         if (err) {
        //             console.log("Playback error:", err);
        //             return;
        //         }
        //         sound.play();
        //     });

    } catch (err) {
        console.error("TTS Error:", err);
        return err

    }
};

export const fetchVoices = async () => {
    try {
        const response = await axios.get(`https://api.elevenlabs.io/v1/voices$`, {
            headers: {
                "xi-api-key": ELEVEN_API_KEY,
            },
        });

        return response?.data?.voices;
    } catch (error: any) {
        console.error("Error fetching voices:", error?.response?.data || error.message);
        return [];
    }
};


export const containsPdfLink = (message: string): boolean => {
    const pdfRegex = /(https?:\/\/[^\s]+\.pdf)/gi;
    let value = pdfRegex.test(message);

    console.log("CALUE", value);

    return value
};




export const isValidUSZipCode = (zip: string): boolean => {
    const zipRegex = /^\d{5}$/; // exactly 5 numeric digits
    return zipRegex.test(zip);
};
