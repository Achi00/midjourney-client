"use client";
import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import SpeechToText from "./SpeechToText";
import TermsModal from "./TermsModal";
import Image from "next/image";
import Logo from "../utils/Logo.png";
import ShareImage from "./ShareImage";
import { FacebookShareButton } from "next-share";

const Hero = () => {
  const [image, setImage] = useState<File | null>(null);
  // for user image preview
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  // enter fields
  const [prompt, setPrompt] = useState<string>("");
  const [name, setName] = useState<string>("test");
  const [email, setEmail] = useState<string>("test@gmail.com");
  // final image state
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState("");
  // easy authentication
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(true);
  // steps for show previous or next jsx element
  const [step, setStep] = useState(1);
  // input and microphone togle state
  const [isUsingSpeech, setIsUsingSpeech] = useState(false);
  // show audio text
  const [showAudio, setShoWAudio] = useState("");
  // loading
  const [loading, setLoading] = useState(false);
  const passcodeInputRef = useRef<HTMLInputElement>(null);

  // toggle between input and microphone
  const handleToggle = () => {
    setIsUsingSpeech(!isUsingSpeech); // Toggle between input and speech-to-text
  };

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

  // Handlers for step transitions
  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
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
  // const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   setName(e.target.value);
  // };

  // const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   setEmail(e.target.value);
  // };

  // chack image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
      toast.success("Image selected");
    }
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
      setLoading(true);
      const response = await fetch(
        "https://abovedigital-1696444393502.ew.r.appspot.com/generate-and-swap-face",
        {
          method: "POST",
          body: formData,
        }
      );

      await handleResponse(response);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Request failed:", error);
      toast.error("An error occurred while processing your request.");
    }
  };

  const handleTranscription = (transcriptionText: string) => {
    setPrompt(transcriptionText);
    setShoWAudio(transcriptionText);
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

      <Image src={Logo} width={150} height={150} alt="logo" />
      {loading && <h1>Please Wait</h1>}
      {error && (
        <div>
          <div className="alert alert-danger">{error}</div>
        </div>
      )}
      {/* password */}
      {/* <div className="flex flex-col items-center justify-center gap-3">
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
      </div> */}
      {/* <div className="flex text-center">
        <TermsModal />
      </div> */}
      {/* upload field */}
      <div className="flex flex-col gap-5 items-center justify-center w-[50%]">
        {/* enter prompt */}
        {step === 1 && (
          <div className="flex fadeIn justify-center flex-col items-center w-full gap-4 p-3">
            <p className="text-center font-semibold xl:text-xl lg:text-xl md:text-lg sm:text-md xs:text-xs">
              Tell us about your imagination
            </p>
            {isUsingSpeech ? (
              <>
                <SpeechToText
                  onTranscription={handleTranscription}
                  isAuthorized={isAuthorized}
                />
                {showAudio && <p>{showAudio}</p>}
              </>
            ) : (
              <input
                type="text"
                className="bg-gray-50 border fadeIn border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block xl:w-3/4 lg:w-full md:w-full sm:full xs:w-[150%] p-2.5 outline-violet-700"
                value={prompt}
                onChange={handlePromptChange}
                placeholder="Enter prompt"
              />
            )}

            <button
              onClick={handleToggle}
              className=" border border-violet-900 p-2 rounded-md text-black"
            >
              {isUsingSpeech ? "or write your imagination" : "Try Microphone"}
            </button>
          </div>
        )}
        {/* upload image */}
        {step === 2 && (
          <div className="flex flex-col gap-2 fadeIn items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 focus:border-green-600 border-dashed rounded-lg cursor-pointer bg-gray-50  hover:bg-gray-100">
              {/* {image && (
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
                  <p className="text-violet-600 font-bold text-sm">
                    Image Uploaded
                  </p>
                </div>
              )} */}
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
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
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
            {imageUrl && !resultImage ? (
              <>
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "250px" }}
                  className="rounded-md border border-violet-700"
                />
              </>
            ) : null}
          </div>
        )}

        {/* user image preview */}
        {
          step === 3 && null
          // (imageUrl ? (
          //   <>
          //     <p className="text-center font-semibold xl:text-xl lg:text-xl md:text-lg sm:text-md xs:text-xs">
          //       Your image
          //     </p>
          //     <img
          //       src={imageUrl}
          //       alt="Preview"
          //       style={{ maxWidth: "100%", maxHeight: "300px" }}
          //       className="rounded-md border border-violet-700"
          //     />
          //   </>
          // ) : (
          //   <div className="flex text-center justify-center items-center bg-white rounded-md xl:w-1/2 lg:w-1/4 md:w-1/2 h-[150px] border border-violet-700 border-dashed">
          //     <p className="font-light text-black">
          //       Your image preview here...
          //     </p>
          //   </div>
          // )
          // )
        }
        {/* enter name & email */}
        {/* {step === 4 && (
          <div className="flex fadeIn xl:flex-row lg:flex-row md:flex-row sm:flex-col xs:flex-col justify-center items-center w-full gap-4 p-3">
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
        )} */}

        {resultImage && (
          <>
            <img
              className="rounded-lg border-3 border-violet-950"
              width={750}
              src={resultImage}
              alt="Result"
            />
            <FacebookShareButton
              url={resultImage}
              quote={"Check out this awesome image!"}
            >
              <button className="bg-violet-700 p-2 rounded-md text-white text-xl">
                Share on Facebook
              </button>
            </FacebookShareButton>
          </>
        )}
      </div>
      <div className="flex gap-5">
        {/* Navigation Buttons */}
        {step > 1 && (
          <button
            className="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 border border-violet-900 rounded-lg w-[90px]"
            onClick={handleBack}
          >
            Back
          </button>
        )}
        {step < 2 && (
          <button
            className="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 border border-violet-900 rounded-lg w-[90px]"
            onClick={handleNext}
          >
            Next
          </button>
        )}
        {step === 2 && (
          <button
            className={`bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 border border-violet-900 rounded-lg ${
              !isAuthorized || loading
                ? "cursor-not-allowed bg-violet-400"
                : "cursor-pointer"
            }`}
            onClick={isAuthorized ? handleSubmit : authorizeError}
            disabled={!isAuthorized || loading}
          >
            {isAuthorized ? "Submit" : "Authorize First"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Hero;
