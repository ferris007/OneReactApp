import axios from "axios";
// import { useAuth } from "../context/useAuth";
import { getToken } from "./helper";
import { useAuth } from "../context/useAuth";

const sendChatMessage = async () => {
    const { user } = useAuth()
    const token = getToken()
    try {
        const data = {
            client_id: user?.id,
            message: 'What should I eat for my weight loss goals',
            mode: 'chat',
        };

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://one-ai-agent-810351594632.us-central1.run.app/chat',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Client-ID': user?.id,
            },
            data,
        };

        const response = await axios.request(config);
    } catch (error) {
        console.error('Error:', error?.message);
        if (error?.response) {
            console.error('Server Response:', error?.response?.data);
        }
    }
};
