import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { privateApi } from "../api";
import axios from 'axios';
import {
  CloudArrowUpIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";

type Props = {
  onUpload: () => void;
  onUploadProgress: (percent: number) => void;
  onError: (errorMessage: string) => void;
};

export default function FileUpload({ onUpload, onUploadProgress, onError }: Props) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const formData = new FormData();
      acceptedFiles.forEach((file) => formData.append("files", file));

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        },
      };

      try {
        onError(""); 
        await privateApi.post("/upload", formData, config);
        onUpload();
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          onError(error.response.data.error || "An unknown upload error occurred.");
      } else {
        onError("An unknown upload error occurred.");
      }
       console.error("Upload failed:", error);
      } finally {
        onUploadProgress(0);
      }
    },
    [onUpload, onUploadProgress, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="w-full flex flex-col items-center">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 w-full sm:w-3/4 lg:w-1/2 cursor-pointer text-center transition 
          ${
            isDragActive
              ? "border-[#9BA8FF] bg-[#4633FF]/10"
              : "border-gray-300 hover:border-[#9BA8FF] hover:bg-[#4633FF]/5"
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-3">
          {isDragActive ? (
            <CloudArrowUpIcon className="h-14 w-14 text-[#9BA8FF]" />
          ) : (
            <DocumentArrowUpIcon className="h-14 w-14 text-gray-400" />
          )}
          <p className="text-gray-800 font-semibold">
            {isDragActive
              ? "Drop your files here"
              : "Drag & drop files here, or click to select"}
          </p>
          <p className="text-sm text-gray-500">
            Supports multiple files, any format
          </p>
        </div>
      </div>
    </div>
  );
}
