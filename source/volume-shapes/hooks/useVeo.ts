
import { useState, useCallback } from 'react';
import { generateVideo, pollVideoStatus } from '../services/geminiService';

const POLLING_INTERVAL_MS = 10000;

const LOADING_MESSAGES = [
    "Warming up the digital director's chair...",
    "Scripting the first few scenes...",
    "Casting pixels for their big roles...",
    "Adjusting the virtual lighting...",
    "Rendering opening credits... this might take a moment.",
    "The digital film is developing, please wait...",
    "Finalizing the special effects...",
    "The premiere is just a few minutes away!",
];

export const useVeo = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

    const generate = useCallback(async (
        file: File,
        prompt: string,
        aspectRatio: '16:9' | '9:16'
    ) => {
        setIsLoading(true);
        setVideoUrl(null);
        setError(null);
        
        let messageIndex = 0;
        setLoadingMessage(LOADING_MESSAGES[messageIndex]);
        const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
            setLoadingMessage(LOADING_MESSAGES[messageIndex]);
        }, 5000);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64data = (reader.result as string).split(',')[1];
                let operation = await generateVideo(base64data, file.type, prompt, aspectRatio);

                while (!operation.done) {
                    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
                    try {
                        operation = await pollVideoStatus(operation);
                    } catch(pollError: any) {
                         if (pollError.message.includes("Requested entity was not found.")) {
                            throw new Error("API key is invalid or missing permissions. Please select a valid API key.");
                         }
                         throw pollError;
                    }
                }
                
                const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                if (downloadLink && process.env.API_KEY) {
                    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                    const videoBlob = await videoResponse.blob();
                    const url = URL.createObjectURL(videoBlob);
                    setVideoUrl(url);
                } else {
                    throw new Error("Video generation succeeded but no download link was found.");
                }
            };
            reader.onerror = () => {
                throw new Error("Failed to read the uploaded file.");
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "An unknown error occurred during video generation.");
        } finally {
            setIsLoading(false);
            clearInterval(messageInterval);
        }
    }, []);
    
    const reset = useCallback(() => {
        setVideoUrl(null);
        setError(null);
        setIsLoading(false);
    }, []);

    return { isLoading, videoUrl, error, loadingMessage, generate, reset };
};
