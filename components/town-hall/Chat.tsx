import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, SafeAreaView } from "react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { format } from "date-fns";
import { Feather } from "@expo/vector-icons";
import { apiRequest, queryClient } from "../../lib/queryClient";
import * as Linking from 'expo-linking';
import { useGetChats, useSendMessage } from "../../app/api-calls/Chat/chat";
import Toast from "react-native-toast-message";
import { getLocalId } from "../../app/api-calls/helper";
import { useAuth } from "../../app/context/useAuth";
import { Input } from "../ui/Input";

interface ChatMessage {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
}

function renderContent(content: string) {
  const urlRegex = /(https?:\/\/[^\s]+|\/[^\s]+\.[^\s]+)/g;
  const parts = content.split(urlRegex);

  return parts.map((part, index) => {
    if (
      part.startsWith("http://") ||
      part.startsWith("https://") ||
      part.startsWith("/")
    ) {
      return (
        <Text
          key={index}
          style={styles.linkText}
          onPress={() => Linking.openURL(part)}
        >
          {part}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
}

export function Chat({ onChangeText, message }: any) {
  const { user } = useAuth();

  const { data: messages, isLoading, refetch: refetchChats } = useGetChats()



  const { mutate: sendMessage, isPending } = useSendMessage()


  const sendMessageMutation = (message: string) => {
    let payload = {
      content: message
    }
    sendMessage(payload, {

      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
        // setMessage("");
        refetchChats()

      },

      onError: (err) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Message not sent"
        })
      }
    })
  }


  const handleSubmit = () => {
    if (message.trim()) {
      sendMessageMutation(message);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderItem = async (msg: any) => {
    let userId = await getLocalId()
    console.log("MSGG", msg, userId);

    return (
      <Card
        key={msg.id}
        style={[
          styles.messageCard,
          msg.userId === user?.id || msg.userId === userId ? styles.myMessageCard : styles.otherMessageCard,
        ]}
      >
        <View style={styles.messageHeader}>
          <Text style={styles.username}>{msg.username}</Text>
          <Text style={styles.timestamp}>
            {msg.createdAt
              ? format(new Date(msg.createdAt), "HH:mm")
              : "Invalid time"}
          </Text>
        </View>
        <Text style={styles.messageContent}>{renderContent(msg.content)}</Text>
      </Card>
    )

  }


  return (
    // <>
    <SafeAreaView style={styles.container}>
      <View style={styles.messagesContainer}>
        <View style={styles.messagesContent}>
          {messages?.map((msg: any) => (
            renderItem(msg)
          ))}
        </View>
      </View>
      <View style={styles.inputContainer}>
        {/* <TextInput
          style={styles.textInput}
          value={""}
          onChangeText={(text) => setMessage(text)}
          placeholder="Type your message..."
        /> */}
        <Input
          style={styles.textInput}
          value={message}
          onChangeText={onChangeText}
          placeholder="Type your message..."
        />
        <Button onPress={handleSubmit} style={styles.sendButton}>
          <Feather name="send" size={12} color="white" />
        </Button>
      </View>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },
  container: {
    flex: 1,
    height: 400,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messagesContent: {
    paddingBottom: 10,
  },
  messageCard: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    maxWidth: "80%",
  },
  myMessageCard: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  otherMessageCard: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    alignItems: 'center'
  },
  username: {
    fontWeight: "bold",
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
    marginLeft: 10
  },
  messageContent: {
    fontSize: 14,
  },
  linkText: {
    color: "blue",
    textDecorationLine: "underline",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    height: '100%'
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    // alignItems: 'center',
  },
});
