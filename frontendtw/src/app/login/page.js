"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default form reload
        setError("");

        try {
            console.log("POSTing to", api.defaults.baseURL + "/auth/login");

            const res = await api.post("/auth/login", { username, password });
            localStorage.setItem("token", res.data.access_token);
            localStorage.setItem("refresh_token", res.data.refresh_token);
            router.push("/");
        } catch (err) {

            setError(error);
            // setError("❌ Invalid username or password.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
                    Login
                </h2>

                {error && (
                    <p className="text-red-600 text-center mb-4 font-semibold">{error}</p>
                )}

                {/* ✅ Wrap inputs in a form */}
                <form onSubmit={handleLogin}>
                    <input
                        className="w-full mb-4 p-2 border border-gray-300 rounded text-gray-800"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input
                        className="w-full mb-6 p-2 border border-gray-300 rounded text-gray-800"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        type="submit" // ✅ Needed for Enter key
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
