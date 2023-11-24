"use client";
import React, { useEffect, useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import SpeechToText from "./SpeechToText";

interface WebSocketMessage {
  action: string;
  status?: string;
  progress?: number;
  message?: string;
  cloudinaryUrl?: string;
}

const Hero = () => {
  const [image, setImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [progressMessage, setProgressMessage] = useState("");

  const toastId = useRef<string | undefined>(undefined);

  // useEffect(() => {
  //   const ws = new WebSocket("ws://localhost:8080");

  //   ws.onopen = () => {
  //     console.log("Connected to WebSocket");
  //     // Initialize the process by dismissing any existing toasts
  //     toast.dismiss();
  //   };

  //   ws.onmessage = (event) => {
  //     const message = JSON.parse(event.data);
  //     console.log("Received:", message);

  //     // Handle different WebSocket messages
  //     switch (message.action) {
  //       case "processing":
  //         // Check for a specific status if needed, e.g., generating_image, face_swapping
  //         if (message.status === "generating_image") {
  //           // Update or show toast for generating image
  //           toastId.current = toast.loading(message.message, {
  //             id: toastId.current,
  //           });
  //         } else if (message.status === "face_swapping") {
  //           // Update or show toast for face swapping
  //           toastId.current = toast.loading(message.message, {
  //             id: toastId.current,
  //           });
  //         }
  //         break;
  //       case "completed":
  //         // When completed, show a success toast and dismiss any loading toast
  //         toast.success(message.message, { id: toastId.current });
  //         toast.dismiss(toastId.current); // Make sure to dismiss after showing success
  //         break;
  //       case "error":
  //         // Show error toast
  //         toast.error(message.message, { id: toastId.current });
  //         break;
  //       default:
  //         // Handle any other messages that might be informative but not necessarily errors
  //         break;
  //     }
  //   };

  //   ws.onerror = (error) => {
  //     console.error("WebSocket error:", error);
  //     toast.error("An error occurred with the WebSocket connection.");
  //   };

  //   ws.onclose = () => {
  //     console.log("Disconnected from WebSocket");
  //     // Consider whether you want to show a toast on normal disconnection
  //   };

  //   return () => {
  //     ws.close();
  //   };
  // }, []);

  // Function to handle the API response
  const handleResponse = async (response: any) => {
    if (response.ok) {
      const data = await response.json();

      if (data.cloudinaryUrl) {
        setResultImage(data.cloudinaryUrl);
        toast.dismiss(); // Dismiss the loading toast
        toast.success("Image generation completed!");
      } else {
        console.error("Cloudinary URL not found in response");
      }
    } else {
      toast.dismiss(); // Dismiss the loading toast before displaying the error message
      const error = await response.json();

      if (error.error === "Each image should have exactly one face.") {
        toast.error("Error: Each image should have exactly one face.");
      } else if (
        error.error ===
        "Multiple faces detected. Only single-face detection is supported."
      ) {
        toast.error(
          "Error: Multiple faces detected. Only single-face detection is supported."
        );
      } else if (error.error === "No face detected") {
        toast.error("Error: No face detected in the uploaded image.");
      } else {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred. Please try again later.");
      }
    }
  };

  const handleImageChange = (e: any) => {
    setImage(e.target.files[0]);
    toast.success("Image selected");
    console.log("Image selected:", e.target.files[0]);
  };

  const handlePromptChange = (e: any) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async () => {
    toast.loading("Processing your image...");
    if (!image || !prompt) {
      console.error("Image and prompt are required");
      toast.error("Image and prompt are required");
      return;
    }

    const formData = new FormData();
    formData.append("userImage", image);
    formData.append("prompt", prompt);

    try {
      const response = await fetch(
        "http://localhost:8080/generate-and-swap-face",
        {
          method: "POST",
          body: formData,
        }
      );

      await handleResponse(response);

      if (response.ok) {
        const data = await response.json();

        if (data.cloudinaryUrl) {
          setResultImage(data.cloudinaryUrl);
          toast.dismiss(); // Dismiss the loading toast
          toast.success("Image generation completed!");
        } else {
          console.error("Cloudinary URL not found in response");
        }
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  const handleTranscription = (transcriptionText: string) => {
    setPrompt(transcriptionText);
  };

  useEffect(() => {
    console.log("Result Image updated to:", resultImage); // Log on state update
  }, [resultImage]);

  return (
    <div className="w-full flex justify-center items-center flex-col gap-[3vmin]">
      <Toaster />
      <h1 className="xl:text-3xl lg:text-3xl md:text-2xl sm:text-xl xs:text-lg font-bold text-violet-800">
        Face Swap App
      </h1>
      {error && (
        <div>
          <div className="alert alert-danger">{error}</div>
        </div>
      )}
      {/* upload field */}
      <div className="flex flex-col gap-5 items-center justify-center w-[50%]">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 focus:border-green-600 border-dashed rounded-lg cursor-pointer bg-gray-50  hover:bg-gray-100">
            {image && (
              <div className="flex gap-3">
                <svg
                  className="w-6 h-6 text-violet-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 21 21"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m6.072 10.072 2 2 6-4m3.586 4.314.9-.9a2 2 0 0 0 0-2.828l-.9-.9a2 2 0 0 1-.586-1.414V5.072a2 2 0 0 0-2-2H13.8a2 2 0 0 1-1.414-.586l-.9-.9a2 2 0 0 0-2.828 0l-.9.9a2 2 0 0 1-1.414.586H5.072a2 2 0 0 0-2 2v1.272a2 2 0 0 1-.586 1.414l-.9.9a2 2 0 0 0 0 2.828l.9.9a2 2 0 0 1 .586 1.414v1.272a2 2 0 0 0 2 2h1.272a2 2 0 0 1 1.414.586l.9.9a2 2 0 0 0 2.828 0l.9-.9a2 2 0 0 1 1.414-.586h1.272a2 2 0 0 0 2-2V13.8a2 2 0 0 1 .586-1.414Z"
                  />
                </svg>
                <p className="text-violet-600 font-bold">Image Uploaded</p>
              </div>
            )}
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-violet-600 dark:text-violet-900"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              {image ? (
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click Again</span> to upload
                  or drag and drop
                </p>
              ) : (
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                SVG, PNG or JPG (Image should have good quality)
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
        {/* prompt */}
        <div className="flex justify-center items-center w-full gap-4 p-3">
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-violet-700"
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Enter prompt"
          />
          {/* microphone */}
          <SpeechToText onTranscription={handleTranscription} />
        </div>
        <button
          className="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 border border-violet-900 rounded-lg"
          onClick={handleSubmit}
        >
          Submit
        </button>
        {resultImage && (
          <img
            className="rounded-lg border-3 border-violet-950"
            width={750}
            src={resultImage}
            alt="Result"
          />
        )}
      </div>
    </div>
  );
};

export default Hero;
