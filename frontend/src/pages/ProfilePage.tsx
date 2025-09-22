import { useEffect, useState } from "react";
import { privateApi } from "../api";

import {
  UserIcon,
  EnvelopeIcon,
  ServerStackIcon,
  ChartBarIcon,
  ArrowTrendingDownIcon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";

interface UserProfile {
  user_details: {
    username: string;
    email: string;
  };
  storage_stats: {
    total_used: number;
    storage_quota :number;
    original: number;
    savings: number;
    percent: number;
  };
}

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await privateApi.get("/profile");
        setProfileData(response.data);
      } catch (err) {
        setError("Failed to load profile data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading Profile...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  const user = profileData?.user_details;
  const stats = profileData?.storage_stats;
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Information Card */}
        {user && (
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700 border-b pb-2">
              <UserIcon className="w-6 h-6 text-indigo-600" />
              User Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="text-lg font-medium">{user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg font-medium">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Storage Statistics Card */}
        {stats && (
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700 border-b pb-2">
              <ServerStackIcon className="w-6 h-6 text-indigo-600" />
              Storage Statistics
            </h2>
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <CircleStackIcon className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Available storage</p>
                  <p className="text-lg font-medium text-indigo-600">
                    {formatBytes(stats.storage_quota)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ChartBarIcon className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Storage Used</p>
                  <p className="text-lg font-medium text-indigo-600">
                    {formatBytes(stats.total_used)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ServerStackIcon className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">
                    Original Size (before deduplication)
                  </p>
                  <p className="text-lg font-medium">
                    {formatBytes(stats.original)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ArrowTrendingDownIcon className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Storage Saved</p>
                  <p className="text-lg font-medium text-green-600">
                    {formatBytes(stats.savings)} ({stats.percent.toFixed(1)}%)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
