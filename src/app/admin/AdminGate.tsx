"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "admin_authenticated";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthenticated(true);
    }
    setChecking(false);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, password);
      setAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password.");
    }
  }

  if (checking) return null;

  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-1 text-center">Admin Access</h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Enter the password to continue.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
          />
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            className="w-full text-white font-medium py-2.5 rounded-lg mt-4 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#D4A843" }}
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
