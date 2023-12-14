"use client";
import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import SpeechToText from "./SpeechToText";
import TermsModal from "./TermsModal";

const Hero = () => {
  const [image, setImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const passcodeInputRef = useRef<HTMLInputElement>(null);

  const verifyPasscode = async () => {
    try {
      if (!passcode) {
        toast.error("Please enter password");
      } else {
        const response = await fetch(
          "https://abovedigital-1696444393502.ew.r.appspot.com/verify-passcode",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ passcode }),
          }
        );
        if (response.ok) {
          setIsAuthorized(true);
          if (passcodeInputRef.current) {
            passcodeInputRef.current.style.border = "initial"; // Reset to initial style
          }
          toast.success("Access granted");
        } else {
          toast.error("Access denied");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    }
  };

  // Function to handle the API response
  const handleResponse = async (response: any) => {
    if (response.ok) {
      const data = await response.json();
      if (data.imageUrl) {
        setResultImage(data.imageUrl);
        toast.dismiss(); // Dismiss the loading toast
        toast.success("Image generation completed!");
      } else {
        console.error("URL not found in response");
        toast.error("An error occurred while processing the image.");
      }
    } else {
      toast.dismiss(); // Dismiss the loading toast before displaying the error message
      const errorData = await response.json();

      // Check for nested error structure
      const errorMessage =
        errorData.error && errorData.error.error
          ? errorData.error.error
          : errorData.error;

      switch (errorMessage) {
        case "Each image should have exactly one face.":
          toast.error("Error: Each image should have exactly one face.");
          break;
        case "Multiple faces detected. Only single-face detection is supported.":
          toast.error(
            "Error: Multiple faces detected. Only single-face detection is supported."
          );
          break;
        case "No face detected":
          toast.error("Error: No face detected in the uploaded image.");
          break;
        default:
          console.error("Unexpected error:", errorData);
          toast.error("An unexpected error occurred. Please try again later.");
          break;
      }
    }
  };
  // check name and email
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // chack image
  const handleImageChange = (e: any) => {
    setImage(e.target.files[0]);
    toast.success("Image selected");
  };

  const handlePromptChange = (e: any) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async () => {
    // Check if all required fields are filled
    if (!name || !email || !image || !prompt) {
      toast.error("All fields are required");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email address");
      return;
    }

    // Only show the loading toast after passing the validation checks
    toast.loading("Processing your image...");

    const formData = new FormData();
    formData.append("userImage", image);
    formData.append("prompt", prompt);
    formData.append("name", name);
    formData.append("email", email);

    try {
      const response = await fetch(
        "https://abovedigital-1696444393502.ew.r.appspot.com/generate-and-swap-face",
        {
          method: "POST",
          body: formData,
        }
      );

      await handleResponse(response);
    } catch (error) {
      console.error("Request failed:", error);
      toast.error("An error occurred while processing your request.");
    }
  };

  const handleTranscription = (transcriptionText: string) => {
    setPrompt(transcriptionText);
  };

  const authorizeError = () => {
    toast.error("Please authorize first");
    if (passcodeInputRef.current) {
      passcodeInputRef.current.style.border = "2px solid red";
      passcodeInputRef.current.focus();
    }
  };

  return (
    <div className="w-full flex justify-center items-center flex-col gap-[3vmin]">
      <Toaster />
      <h1 className="xl:text-3xl lg:text-3xl md:text-2xl sm:text-xl xs:text-lg font-bold text-violet-800">
        Face Swap App
      </h1>
      <h1 className="xl:text-md lg:text-md md:text-md sm:text-sm xs:text-sm font-slim text-violet-800">
        Generate image in 60 seconds
      </h1>
      <div className="w-1/4">
        <div
          role="alert"
          className="relative flex w-full px-4 py-4 text-base text-violet-800 rounded-lg border-2 border-violet-800 font-regular"
        >
          <div className="shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              ></path>
            </svg>
          </div>
          <div className="ml-3 mr-12">
            Make sure nothing is covering your face
          </div>
        </div>
      </div>
      {error && (
        <div>
          <div className="alert alert-danger">{error}</div>
        </div>
      )}
      {/* password */}
      <div className="flex flex-col items-center justify-center gap-3">
        <h1>Please verify password</h1>
        <div className="flex gap-6 h-15">
          <input
            type="password"
            ref={passcodeInputRef}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-violet-700"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
          />
          <button
            className="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 border border-violet-900 rounded-lg text-sm"
            onClick={verifyPasscode}
          >
            Verify Password
          </button>
        </div>
      </div>
      <div className="flex">
        <TermsModal />
      </div>
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
                <p className="mb-2 p-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click Again</span> to upload
                  or drag and drop
                </p>
              ) : (
                <p className="mb-2 p-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
              )}
              <p className="text-xs p-2 text-gray-500 dark:text-gray-400">
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
        <div className="flex justify-center xl:flex-row lg:flex-row md:flex-row sm:flex-row xs:flex-col items-center w-full gap-4 p-3">
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-violet-700"
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Enter prompt"
          />
          {/* microphone */}
          <SpeechToText
            onTranscription={handleTranscription}
            isAuthorized={isAuthorized}
          />
        </div>
        {/* name & email fields */}
        <div className="flex xl:flex-row lg:flex-row md:flex-row sm:flex-col xs:flex-col justify-center items-center w-full gap-4 p-3">
          <div className="flex flex-col w-full">
            <p className="text-lg p-2">Name</p>
            <input
              type="text"
              placeholder="Enter your Name..."
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-violet-700"
              value={name}
              onChange={handleNameChange}
            />
          </div>
          <div className="flex flex-col w-full">
            <p className="text-lg p-2">Email</p>
            <input
              type="text"
              placeholder="Enter your Email Address..."
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-violet-700"
              value={email}
              onChange={handleEmailChange}
            />
          </div>
        </div>
        <button
          className={`bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 border border-violet-900 rounded-lg ${
            !isAuthorized ? "cursor-not-allowed	" : "cursor-pointer"
          }`}
          onClick={isAuthorized ? handleSubmit : authorizeError}
          // disabled={!isAuthorized}
        >
          {isAuthorized ? "Submit" : "Authorize First"}
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
