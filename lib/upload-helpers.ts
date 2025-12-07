import type { DocumentPickerAsset } from "expo-document-picker";
import { apiRequest } from "./queryClient";
import http from "../app/api-calls/http";

export const validateFile = (
  file: DocumentPickerAsset,
  allowedTypes: string[],
  maxSize: number
) => {
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  const fileType = file.mimeType;

  const isAllowedType = allowedTypes.some((type) => {
    if (type.startsWith(".")) {
      // Match by extension, e.g., ".jpg"
      return fileExtension ? `.${fileExtension}` === type : false;
    }
    // Match by mime type, e.g., "image/jpeg" or just "image"
    return fileType ? fileType.includes(type) : false;
  });

  if (!isAllowedType) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  if (typeof file.size === "number" && file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Max size: ${Math.round(
        maxSize / (1024 * 1024)
      )} MB`,
    };
  }

  return { valid: true, error: null };
};

export const uploadFile = async (
  url: string,
  file: DocumentPickerAsset,
  additionalData: Record<string, string> = {}
) => {
  const formData = new FormData();
  // The `as any` is a common workaround for React Native's FormData implementation
  formData.append("file", {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as any);

  Object.keys(additionalData).forEach((key) => {
    formData.append(key, additionalData[key]);
  });

  const { data } = await http.post(url, formData);



  return data;
};
