import { useEffect, useState } from "react";
import { privateApi } from "../api";
import {
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

type FileItem = {
  id: number;
  filename: string;
  mime_type: string;
  size: number;
  upload_date: string;
  ref_count: number;
  visibility: string;
  download_count: number;
};

type Props = { 
  refresh: boolean
 };
 

export default function FileList({ refresh }: Props) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const fetchFiles = async () => {
      try {
        const res = await privateApi.get("/files");
        if (!ignore) {
          setFiles(res.data.files || []);
          setError(null);
        }
      } catch (err) {
        setError("Could not load files.");
        console.error(err);
      }
    };
    fetchFiles();
  return () => {
      ignore = true;
    };
  }, [refresh]);

  const handleDelete = async (id: number) => {
    const fileToDelete = files.find((f) => f.id === id);
    if (!fileToDelete) return;
    setError(null);
    setSuccessMessage(null);
    try {
      await privateApi.delete(`/files/${id}`);
      const message =
        fileToDelete.ref_count >= 2
          ? `Duplicate reference to '${fileToDelete.filename}' removed.`
          : `File '${fileToDelete.filename}' has been permanently deleted.`;
      
      setSuccessMessage(message);
      setFiles(files.filter((f) => f.id !== id));
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError("Failed to delete file.");
    }
  };

  const handleVisibility = async (id: number, newVis: string) => {
    setSuccessMessage(null);
    try {
      await privateApi.put(`/files/${id}/visibility`, { visibility: newVis });
      setFiles(
        files.map((f) => (f.id === id ? { ...f, visibility: newVis } : f))
      );
    } catch (err) {
      setError("Failed to update visibility.");
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4 ">📂 Your Files</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {successMessage && <p className="text-green-600 mb-2 font-semibold">{successMessage}</p>}

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full border-collapse hidden md:table">
          <thead className="bg-[#4633FF] text-white">
            <tr>
              <th className="p-3 text-left">Filename</th>
              <th className="p-3 text-left">MIME</th>
              <th className="p-3 text-left">Size</th>
              <th className="p-3 text-left">Uploaded</th>
              <th className="p-3 text-left">Visibility</th>
              <th className="p-3 text-center">Duplicates</th>
              <th className="p-3 text-center">Downloads</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, idx) => (
              <tr
                key={file.id}
                className={`${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-[#4633FF]/5 transition`}
              >
                <td className="p-3 font-medium text-gray-800">
                  {file.filename}
                </td>
                <td className="p-3 text-gray-600">{file.mime_type}</td>
                <td className="p-3 text-gray-600">
                  {(file.size / 1024).toFixed(1)} KB
                </td>
                <td className="p-3 text-gray-600">
                  {new Date(file.upload_date).toLocaleDateString()}
                </td>
                <td
                  className={`p-3 font-semibold capitalize ${
                    file.visibility === "public"
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {file.visibility}
                </td>
                <td className="p-3 text-center">{file.ref_count}</td>
                <td className="p-3 text-center">{file.download_count}</td>
                <td className="p-3 flex items-center justify-center gap-2">
                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
                    title="Delete File"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>

                  {/* Visibility Toggle */}
                  <button
                    onClick={() =>
                      handleVisibility(
                        file.id,
                        file.visibility === "public" ? "private" : "public"
                      )
                    }
                    className="p-2 rounded-full bg-[#9BA8FF] hover:bg-[#7b8eff] text-white"
                    title={
                      file.visibility === "public"
                        ? "Make Private"
                        : "Make Public"
                    }
                  >
                    {file.visibility === "public" ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>

                  {/* Share */}
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `http://localhost:8080/public/${file.id}`
                      )
                    }
                    className="p-2 rounded-full bg-[#4633FF] hover:bg-[#3726d9] text-white"
                    title="Copy Share Link"
                  >
                    <ShareIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-4 mt-4 md:hidden">
        {files.map((file) => (
          <div
            key={file.id}
            className="p-4 border rounded-lg shadow-md bg-white flex flex-col gap-2 hover:border-[#9BA8FF]"
          >
            <div className="font-bold text-[#4633FF]">{file.filename}</div>
            <div className="text-sm text-gray-600">{file.mime_type}</div>
            <div className="text-sm">
              Size: {(file.size / 1024).toFixed(1)} KB
            </div>
            <div className="text-sm">
              Uploaded: {new Date(file.upload_date).toLocaleDateString()}
            </div>
            <div className="text-sm capitalize">
              Visibility:{" "}
              <span
                className={
                  file.visibility === "public"
                    ? "text-green-600 font-semibold"
                    : "text-gray-600 font-semibold"
                }
              >
                {file.visibility}
              </span>
            </div>
            <div className="text-sm">Duplicates: {file.ref_count}</div>
            <div className="text-sm">Downloads: {file.download_count}</div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleDelete(file.id)}
                className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
                title="Delete File"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  handleVisibility(
                    file.id,
                    file.visibility === "public" ? "private" : "public"
                  )
                }
                className="p-2 rounded-full bg-[#9BA8FF] hover:bg-[#7b8eff] text-white"
                title={
                  file.visibility === "public"
                    ? "Make Private"
                    : "Make Public"
                }
              >
                {file.visibility === "public" ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    `http://localhost:8080/public/${file.id}`
                  )
                }
                className="p-2 rounded-full bg-[#4633FF] hover:bg-[#3726d9] text-white"
                title="Copy Share Link"
              >
                <ShareIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
