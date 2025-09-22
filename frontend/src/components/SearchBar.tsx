import { useState } from "react";
import { privateApi } from "../api";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";

type Props = { setResults: (r: any[]) => void };

export default function SearchBar({ setResults }: Props) {
  const [query, setQuery] = useState("");
  const [advanced, setAdvanced] = useState(false);

  // Advanced filter states
  const [filename, setFilename] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [sizeMin, setSizeMin] = useState("");
  const [sizeMax, setSizeMax] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleSimpleSearch = async () => {
    const res = await privateApi.get(`/search?filename=${query}`);
    setResults(res.data.results || []);
  };

  const handleAdvancedSearch = async () => {
    const params = new URLSearchParams();
    if (filename) params.append("filename", filename);
    if (mimeType) params.append("mime", mimeType);
    if (sizeMin) params.append("minSize", sizeMin);
    if (sizeMax) params.append("maxSize", sizeMax);
    if (dateFrom) params.append("startDate", dateFrom);
    if (dateTo) params.append("endDate", dateTo);

    const res = await privateApi.get(`/search?${params.toString()}`);
    setResults(res.data.results || []);
  };

  return (
    <div className="mt-6">
      {!advanced ? (
        // --- Simple Search ---
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border border-gray-300 pl-10 p-2 rounded-lg w-full focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Search by filename..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSimpleSearch}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Search</span>
            </button>
            <button
              onClick={() => setAdvanced(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
            >
              <FunnelIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Advanced</span>
            </button>
          </div>
        </div>
      ) : (
        // --- Advanced Search ---
        <div className="border rounded-lg p-4 bg-white shadow-md flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Filename"
              className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <input
              value={mimeType}
              onChange={(e) => setMimeType(e.target.value)}
              placeholder="MIME Type (e.g. image/png)"
              className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="number"
              value={sizeMin}
              onChange={(e) => setSizeMin(e.target.value)}
              placeholder="Min Size (bytes)"
              className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <input
              type="number"
              value={sizeMax}
              onChange={(e) => setSizeMax(e.target.value)}
              placeholder="Max Size (bytes)"
              className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <button
              onClick={handleAdvancedSearch}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition w-full"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              Search
            </button>
            <button
              onClick={() => setAdvanced(false)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition w-full"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
