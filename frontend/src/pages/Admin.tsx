import React, { useEffect, useState } from "react";
import { adminApi } from "../api";
import { useAuth } from "../content/AuthContext";

import {
  UsersIcon,
  DocumentIcon,
  CloudIcon,
} from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";

export default function Admin(): React.ReactElement {
  const [files, setFiles] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});

  const { role } = useAuth();

  useEffect(() => {
    if (!role) return;
    // Fetch all files
    adminApi.get("/admin/files").then((res) => {
      setFiles(res.data.files || []);
    });

    // Fetch system stats
    adminApi.get("/admin/stats").then((res) => {
      setStats(res.data || {});
    });
  }, [role]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Panel</h1>

      {/* Stats Section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white shadow rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <UsersIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-lg font-semibold">{stats.total_users || 0}</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full">
            <DocumentIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Files</p>
            <p className="text-lg font-semibold">{stats.total_files || 0}</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <CloudIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Storage</p>
            <p className="text-lg font-semibold">
              {stats.total_storage
                ? (stats.total_storage / 1024).toFixed(1)
                : 0}{" "}
              KB
            </p>
          </div>
        </div>
      </div>

      {/* Files Section */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-700">All Files</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 border">Filename</th>
                <th className="p-3 border">Uploader</th>
                <th className="p-3 border">Downloads</th>
                <th className="p-3 border">Size</th>
              </tr>
            </thead>
            <tbody>
              {files.length > 0 ? (
                files.map((f) => (
                  <tr
                    key={f.id}
                    className="border hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium text-gray-800 flex items-center gap-2">
                      <DocumentIcon className="w-5 h-5 text-blue-500" />
                      {f.filename}
                    </td>
                    <td className="p-3">{f.uploader}</td>
                    <td className="p-3 flex items-center gap-1">
                      <ArrowDownTrayIcon className="w-4 h-4 text-gray-500" />
                      {f.downloadCount}
                    </td>
                    <td className="p-3 text-gray-600">
                      {(f.size / 1024).toFixed(1)} KB
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center text-gray-500 py-6"
                  >
                    No files found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
