"use client";
// import { sendAudioToServer } from "@/utils";
import toast, { Toaster } from "react-hot-toast";
import React, { useState } from "react";

const SpeechToText = (props: any) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      toast.success("Recording started");
      toast.custom(
        (t) => (
          <div
            className={`toast flex justify-center items-center ${
              t.visible ? "animate-enter" : "animate-leave"
            }`}
          >
            <div className="visualizer-container">
              <div className="visualizer-bar"></div>
              <div className="visualizer-bar"></div>
              <div className="visualizer-bar"></div>
              <div className="visualizer-bar"></div>
              <div className="visualizer-bar"></div>
              <div className="visualizer-bar"></div>
              <div className="visualizer-bar"></div>
              <div className="visualizer-bar"></div>
              {/* Add more bars if needed */}
            </div>
          </div>
        ),
        {
          duration: Infinity, // Keep the toast visible while recording
        }
      );
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const newMediaRecorder = new MediaRecorder(stream);
      console.log(`Recording MIME type: ${newMediaRecorder.mimeType}`);
      newMediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prevAudioChunks) => [...prevAudioChunks, event.data]);
          console.log("Chunk of audio data received", event.data);
        } else {
          console.log("No audio chunks");
        }
      };

      newMediaRecorder.start();
      setMediaRecorder(newMediaRecorder); // Use the setter function
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  async function sendAudioToServer(audioBlob: Blob) {
    const formData = new FormData();
    formData.append("audioFile", audioBlob, "recording.webm");

    try {
      const response = await fetch("http://localhost:8080/transcribe-audio", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("Transcription:", data.transcription);
      // Handle the transcription data as needed
      props.onTranscription(data.transcription);
    } catch (error) {
      console.error("Error sending audio to the server:", error);
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prevAudioChunks) => {
            const updatedChunks = [...prevAudioChunks, event.data];
            const audioBlob = new Blob(updatedChunks, {
              type: "audio/webm;codecs=opus",
            });
            if (audioBlob.size > 0) {
              console.log("Audio Blob created", audioBlob);
              sendAudioToServer(audioBlob).catch(console.error);
              setIsRecording(false);
            } else {
              console.error("No audio recorded");
            }
            return [];
          });
        }
      };
      toast.dismiss();
      setIsRecording(false);
      mediaRecorder.stop();
    } else {
      console.log("MediaRecorder not initialized");
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div>
      <div className="flex justify-center items-center gap-2">
        <Toaster />
        <div className="flex gap-1">
          <button onClick={toggleRecording}>
            <div className="bg-violet-500 cursor-pointer hover:bg-violet-700 p-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                {" "}
                <path
                  d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"
                  fill="#fff"
                ></path>{" "}
                <path
                  d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"
                  fill="#fff"
                ></path>{" "}
              </svg>
            </div>
          </button>
          <p>{isRecording ? "Stop Recording" : "Use Mic"}</p>
        </div>
      </div>
      {isRecording && <p>Recording...</p>}
    </div>
  );
};

export default SpeechToText;
