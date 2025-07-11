"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/config/api";
import { logout } from "@/lib/auth";

export default function Home() {
    const router = useRouter();
    const [state, setState] = useState("TX");
    const [top, setTop] = useState(5);
    const [plants, setPlants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [file, setFile] = useState(null);
    // const [availableStates, setAvailableStates] = useState<string[]>([]);
    const [availableStates, setAvailableStates] = useState([]);

    const FALLBACK_STATES = ["TX", "CA", "NC", "NY", "FL"];

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const loadStates = async () => {
            try {
                const res = await api.get(API_ENDPOINTS.FETCH_STATES);
                const data = res.data;
                if (Array.isArray(data) && data.length > 0) {
                    setAvailableStates(data);
                } else {
                    setAvailableStates(FALLBACK_STATES);
                }
            } catch (err) {
                console.warn("Failed to load states from backend, using fallback.");
                setAvailableStates(FALLBACK_STATES);
            }
        };

        loadStates();
    }, [router]);

    const fetchPlants = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(API_ENDPOINTS.FETCH_PLANTS(state, top));
            setPlants(response.data);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch data. Are you logged in?");
            if (err.response?.status === 401) router.push("/login");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async () => {
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await api.post(API_ENDPOINTS.UPLOAD_FILE, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("✅ File uploaded successfully to S3!");
            console.log("S3 Response:", res.data);
        } catch (err) {
            console.error("Upload failed", err);
            alert("❌ File upload failed.");
        }
    };

    const handleSync = async () => {
        try {
            await api.get(API_ENDPOINTS.SYNC_FROM_S3());
            alert("Data synchronized from S3 successfully");
            window.location.reload();
        } catch (error) {
            console.error("Sync failed", error);
            alert("Sync failed");
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6 relative">
            {/* Logout Button */}
            <button
                onClick={logout}
                className="absolute top-4 right-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
            >
                Logout
            </button>

            <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-4xl text-gray-800">
                <h1 className="text-3xl font-bold text-blue-800 mb-6 text-left">
                    Upload Power Plant Data
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="col-span-2 border border-gray-300 px-4 py-2 rounded text-gray-700"
                    />
                    <button
                        onClick={handleFileUpload}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
                    >
                        Upload File
                    </button>
                    <div className="flex justify-start mb-10">
                        <button
                            onClick={handleSync}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
                        >
                            Sync from S3
                        </button>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-left text-purple-800 mb-6">
                    Power Plant Visualizer
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <select
                        className="border border-gray-300 rounded px-4 py-2 text-blue-800 font-medium"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                    >
                        {availableStates.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        min="1"
                        className="border border-gray-300 rounded px-4 py-2 text-blue-800 font-medium"
                        value={top}
                        onChange={(e) => setTop(e.target.value)}
                        placeholder="Top N"
                    />

                    <button
                        onClick={fetchPlants}
                        className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-4 py-2 rounded font-semibold shadow-md transition"
                    >
                        Fetch Data
                    </button>
                </div>

                {error && <p className="text-red-600 mb-4 font-semibold">{error}</p>}

                <div className="overflow-x-auto rounded-lg shadow">
                    <table className="min-w-full table-auto text-sm text-left text-gray-700">
                        <thead className="bg-blue-100 text-blue-800 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-6 py-3">Power Plant</th>
                            <th className="px-6 py-3">Generation (MWh)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr key="loading">
                                <td colSpan="2" className="px-6 py-4 text-center italic text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : plants.length > 0 ? (
                            plants.map((plant, index) => (
                                <tr
                                    key={plant.id || index}
                                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                >
                                    <td className="px-6 py-4">{plant.name}</td>
                                    <td className="px-6 py-4 font-semibold text-blue-700">
                                        {typeof plant.netGeneration === "number"
                                            ? plant.netGeneration.toLocaleString()
                                            : "N/A"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr key="no-data">
                                <td colSpan="2" className="px-6 py-4 text-center text-gray-400 italic">
                                    No data. Click “Fetch Data” above.
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
