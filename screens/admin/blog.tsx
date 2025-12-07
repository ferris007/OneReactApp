import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Sidebar } from "../../components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BlogPost } from "../../shared/schema";
import { Feather } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/Dialog";
import { useForm, Controller } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/Form";
import { useToast } from "../../hooks/use-toast";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { format } from "date-fns";

type FormData = {
  title: string;
  content: string;
};

export default function AdminBlog() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/blog", data);
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({
        title: "Success",
        description: "Blog post created successfully",
        variant: 'default',
      });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createPostMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Sidebar />
      <ScrollView style={styles.mainContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Blog Management</Text>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <Button>
                <Feather size={16} color="white" />
                <Text style={styles.buttonText}>Create Post</Text>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Blog Post</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <View style={styles.formSpace}>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter content" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    onPress={form.handleSubmit(onSubmit)}
                    disabled={createPostMutation.isPending}
                    style={styles.submitButton}
                  >
                    {createPostMutation.isPending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.buttonText}>Create Post</Text>
                    )}
                  </Button>
                </View>
              </Form>
            </DialogContent>
          </Dialog>
        </View>

        <View style={styles.postsContainer}>
          {posts?.map((post) => (
            <Card key={post.id} style={styles.postCard}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <Text style={styles.postDate}>
                  {format(new Date(post.createdAt), "MMMM d, yyyy")}
                </Text>
              </CardHeader>
              <CardContent>
                <Text>{post.content}</Text>
              </CardContent>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
  },
  mainContent: {
    flex: 1,
    padding: 16,
    marginLeft: 64, // Adjust based on sidebar width
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  formSpace: {
    gap: 15,
  },
  submitButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  postsContainer: {
    marginTop: 20,
  },
  postCard: {
    marginBottom: 15,
  },
  postDate: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
  },
});
