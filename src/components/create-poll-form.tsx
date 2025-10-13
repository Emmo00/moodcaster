"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuickAuth } from "@/hooks/useQuickAuth";
import Navbar from "./Navbar";

export function CreatePollForm() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { authenticatedUser, getToken } = useQuickAuth();

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check if user is authenticated
    if (!authenticatedUser) {
      setError("You must be signed in to create a poll");
      return;
    }

    // Validation
    if (!question.trim()) {
      setError("Question is required");
      return;
    }

    if (question.length > 120) {
      setError("Question must be 120 characters or less");
      return;
    }

    const filledOptions = options.filter((opt) => opt.trim());
    if (filledOptions.length < 2) {
      setError("At least 2 options are required");
      return;
    }

    setLoading(true);

    try {
      // Get the authentication token
      const token = await getToken();
      if (!token) {
        setError("Authentication token not found. Please sign in again.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          question: question.trim(),
          options: filledOptions,
          fid: authenticatedUser.fid,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/poll/${data.poll.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create poll");
        setLoading(false);
      }
    } catch (err) {
      console.error("[v0] Error creating poll:", err);
      setError("An error occurred");
      setLoading(false);
    }
  };

  const colors = ["bg-cyan-300", "bg-yellow-300", "bg-pink-300", "bg-lime-300"];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-12 pt-24">
        <div className="mb-8 border-4 border-black bg-orange-300 p-8">
          <h1 className="font-mono text-3xl font-black uppercase text-black">Create New Poll</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Question Input */}
          <div>
            <label className="mb-3 block font-mono text-lg font-bold uppercase text-black">
              Poll Question
              <span className="ml-2 text-sm text-black">({question.length}/120)</span>
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={120}
              placeholder="What's your question?"
              className="w-full border-4 border-black bg-white px-4 py-4 font-mono text-lg font-bold uppercase placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-black text-black"
            />
          </div>

          {/* Options */}
          <div>
            <label className="mb-3 block font-mono text-lg font-bold uppercase text-black">Options</label>
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className={`flex-1 border-4 border-black ${
                      colors[index % colors.length]
                    } px-4 py-4 font-mono text-lg font-bold uppercase placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-black text-black`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="border-4 border-black bg-red-400 px-4 font-mono text-xl font-black uppercase transition-transform hover:translate-x-1 hover:translate-y-1 text-black"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 4 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-4 border-4 border-black bg-gray-200 px-6 py-3 font-mono font-bold uppercase transition-transform hover:translate-x-1 hover:translate-y-1 text-black"
              >
                + Add Option
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="border-4 border-black bg-red-300 p-4">
              <p className="font-mono font-bold uppercase text-black">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full border-4 border-black bg-lime-400 px-8 py-6 font-mono text-2xl font-black uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-2 hover:translate-y-2 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black"
          >
            {loading ? "Creating..." : "Create Poll"}
          </button>
        </form>
      </main>
    </div>
  );
}
