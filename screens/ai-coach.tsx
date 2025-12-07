import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Image,
  Alert,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { WebView } from "react-native-webview";
import * as FileSystem from 'expo-file-system';

import { collection, getDocs, orderBy, query } from "firebase/firestore";
import * as WebBrowser from 'expo-web-browser';
import Clipboard from '@react-native-clipboard/clipboard';

import { Sidebar } from "../components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { Feather, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { Label } from "../components/ui/Label";
// import { useAuth } from "../app/context/useAuth";
import { Select } from "../components/ui/Select";
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import type { ImagePickerAsset } from 'expo-image-picker';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { router, useFocusEffect } from "expo-router";
import { useGetConversation, useGetVoiceTypes, useSendAiImageMessage, useSendAiMessage, useSendAiVoiceMessage } from "../app/api-calls/Ai-Coach/agentApis";
import { bloodWorkPdfMessage, callTTS, containsPdfLink, convertSpeechToText, countPdfsInMessage, extractAllPdfDetails, extractPdfDetails, fetchVoices, getToken, speakWithElevenLabs, workoutPdfMessage } from "../app/api-calls/helper";
import axios from "axios";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../firebaseConfig";
import { useUploadBloodConv } from "../app/api-calls/Profile/profile";
import * as DocumentPicker from 'expo-document-picker';
import { useUserDetails } from "../app/api-calls/Auth/auth";
import { useAuth } from "../app/context/useAuth";
import { useConvertSpeechToText, useConvertTextToSpeech } from "../app/api-calls/TTS-STT/tts-sts";
import ChatItem from "./ChatItem";
import { useUserStore } from "../src/utils/zustandStore";
import { useSendOrderGrocery } from "../app/api-calls/Orders";


type Message = {
  question: string;
  answer: string;
  relatedTopics: string[];
  imagePath?: string;
  audioUrl?: string;
};
type AiMessage = {
  id?: string
  bloodWorkQuery?: any
  query: string;
  response: string;
  relatedTopics: string[];
  imagePath?: string;
  audioUrl?: string;
  pdf?: boolean
  pdfDetails?: any
  grocery_list?: any[] | null
  type?: string | null
};

type AIResponse = {
  answer: string;
  relatedTopics: string[];
  audioUrl?: string;
};


