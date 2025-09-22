import React, { useState, useEffect, useMemo } from 'react';
import { publicApi } from '../api';
import type { PublicFileInfo } from '../types';
import PublicFilesGrid from '../components/PublicFiles';
import { MagnifyingGlassIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

const GridSkeleton: React.FC = () => {
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow p-4 space-y-3 animate-pulse">
      <div className="flex items-center">
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
        <div className="ml-3 flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded mt-3"></div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
};


const LandingPage: React.FC = () => {
  const [allFiles, setAllFiles] = useState<PublicFileInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchPublicFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await publicApi.get<PublicFileInfo[]>('/files/public');
        setAllFiles(response.data ?? []);
      } catch (err) {
        console.error("Failed to fetch public files:", err);
        setError('Could not load files. Please check your connection and try again later.');
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchPublicFiles();
  }, []);

  const filteredFiles = useMemo(() => {
    if (!searchTerm) {
      return allFiles;
    }
    return allFiles.filter(file =>
      file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.mime_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allFiles, searchTerm]);

  const renderContent = () => {
    if (loading) {
      return <GridSkeleton />;
    }
    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">An error occurred</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      );
    }
    return <PublicFilesGrid files={filteredFiles} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        {/* --- Page Header --- */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
            Explore Public Files
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600">
            Browse and download publicly shared documents, images, and other files.
          </p>
        </div>

        {/* --- Search Bar --- */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="search"
              name="search"
              id="search"
              placeholder="Search by filename, uploader, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            />
          </div>
        </div>

        {/* --- Content Area--- */}
        <div className="mt-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;