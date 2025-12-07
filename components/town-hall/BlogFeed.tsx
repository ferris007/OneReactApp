import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { useQuery } from "@tanstack/react-query";
import { BlogPost } from "../../shared/schema";
import { format } from "date-fns";
import { useGetBlog } from "../../app/api-calls/Chat/chat";

export function BlogFeed() {
  const { data: posts, isLoading } = useGetBlog()

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
console.log("POSTS",posts);

  return (
    <ScrollView style={styles.container}>
      {posts?.length > 0 ? posts?.map((post) => (
        <Card key={post.id} style={styles.card}>
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
            <Text style={styles.date}>
              {format(new Date(post.createdAt), "MMM d, yyyy")}
            </Text>
          </CardHeader>
          <CardContent>
            <Text>{post.content}</Text>
          </CardContent>
        </Card>
      )) :
        <Text>No Blog found</Text>
      }
    </ScrollView>
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
  },
  card: {
    marginBottom: 16,
  },
  date: {
    fontSize: 12,
    color: "gray",
    marginTop: 4,
  },
});
