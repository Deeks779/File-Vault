import React from 'react';
import type { PublicFileInfo } from '../types';
import {
  DocumentTextIcon,
  PhotoIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  ArrowDownTrayIcon,
  QuestionMarkCircleIcon,
  FolderOpenIcon,
} from '@heroicons/react/24/outline';

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

interface FileIconProps {
  mimeType: string;
}

const FileIcon: React.FC<FileIconProps> = ({ mimeType }) => {
  const iconClasses = "h-8 w-8 text-gray-500";

  if (mimeType.startsWith('image/')) return <PhotoIcon className={iconClasses} />;
  if (mimeType.startsWith('audio/')) return <MusicalNoteIcon className={iconClasses} />;
  if (mimeType.startsWith('video/')) return <VideoCameraIcon className={iconClasses} />;
  if (mimeType === 'application/pdf' || mimeType.includes('document')) return <DocumentTextIcon className={iconClasses} />;
  return <QuestionMarkCircleIcon className={iconClasses} />;
};

interface PublicFilesGridProps {
  files: PublicFileInfo[];
}

const PublicFilesGrid: React.FC<PublicFilesGridProps> = ({ files }) => {
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const [previewFile, setPreviewFile] = React.useState<PublicFileInfo | null>(null);

  const closePreview = () => setPreviewFile(null);

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="min-w-full">
        {/* --- DESKTOP TABLE --- */}
        <table className="min-w-full text-sm divide-y divide-gray-200 hidden md:table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Filename</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Uploader</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Size</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Uploaded</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(files || []).map((file) => (
              <tr key={file.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap flex items-center">
                  <FileIcon mimeType={file.mime_type} />
                  <div className="ml-4 truncate" style={{ maxWidth: '250px' }}>
                    <div className="font-medium text-gray-900">{file.filename}</div>
                    <div className="text-gray-500 text-xs">{file.mime_type}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{file.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatBytes(file.size_bytes)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(file.upload_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <a
                    href={`${apiBaseUrl}/public/${file.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 transition-all"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Download
                  </a>
                  <button
                    onClick={() => setPreviewFile(file)}
                    className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow-sm hover:bg-gray-400 transition-all"
                  >
                    Preview
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* --- MOBILE CARDS --- */}
        <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
          {(files || []).map((file) => (
            <div key={file.id} className="bg-gray-50 rounded-lg shadow p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileIcon mimeType={file.mime_type} />
                  <div className="ml-3">
                    <p className="font-semibold text-gray-800 truncate" style={{ maxWidth: '180px' }}>{file.filename}</p>
                    <p className="text-xs text-gray-500">{file.mime_type}</p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Uploader:</strong> {file.username}</p>
                <p><strong>Size:</strong> {formatBytes(file.size_bytes)}</p>
                <p><strong>Date:</strong> {new Date(file.upload_date).toLocaleDateString()}</p>
              </div>

              <div className="flex space-x-2">
                <a
                  href={`${apiBaseUrl}/public/${file.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 transition-all"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  Download
                </a>
                <button
                  onClick={() => setPreviewFile(file)}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow-sm hover:bg-gray-400 transition-all"
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* --- EMPTY STATE --- */}
        {files.length === 0 && (
          <div className="text-center py-12 px-4">
            <FolderOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No public files</h3>
            <p className="mt-1 text-sm text-gray-500">No files were found. Try refining your search.</p>
          </div>
        )}
      </div>

      {/* --- FILE PREVIEW MODAL --- */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-4 relative">
            <button
              onClick={closePreview}
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 font-bold"
            >
              ✕
            </button>

            {previewFile.mime_type.startsWith("image/") && (
              <img
                src={`${apiBaseUrl}/preview/${previewFile.id}`}
                alt={previewFile.filename}
                className="max-h-[80vh] mx-auto"
              />
            )}

            {previewFile.mime_type === "application/pdf" && (
              <iframe
                src={`${apiBaseUrl}/preview/${previewFile.id}`}
                className="w-full h-[80vh]"
              />
            )}

            {previewFile.mime_type.startsWith("video/") && (
              <video
                controls
                className="w-full max-h-[80vh]"
                src={`${apiBaseUrl}/preview/${previewFile.id}`}
              />
            )}

            {previewFile.mime_type.startsWith("audio/") && (
              <audio
                controls
                className="w-full"
                src={`${apiBaseUrl}/preview/${previewFile.id}`}
              />
            )}

            {!["image/", "video/", "audio/"].some(type => previewFile.mime_type.startsWith(type)) &&
             previewFile.mime_type !== "application/pdf" && (
              <p className="text-center text-gray-500 mt-4">Preview not available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicFilesGrid;