export default function AICoach() {
  const flatListRef = useRef<FlatList<any>>(null);
  const { locationEnabled, coords } = useUserStore()
  const { toast } = useToast();
  // const form = useForm<{ question: string }>();
  // const { user: user1 } = useAuth();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<ImagePickerAsset | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [bloodWorkEnabled, setBloodWorkEnabled] = useState<boolean>(false);
  const [voiceType, setVoiceType] = useState(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPreparingRecording, setIsPreparingRecording] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [bloodWork, setBloodWork] = useState<any>(null);
  const [bloodWorkNote, setBloodWorkNote] = useState<string>("");
  const [chatsList, setChatsList] = useState<AiMessage[]>([])
  const [question, setQuestion] = useState<string>("")
  const [isVoiceTranscripting, setIsVoiceTranscripting] = useState<boolean>(false)
  const [chatsLoading, setChatsLoading] = useState<boolean>(false)
  const [isvoiceLoading, setIsVoiceLoading] = useState<boolean>(false)
  const [voiceRecorded, setVoiceRecorded] = useState<boolean>(false)
  const [handoffUrl, setHandoffUrl] = useState<string | null>(null);
  const [height, setHeight] = useState(40); // starting height
  const [moveToTop, setMoveToTop] = useState(false)
  const MAX_HEIGHT = 80;

  const recordingRef = useRef<Audio.Recording | null>(null);


  console.log("CHATS LOADING", chatsLoading, chatsList);


  const { mutate: uploadBloodReports, isPending: bloodReportPending } = useUploadBloodConv()
  const { mutate: sendAiMessage, isPending } = useSendAiMessage()
  // const { mutate: sendAiVoiceMessage, isPending: voiceMessagePending } = useSendAiVoiceMessage()
  const { mutate: sendAiImageMessage, isPending: imageMessagePending } = useSendAiImageMessage()
  const { mutate: convertSpeechToText, isPending: sttPending } = useConvertSpeechToText()
  const { data, refetch, isRefetching } = useUserDetails()
  const { mutate: orderMutation, isPending: orderPendingMutation } = useSendOrderGrocery()

  console.log("orderPendingMutationorderPendingMutation", orderPendingMutation);

  useEffect(() => {
    refetch()
  }, [user])


  console.log("User", user);



  const fetchUsers = async () => {
    setChatsLoading(true)
    try {
      let userID = await AsyncStorage.getItem("userId")

      const usersCol = collection(db, `clients/${user?.id}/chats`)
      console.log("USERRSS COL", usersCol);


      // Add orderBy to sort by createdAt in ascending order
      const q = query(usersCol, orderBy("timestamp", "desc"));
      console.log("USERRSS q", q);

      const userSnapshot = await getDocs(q);
      console.log("USERRSS userSnapshot", userSnapshot);


      const chatsList = userSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          query: data.query ?? "",
          response: data.response ?? "",
          relatedTopics: Array.isArray(data.relatedTopics) ? data.relatedTopics : [],
          imagePath: data.imagePath ?? undefined,
          audioUrl: data.audioUrl ?? undefined,
          grocery_list: data?.grocery_list || null,
          type: data?.type || null
        } as AiMessage;
      });

      console.log("CHATS LIST", chatsList);


      setChatsList(chatsList);
      setChatsLoading(false)
    } catch (error) {
      setChatsLoading(false)

      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Not able to fetch the data"
      })
    }

  }

  // const stopUserLocation = () => {
  //   console.log("locationEnabledlocationEnabled", locationSubscription);

  //   if (locationSubscription) {
  //     locationSubscription.remove();
  //     locationSubscription = null;
  //   } else {
  //     locationSubscription.remove();
  //     locationSubscription = null;
  //   }
  // };

  // const getLocationPosition = async () => {
  //   let locationEnabled = await AsyncStorage.getItem("location")

  //   console.log("locationEnabledlocationEnabled", locationEnabled);

  //   if (locationEnabled) {
  //     locationSubscription = await Location.watchPositionAsync(
  //       {
  //         accuracy: Location.Accuracy.High,
  //         timeInterval: 100000, // every 5 seconds
  //         distanceInterval: 20, // or after 10 meters
  //       },
  //       (loc) => {
  //         const lat = loc.coords.latitude;
  //         const lng = loc.coords.longitude;

  //         setUserLocation({ lat, lng });
  //         let locationLatLng = {
  //           lat: lat,
  //           lng: lng,
  //         }

  //         AsyncStorage.setItem("latLng", JSON.stringify(locationLatLng))
  //         console.log("Updated Location:", lat, lng);
  //       }
  //     );
  //   } else {
  //     stopUserLocation()
  //   }





  // }
  // useFocusEffect(useCallback(() => {
  //   console.log("CALLED LOCATION");

  //   getLocationPosition()

  // }, []))



  useEffect(() => {
    if (chatsList?.length === 0) {
      setChatsLoading(true)
      fetchUsers()
    }



  }, [user?.id]);

  useEffect(() => {
    if (chatsList.length > 0 && moveToTop) {
      flatListRef.current?.scrollToIndex({
        index: 0, // first item (newest since inverted) pmov x
        animated: true,
        viewPosition: 1, // align item to top
      });
      setMoveToTop(false)
    }
  }, [chatsList]);


  console.log("USERR", chatsList);


  const aiMutation =
    async (data: {
      question?: string;
      image?: ImagePickerAsset;
      voiceEnabled?: boolean;
      location?: string;
    }) => {
      setMoveToTop(true)
      console.log("CALLED HOW MANY TIMES");
      let data1 = data

      const needsLocation = containsLocationTerms(data?.question ?? "");
      const hasLocation = coords !== null;
      console.log("HAS LCOATIOn", hasLocation);
      const userId = await AsyncStorage.getItem("userId")



      if (needsLocation && hasLocation) {

        console.log("ENTERED 11111", needsLocation, hasLocation, coords);

        console.log("🌍 Location-based query detected, proceeding without location");
        let payload = {
          message: data?.question,
          client_id: user?.id || userId,
          lat: coords?.lat,
          lng: coords?.lng
          // location: needsLocation && hasLocation ? userLocation : ""
        }

        sendAiMessage(payload, {
          onSuccess: async (data, variables) => {
            const newMessage: Message = {
              question: variables?.message,
              answer: data?.response || "",
              relatedTopics: data?.data?.relatedTopics ?? [],
              imagePath: data?.data?.imagePath ?? undefined,
              audioUrl: data?.data?.audioUrl ?? undefined,
            };
            let pdfDetails = workoutPdfMessage(data?.response)

            const newAiMessage: AiMessage = {

              query: variables?.message,
              response: data?.response || "",
              relatedTopics: data?.data?.relatedTopics ?? [],
              imagePath: data?.data?.imagePath ?? undefined,
              audioUrl: data?.data?.audioUrl ?? undefined,
              pdf: extractPdfDetails(data?.response) ? true : false,
              pdfDetails: pdfDetails
            };


            setChatsList((prev) => [newAiMessage, ...prev])
            setQuestion("")
            // form.reset();
            setImagePreview(null);
            setImageFile(null);
          },
          onError: (error: Error) => {
            console.log("ERROR", error);

            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Failed to get response"
            })
          },
        })

        return
      }
      if (data?.image) {
        const formData = new FormData();
        // formData.append("question", data?.question);
        if (user?.id) {
          formData.append("client_id", user?.id);
        }
        formData.append("image", {
          uri: data?.image.uri,
          name: data?.image.fileName ?? 'image.jpg',
          type: data?.image.mimeType ?? 'image/jpeg',
        } as any);
        // if (needsLocation && userLocation) {
        //   formData.append("location", userLocation);
        // }

        console.log("FORM DATA", formData);


        sendAiImageMessage(formData, {
          onSuccess: async (data, variables) => {
            let obj: { [key: string]: any } = {};
            variables._parts.forEach(([key, value]: any) => {
              obj[key] = value;
            });

            const newMessage: Message = {
              question: data?.variables?.message,
              answer: data?.response || "",
              relatedTopics: data?.data?.relatedTopics ?? [],
              imagePath: data?.data?.imagePath ?? undefined,
              audioUrl: data?.data?.audioUrl ?? undefined,
            };
            let pdfDetails = workoutPdfMessage(data?.response)

            const newAiMessage: AiMessage = {

              query: data1?.image ? "image uploaded" : variables?.message,
              response: data?.response || "",
              relatedTopics: data?.data?.relatedTopics ?? [],
              imagePath: data?.data?.imagePath ?? undefined,
              audioUrl: data?.data?.audioUrl ?? undefined,
              pdf: extractPdfDetails(data?.response) ? true : false,
              pdfDetails: pdfDetails
            };


            setChatsList((prev) => [newAiMessage, ...prev])
            setQuestion("")
            // form.reset();
            setImagePreview(null);
            setImageFile(null);
          },
          onError: (error: Error) => {

            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Failed to get response"
            })
          },

        })
      }
      else if (data?.voiceEnabled) {
        let payload = {
          message: data?.question,
          mode: "chat",
          client_id: user?.id || userId,
          // location: needsLocation && hasLocation ? userLocation : ""


        }

        // sendChatMessage(payload)
        setIsVoiceLoading(true)

        sendAiMessage(payload, {
          onSuccess: async (data, variables) => {

            let pdfCheck = containsPdfLink(data?.response)

            if (pdfCheck) {
              const newAiMessage: AiMessage = {

                query: variables?.message,
                response: data?.response || "",
                relatedTopics: data?.data?.relatedTopics ?? [],
                imagePath: data?.data?.imagePath ?? undefined,
                // audioUrl: response?.url ?? undefined,
                // pdf: extractPdfDetails(data?.response) ? true : false,
                // pdfDetails: pdfDetails
              };




              setChatsList((prev) => [newAiMessage, ...prev])
              setQuestion("")
              setIsVoiceLoading(false)
              setVoiceRecorded(false)


            } else {

              const cleanText = data?.response
                .replace(/[’]/g, "'")
                .replace(/[—–]/g, "-")
                .replace(/\u00A0/g, " "); // replace non-breaking space

              console.log("DATA", data?.response, cleanText);

              let response = await callTTS(cleanText, "QB9QH5k5QaOPBus0hYrh")

              console.log("RESPONSEE", response);

              const blob = await response.blob();

              // Convert blob to base64 (Expo FileSystem needs base64 for binary data)
              const reader = new FileReader();
              reader.readAsDataURL(blob);

              return new Promise<void>((resolve, reject) => {
                reader.onloadend = async () => {
                  try {
                    const base64Data = (reader.result as string).split(",")[1];

                    const newAiMessage: AiMessage = {

                      query: variables?.message,
                      response: data?.response || "",
                      relatedTopics: data?.data?.relatedTopics ?? [],
                      imagePath: data?.data?.imagePath ?? undefined,
                      audioUrl: response?.url ?? undefined,
                      // pdf: extractPdfDetails(data?.response) ? true : false,
                      // pdfDetails: pdfDetails
                    };




                    setChatsList((prev) => [newAiMessage, ...prev])
                    setQuestion("")
                    // Save audio file locally
                    const fileUri = FileSystem.documentDirectory + "speech.mp3";
                    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
                      encoding: FileSystem.EncodingType.Base64,
                    });

                    toggleAudio(fileUri)
                    setVoiceRecorded(false)

                    // Play it with expo-av
                    // const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
                    // await sound.playAsync();
                    resolve();
                    setIsVoiceLoading(false)

                  } catch (err) {
                    setIsVoiceLoading(false)

                    reject(err);
                  }
                };
                reader.onerror = reject;
                setIsVoiceLoading(false)

                return response
              })
            }


            setVoiceRecorded(false)
          },
          onError: (error: Error) => {
            console.log("ERROR", error);
            setIsVoiceLoading(false)
            setVoiceRecorded(false)



            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Failed to get response"
            })
          }, onSettled: () => {

          }
        })
      } else {
        console.log("ENTERED 2222", needsLocation, hasLocation, coords);
        let payload = {
          message: data?.question,
          mode: bloodWorkEnabled ? "bloodwork_upload" : "chat",
          client_id: user?.id || userId,
          // location: needsLocation && hasLocation ? userLocation : ""
        }

        console.log("PAYLOAD", payload);



        sendAiMessage(payload, {
          onSuccess: async (data, variables) => {
            console.log("DATATATA 12345", data);
            const newMessage: Message = {
              question: variables?.message,
              answer: data?.response || "",
              relatedTopics: data?.data?.relatedTopics ?? [],
              imagePath: data?.data?.imagePath ?? undefined,
              audioUrl: data?.data?.audioUrl ?? undefined,
            };
            let pdfDetails = workoutPdfMessage(data?.response?.full_reply || data?.response)

            const newAiMessage: AiMessage = {

              query: variables?.message,
              response: data?.response?.full_reply || data?.response || "",
              relatedTopics: data?.data?.relatedTopics ?? [],
              imagePath: data?.data?.imagePath ?? undefined,
              audioUrl: data?.data?.audioUrl ?? undefined,
              pdf: extractPdfDetails(data?.response?.full_reply || data?.response?.full_reply) ? true : false,
              pdfDetails: pdfDetails,
              grocery_list: data?.response?.grocery_list,
              type: data?.response?.type || ""
            };


            setChatsList((prev) => [newAiMessage, ...prev])
            setQuestion("")
            // form.reset();
            setImagePreview(null);
            setImageFile(null);
          },
          onError: (error: Error) => {
            console.log("ERROR 12345", error);

            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Failed to get response"
            })
          },
        })

      }
    }


  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImagePreview(result.assets[0].uri);
      setImageFile(result.assets[0]);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const resetRecordingState = () => {
    setIsRecording(false);
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(console.error);
      recordingRef.current = null;
    }
  };

  const handleSubmit = () => {
    if ((!question || typeof question !== 'string' || question.trim().length === 0) && imageFile === null) {
      Toast.show({
        text1: "Input Required",
        text2: "Please type your question before submitting.",
        type: "error",
      });
      return;
    }

    aiMutation({
      question: question.trim(),
      image: imageFile || undefined,
      voiceEnabled: voiceRecorded,
    });
  }

  const setupAudioMode = async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      playThroughEarpieceAndroid: false, // false = loudspeaker
    });
  };

  const playAudio = async (url: string, volume: number = 1.0) => {

    await setupAudioMode()





    if (currentSound) {
      await currentSound.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync({ uri: url });
    setCurrentSound(sound);
    await sound.setVolumeAsync(Math.min(Math.max(volume, 0.0), 1.0));
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        setIsPlaying(false);
      }
    });
    setIsPlaying(true);
  };




  const toggleAudio = useCallback(async (audioUrl?: string) => {
    if (!audioUrl) return;

    if (isPlaying && currentSound) {
      await currentSound.pauseAsync();
      setIsPlaying(false);
    } else {
      playAudio(audioUrl);
    }
  }, [chatsList])


  const startRecording = async () => {
    setVoiceRecorded(true)
    // Prevent multiple recordings
    if (isRecording || recordingRef.current) {
      toast({
        title: "Already Recording",
        description: "Please stop the current recording first.",
        variant: "destructive",
      });
      return;
    }

    try {


      // First, check permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        toast({
          title: "Permission Denied",
          description: "Permission to access microphone is required!",
          variant: "destructive",
        });
        return;
      }

      // ⏳ wait a bit so app is fully foreground again
      await new Promise(resolve => setTimeout(resolve, 500));

      // Set audio mode BEFORE creating recording instance
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
      } catch (audioModeError) {
        console.error('Failed to set audio mode:', audioModeError);
        // Try with minimal settings
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: false,
        });
      }

      // Small delay to ensure audio mode is properly set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create new recording instance
      const recording = new Audio.Recording();

      // Show preparing state
      setIsPreparingRecording(true);

      // Prepare recording with basic options
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);

      // Start recording
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      setIsPreparingRecording(false);

      toast({
        title: "Recording",
        description: "Ask your question...",
        variant: 'default',
      });
    } catch (err) {
      console.error('Failed to start recording', err);

      // More specific error handling
      let errorMessage = "Unable to access your microphone";
      if (err instanceof Error) {
        if (err.message.includes('prepare')) {
          errorMessage = "Failed to prepare recording. Please try again.";
        } else if (err.message.includes('permission')) {
          errorMessage = "Microphone permission denied. Please enable in settings.";
        } else if (err.message.includes('audio mode')) {
          errorMessage = "Audio configuration failed. Please try again.";
        } else if (err.message.includes('start')) {
          errorMessage = "Failed to start recording. Please try again.";
        }
      }

      console.error('Recording error details:', err);

      toast({
        title: "Microphone Error",
        description: errorMessage,
        variant: "destructive",
      });

      // Reset recording state
      setIsRecording(false);
      setIsPreparingRecording(false);
      recordingRef.current = null;
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      setIsRecording(false);
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      if (uri) {
        sendAudioToServer(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      toast({
        title: "Recording Error",
        description: "Failed to stop recording. Please try again.",
        variant: "destructive",
      });
    } finally {
      recordingRef.current = null;
    }
  };

  const sendAudioToServer = async (audioUri: string) => {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: audioUri,
        name: 'audio.m4a',
        type: 'audio/m4a',
      } as any);
      formData.append("model", "whisper-1")
      setIsVoiceTranscripting(true)
      // let response = await convertSpeechToText(formData)
      convertSpeechToText(formData, {
        onSuccess: (res) => {
          console.log("RESPONSE", res);

          setQuestion(res?.data.text)
          setIsVoiceTranscripting(false)
        }, onError: (err) => {
          console.log("ERROR", err);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Could not convert speech to text"
          })

        }
      })



      // setQuestion(response?.text)
      // setIsVoiceTranscripting(false)
    } catch (error) {
      console.error("Error sending audio:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process your voice input",
        variant: "destructive",
      });
    }
  };

  const orderGroceryList = async (list: any) => {
    console.log("LIST", list);
    let payload = {
      zip: "94107",
      retailer_preference: ["kroger"],
      items: list,
      client_id: user?.id


    }
    console.log("PAYLOAD", payload);

    orderMutation(payload, {
      onSuccess: async (res) => {
        console.log("RES 111111", res);
        const handoffUrl =
          res?.data?.handoff_url;
        setHandoffUrl(res?.data?.handoff_url)

        // Opens Instacart checkout inside in-app browser
        const result = await WebBrowser.openBrowserAsync(handoffUrl, {
          presentationStyle: "pageSheet", // iOS: opens as modal
          showTitle: true,               // Android: show URL title
          // toolbarColor: "#007BFF",       // Android: custom toolbar color
        });

        console.log("Browser result:", result);
      }, onError: (err) => {
        // Toast.show({
        //   type:'error',text1:"Error",text2:err?.
        // })
        console.log("ERROR 111111", err, err?.response, err?.message);

      }
    })
  }
  // const getUserLocation = async () => {
  //   setIsGettingLocation(true);
  //   let { status } = await Location.requestForegroundPermissionsAsync();
  //   console.log("STATUS", status);

  //   if (status !== 'granted') {
  //     Toast.show({
  //       type: "error",
  //       text1: "Location Permission Denied",
  //       text2: "Permission to access location was denied",
  //     });
  //     setIsGettingLocation(false);
  //     return;
  //   }

  //   let location = await Location.getCurrentPositionAsync({});
  //   const lat = location.coords.latitude;
  //   const lng = location.coords.longitude;
  //   const locationString = `${lat},${lng}`;

  //   setUserLocation({
  //     lat: lat,
  //     lng: lng,
  //   });
  //   setIsGettingLocation(false);

  //   Toast.show({
  //     type: "success",
  //     text2: "Your location will be included in location-based queries.",
  //     text1: 'Location Enabled',
  //   });
  // };

  const containsLocationTerms = (query: string): boolean => {
    const locationTerms = ['near me', 'nearby', 'close to me', 'around me', 'in my area', 'local', 'nearest', 'closest', 'find me a', 'find a'];
    const queryLower = query.toLowerCase();
    return locationTerms.some(term => queryLower.includes(term));
  };

  const presetQuestions = [
    {
      label: "Workout",
      question: "Access your workout plans and routines",
      icon: "dumbbell",
      screen: "/workout"
    },
    {
      label: "Goals",
      question: "Set and track your fitness goals",
      icon: "bullseye",
      screen: "/goals"

    },
    {
      label: "Nutrition",
      question: "Track your meals and nutrition plans",
      icon: "nutritionix",
      screen: "/nutrition"

    },
  ];

  const copyGroceryList = (list: any[]) => {
    const listText = list.map(item => `${item.qty} × ${item.name}`).join("\n");
    Clipboard.setString(listText);
    Toast.show({
      type: "success",
      text1: "Copied",
      text2: "Your grocery list has been copied to clipboard."
    })
  }



  const renderChatItem = useCallback((message1: any, index: number) => {
    let message = message1?.item

    console.log("MESSAGE", message)

    let pdfDetails = workoutPdfMessage(message?.response)
    let pdfCheck = extractPdfDetails(message?.response)
    let bloodTestQuery = message?.bloodWorkQuery
    let pdfCount = countPdfsInMessage(message?.response)
    let pdfArray: any = []
    if (pdfCount > 1) {
      pdfArray = extractAllPdfDetails(message?.response)
    }

    console.log("PDF ARRAY", pdfArray);




    // let bloodcheckpdf = extractPdfDetails(message)
    // let bloodPdfDetails = bloodWorkPdfMessage(message?.response)


    console.log("PDF DETAILS 11111", pdfDetails);
    console.log("pdf Check 11111", pdfCheck);
    console.log("bloodTestQuery 11111", bloodTestQuery);
    // console.log("bloodPdfDetails 11111", bloodPdfDetails);



    return (
      <View style={styles.messageBubbleContainer}>
        {/* My Message */}
        <View style={styles.myMessageBubble}>
          <Text style={styles.messageSender}>{user?.name}</Text>
          {
            bloodTestQuery ?
              <TouchableOpacity>
                <Text>You uploaded blood test {bloodTestQuery?.file?.name} </Text>
              </TouchableOpacity>
              :
              <Text>
                {typeof message?.query === "string"
                  ? message?.query :
                  message?.query?.query ? message?.query?.query :
                    JSON.stringify(message.query)}
              </Text>
          }
          {message?.imagePath && (
            <Image
              source={{ uri: message?.imagePath }}
              style={styles.messageImage}
            />
          )}
        </View>

        {/* ONE's Message */}
        <View style={styles.oneMessageBubble}>
          <View style={styles.oneMessageHeader}>
            <Text style={styles.messageSender}>ONE</Text>
            {message?.audioUrl && (
              <TouchableOpacity
                onPress={() => toggleAudio(message?.audioUrl)}
                style={[styles.audioButton, {
                  // backgroundColor:'red'
                }]}
              >
                {/* {isPlaying ? (
                  <Feather name="play" size={16} color="black" />
                ) : (
                  <Feather name="stop" size={16} color="black" />
                )} */}
              </TouchableOpacity>
            )}
          </View>

          {
            message?.type === "bloodPlans" && pdfArray?.length > 0 ?
              <>
                <View>
                  {/* <Text>Multiple PDFs found:</Text> */}
                  {pdfArray?.map((pdf: any, idx: number) => (
                    <TouchableOpacity
                      key={`${message.id || index}-pdf-${idx}`}
                      onPress={() => {
                        WebBrowser.openBrowserAsync(pdf?.url || "")
                      }}
                      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderWidth: 1, padding: 10, borderRadius: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesome5
                          name={"file-pdf"}
                          size={20}

                        />
                        <Text style={{ maxWidth: "80%", marginLeft: 10 }}>{pdf?.displayName}</Text>
                      </View>
                      <FontAwesome5
                        name={"download"}
                        size={15}

                      />
                    </TouchableOpacity>
                  ))}

                </View>
              </>
              :




              pdfArray?.length > 1 ? (
                <>
                  <View>
                    {/* <Text>Multiple PDFs found:</Text> */}
                    {pdfArray.map((pdf: any, idx: number) => (
                      <TouchableOpacity
                        key={`${message.id || index}-pdf-${idx}`}
                        onPress={() => {
                          WebBrowser.openBrowserAsync(pdf?.url || "")
                        }}
                        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderWidth: 1, padding: 10, borderRadius: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <FontAwesome5
                            name={"file-pdf"}
                            size={20}

                          />
                          <Text style={{ maxWidth: "80%", marginLeft: 10 }}>{pdf?.displayName}</Text>
                        </View>
                        <FontAwesome5
                          name={"download"}
                          size={15}

                        />
                      </TouchableOpacity>
                    ))}

                  </View>
                </>
              ) :






                message?.pdf || pdfCheck ? (
                  <View style={{}}>
                    <Text>{message?.pdfDetails?.beforePdf || pdfDetails?.beforePdf}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        WebBrowser.openBrowserAsync(pdfDetails?.response?.url || "")
                      }}
                      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderWidth: 1, padding: 10, borderRadius: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesome5
                          name={"file-pdf"}
                          size={20}

                        />
                        <Text style={{ maxWidth: "80%", marginLeft: 10 }}>{message?.pdfDetails?.response?.displayName || pdfDetails?.response?.displayName}</Text>
                      </View>
                      <FontAwesome5
                        name={"download"}
                        size={15}

                      />
                    </TouchableOpacity>
                    {message?.pdfDetails?.afterPdf &&

                      <Text>{message?.pdfDetails?.afterPdf}</Text>
                    }
                  </View>
                ) :
                  <Text>
                    {typeof message?.response === "string"
                      ? message?.response :
                      message?.response?.response ? message?.response?.response :
                        JSON.stringify(message?.response)}
                  </Text>

          }
          {message?.grocery_list && message?.grocery_list?.length > 0 ?
            <>
              <View style={{ marginVertical: 4, marginBottom: 10 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 10 }}>Groceries List</Text>
                {message?.grocery_list?.map((item: { name: string, qty: number | string }, index: number) => {

                  return (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginVertical: 8, }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', }}>
                        <Text style={{ maxWidth: "80%" }}>{index + 1}: </Text>
                        <Text style={{ maxWidth: "80%", left: 2 }}>{item?.name}</Text>
                      </View>
                      <Text style={{ marginRight: 5 }}>{item?.qty}</Text>

                    </View>

                  )
                })}
              </View>

              <Button
                onPress={() => copyGroceryList(message?.grocery_list)}
                style={{
                  marginVertical: 10,
                  backgroundColor: "#6C757D"
                }}>
                <Text>Copy Grocery List</Text>
              </Button>
              <Button
                onPress={() => orderGroceryList(message?.grocery_list)}
                style={{
                  marginVertical: 10
                }}>
                {
                  orderPendingMutation ?
                    <ActivityIndicator size={"small"} color={"white"} />
                    :
                    <Text>Order Now</Text>
                }
              </Button>
            </>

            : null

          }
        </View>
      </View>

    )
  }, [chatsList, orderPendingMutation])






  const handleBloodConvMutation = () => {

    console.log("BLOOD WORK Payload", bloodWork,);


    uploadBloodReports(bloodWork, {
      onSuccess: (data, variables) => {
        let obj: { [key: string]: any } = {};
        variables._parts.forEach(([key, value]: any) => {
          obj[key] = value;
        });



        const newAiMessage: AiMessage = {

          query: "",
          bloodWorkQuery: obj,
          response: data?.data?.message || "",
          relatedTopics: data?.data?.relatedTopics ?? [],
          imagePath: data?.data?.imagePath ?? undefined,
          audioUrl: data?.data?.audioUrl ?? undefined,
        };
        setChatsList((prev) => [newAiMessage, ...prev])

        // Toast.show({
        //   type: "success",
        //   text1: "Success",
        //   text2: ""
        // })
      }, onError: (error) => {
        console.log("ERROR", error);

        setBloodWork(null)
        setBloodWorkNote("")
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error?.message
        })
      }
    })


  }




  const handleBloodTestUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets || !result.assets[0]) {
        return;
      }

      const file = result.assets[0];

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      } as any);
      if (user?.id) {
        formData.append('client_id', user?.id);
      }

      setBloodWork(formData);
    } catch (err) {
      console.error("Unknown error:", err);
      toast({
        title: "Error",
        description: "Failed to pick document.",
        variant: "destructive",
      });
    }
  };

  useFocusEffect(
    useCallback(() => {

      return () => {
        if (currentSound) {
          currentSound.stopAsync();
          currentSound.unloadAsync();
          setIsPlaying(false)
        }
      };
    }, [currentSound])
  );
  console.log("USERRRRRRR", user,);


  if (isRefetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // if (handoffUrl) {
  //   return (
  //     <View style={{ flex: 1, alignItems: "center", justifyContent: 'center' }}>
  //       <WebView
  //         source={{ uri: handoffUrl }}
  //         startInLoadingState={true}
  //         renderLoading={() => (
  //           <View style={styles.center}>
  //             <ActivityIndicator size="large" />
  //           </View>
  //         )}
  //       />
  //     </View>
  //   );
  // }
  return (
    <SafeAreaView style={styles.container}>

      {/* <ScrollView
          style={{ flex: 1, height: Dimensions.get("window").height * 1 }}
          contentContainerStyle={{ flexGrow: 1, }}


        > */}

      <View style={styles.mainContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Sidebar />
          <Text style={styles.title}>ONE</Text>
        </View>
        <KeyboardAvoidingView
          style={{ height: Dimensions.get("window").height * 0.8 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.select({ ios: -80, android: 0 }) ?? 0}
        >
          <View
            style={styles.chatContainer}>
            <Card style={styles.chatCard}>

              <CardContent style={styles.chatContent}>
                {
                  chatsLoading ?
                    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>

                      <ActivityIndicator
                        size={"small"}
                        color={"black"}
                      />
                    </View>
                    :
                    chatsList?.length === 0 ?
                      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                        <Text>No previous questions for ONE. Ask away.</Text>
                      </View>
                      :
                      <FlatList
                        removeClippedSubviews
                        windowSize={10}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        ref={flatListRef}
                        nestedScrollEnabled={true}
                        inverted
                        data={chatsList}
                        keyExtractor={(_, index) => index.toString()}
                        // renderItem={({ item, index }) => (
                        //   <ChatItem message={item} index={index} user={user} toggleAudio={toggleAudio} />
                        // )}
                        renderItem={renderChatItem}
                        style={styles.messagesScrollView}
                        contentContainerStyle={{
                          paddingBottom: 20, paddingTop:
                            isPending || bloodReportPending || isvoiceLoading || imageMessagePending ? 40 : 0

                        }}
                      />
                }

                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View style={styles.controlsContainer}>

                    {imagePreview && (
                      <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
                        <TouchableOpacity onPress={clearImage} style={styles.clearImageButton}>
                          <FontAwesome5 name="trash" size={16} color="black" />
                        </TouchableOpacity>
                      </View>
                    )}
                    {bloodWork && (
                      <View style={styles.imagePreviewContainer}>
                        <View
                          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderWidth: 1, padding: 10, borderRadius: 10 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <FontAwesome5
                              name={"file-pdf"}
                              size={20}

                            />
                            <Text style={{ marginLeft: 10 }}>Blood work</Text>
                          </View>

                          <TouchableOpacity onPress={() => setBloodWork(null)} style={[styles.clearImageButton, {
                            right: 5,
                            top: 5
                          }]}>
                            <FontAwesome5 name="trash" size={16} color="black" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {
                      (isPending || bloodReportPending || isvoiceLoading || imageMessagePending) &&
                      <View style={styles.thinkingContainer}>
                        <Text style={styles.thinkingText}>Thinking...</Text>
                      </View>
                    }
                    <View style={styles.inputButtonContainer}>
                      {
                        bloodWork ?
                          <TextInput
                            editable={false}
                            style={styles.textInput}
                            // onBlur={onBlur}
                            onChangeText={(text) => setBloodWorkNote(text)}
                            value={bloodWorkNote}
                            placeholder="Ask about your blood report"
                          /> : (
                            <TextInput
                              multiline
                              value={question}
                              placeholder="Type a message..."
                              style={[
                                styles.textInput,
                                {
                                  maxHeight: MAX_HEIGHT,
                                  minHeight: 60
                                },
                              ]}
                              onChangeText={setQuestion}
                              onContentSizeChange={(event) => {
                                setHeight(event.nativeEvent.contentSize.height);

                              }}
                              scrollEnabled
                            />
                          )
                      }


                      <TouchableOpacity
                        style={{ width: 25, height: 40, alignSelf: 'flex-end', alignItems: 'center', justifyContent: 'center', }}
                        onPress={() => {

                          if (bloodWork !== null) {
                            handleBloodConvMutation()
                            setBloodWork(null)
                            setBloodWorkNote("")
                          }
                          else {
                            handleSubmit()
                          }
                          Keyboard.dismiss()
                        }} disabled={isPending || bloodReportPending || isvoiceLoading || imageMessagePending || isvoiceLoading}>
                        <Feather name="send" size={16} color="black" />
                      </TouchableOpacity>

                    </View>

                    <View style={styles.voiceLocationContainer}>
                      {
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                          <Switch

                            value={bloodWorkEnabled}
                            onValueChange={setBloodWorkEnabled}

                          />
                          <Text style={{ fontSize: 16 }}>Blood</Text>

                          {bloodWorkEnabled &&
                            <TouchableOpacity
                              onPress={handleBloodTestUpload}
                              style={styles.recordingButtonTouchable}>
                              <FontAwesome5
                                name={"paperclip"}
                                size={16}
                                color={"black"}
                              />
                            </TouchableOpacity>
                          }
                        </View>


                      }



                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>

                        {
                          <TouchableOpacity
                            onPress={() => {

                              if (isPlaying) {
                                Toast.show({
                                  type: "error",
                                  text1: "Error",
                                  text2: "Voice is playing already. Please let it finish"
                                })
                              }
                              else if (isvoiceLoading) {
                                Toast.show({
                                  type: "error",
                                  text1: "Error",
                                  text2: "A query is still in progress."
                                })
                              }
                              else {

                                isRecording ? stopRecording() : startRecording()
                              }
                            }}
                            // onLongPress={resetRecordingState}
                            style={[
                              styles.recordingButtonTouchable,
                              isRecording && styles.recordingButton,
                              isPreparingRecording && styles.preparingButton
                            ]}
                            disabled={isPreparingRecording || bloodReportPending}
                          >
                            {sttPending ? (
                              <ActivityIndicator size="small" color="black" />
                            ) : (
                              <Feather name="mic" size={16} color={isRecording ? "red" : "black"} />
                            )}
                          </TouchableOpacity>
                        }
                        <TouchableOpacity
                          style={styles.recordingButtonTouchable}
                          // disabled={bloodWorkEnabled}
                          onPress={() => {
                            if (bloodWorkEnabled) {
                              Toast.show({
                                type: "info",
                                text1: "Warning",
                                text2: "Image cannot be uploaded in blood mode"
                              })
                              return
                            } else {

                              handleImageUpload()
                            }
                          }} >
                          <Feather name="image" size={16} color="black" />
                        </TouchableOpacity>


                      </View>
                    </View>


                  </View>
                </TouchableWithoutFeedback>
              </CardContent>
            </Card>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View
                style={{ marginTop: 10, height: Dimensions.get("window").height * 0.15, }}
              >
                <View style={styles.quickAccessContainer}>
                  {presetQuestions.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.quickAccessCard}
                      onPress={() => router?.push(item.screen)}
                    >
                      <CardContent style={styles.quickAccessCardContent}>
                        <FontAwesome5 name={item.icon} size={24} color="black" />
                        <Text style={styles.quickAccessCardTitle}>{item.label}</Text>
                        <Text style={styles.quickAccessCardDescription}>{item.question}</Text>
                      </CardContent>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </KeyboardAvoidingView>
        {/* </ScrollView> */}
      </View>
      {/* </ScrollView> */}
      {/* </KeyboardAvoidingView> */}
    </SafeAreaView >

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,

  },
  mainContent: {
    // flex: 1,
    padding: 16,
    height: Dimensions.get("window").height * 1
    // marginLeft: 64, // Adjust based on sidebar width
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 8,
  },
  chatContainer: {
    flex: 1,
    height: Dimensions.get("window").height * 0.8

  },
  chatCard: {
    flex: 1,
    height: "100%",
    borderWidth: 1,
    borderColor: 'red'
  },
  chatContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  messagesScrollView: {
    flex: 1,
    paddingRight: 10,
  },
  messageBubbleContainer: {
    marginBottom: 10,
  },
  myMessageBubble: {
    backgroundColor: "#DCF8C6",
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-end",
    maxWidth: "90%",
  },
  oneMessageBubble: {
    backgroundColor: "#E5E7EB",
    padding: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    maxWidth: "90%",
    marginTop: 5,
  },
  messageSender: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  messageImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginTop: 10,
  },
  oneMessageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  audioButton: {
    padding: 5,
  },
  thinkingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  thinkingText: {
    marginLeft: 5,
    color: "gray",
  },
  controlsContainer: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  voiceLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10
  },
  switchLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  label: {
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  locationButton: {
    borderWidth: 1,
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    borderRadius: 8,
  },
  locationEnabledButton: {
    borderWidth: 1,
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#007BFF"
  },
  locationButtonText: {
    color: "black",
  },
  locationEnabledButtonText: {
    color: "white",
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 10,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  clearImageButton: {
    position: "absolute",
    top: -10,
    right: -10,
    // backgroundColor: "red",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  inputButtonContainer: {
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 10,

  },
  textInput: {
    flex: 1,
    // borderWidth: 1,
    // borderColor: "gray",
    // borderRadius: 8,
    // paddingHorizontal: 10,s

  },
  recordingButton: {
    backgroundColor: "#FFCCCC",
  },
  recordingButtonTouchable: {
    // padding: 10,
    borderWidth: 1,
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'white'
  },
  preparingButton: {
    backgroundColor: "#F0F0F0",
    opacity: 0.7,
  },
  quickAccessContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    // marginTop: 20,
  },
  quickAccessCard: {
    width: "30%", // Adjust as needed
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "red",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  quickAccessCardContent: {
    padding: 15,
    alignItems: "center",
  },
  quickAccessCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  quickAccessCardDescription: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
    marginTop: 5,
  },
  recordingTip: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 5,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 6
  },
});
