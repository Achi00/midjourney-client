"use client";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

interface WebSocketMessage {
  action: string;
  message?: string;
  resultImage?: string;
  // Include other properties that your WebSocket messages may have
}

const Hero = () => {
  const [image, setImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentProgress, setCurrentProgress] = useState<string | null>(null);

  console.log(resultImage);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received:", message);

      if (message.action === "completed" && message.cloudinaryUrl) {
        setResultImage(message.cloudinaryUrl);
        setCurrentProgress(message.message);
      } else {
        // Generalize message handling
        let newMessage = "";
        if (message.action === "imagine" && message.progress) {
          newMessage = `Progress: ${message.progress}`;
        } else if (message.message) {
          newMessage = message.message;
        }

        setCurrentProgress(newMessage);
      }

      // Update WebSocket messages state
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleImageChange = (e: any) => {
    setImage(e.target.files[0]);
    toast.success("Image selected:", e.target.files[0]);
    console.log("Image selected:", e.target.files[0]);
  };

  const handlePromptChange = (e: any) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async () => {
    if (!image || !prompt) {
      console.error("Image and prompt are required");
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

      if (!response.ok) {
        throw new Error("Server responded with an error!");
      }

      const data = await response.json();
      console.log("Fetch response data:", data); // Log the entire response data

      if (data.cloudinaryUrl) {
        setResultImage(data.cloudinaryUrl);
      } else {
        console.error("Cloudinary URL not found in response");
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  useEffect(() => {
    console.log("Result Image updated to:", resultImage); // Log on state update
  }, [resultImage]);

  return (
    <div>
      <Toaster />
      <h1>Face Swap App</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <input
        type="text"
        value={prompt}
        onChange={handlePromptChange}
        placeholder="Enter prompt"
      />
      <button onClick={handleSubmit}>Generate and Swap</button>
      {resultImage && <img src={resultImage} alt="Result" />}

      <div>
        <h2>WebSocket Messages:</h2>
        {currentProgress && (
          <div>
            <strong>{currentProgress}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
