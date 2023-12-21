"use client";
import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import SpeechToText from "./SpeechToText";
import TermsModal from "./TermsModal";
import Image from "next/image";
import Logo from "../utils/Logo.png";
import camera from "../utils/camera.png";
import { FacebookShareButton } from "next-share";
import DownloadButton from "./Download";

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
  const [isAuthorized, setIsAuthorized] = useState(false);
  // steps for show previous or next jsx element
  const [step, setStep] = useState(1);
  // input and microphone togle state
  const [isUsingSpeech, setIsUsingSpeech] = useState(false);
  // show audio text
  const [showAudio, setShoWAudio] = useState("");
  // loading
  const [loading, setLoading] = useState(false);
  const passcodeInputRef = useRef<HTMLInputElement>(null);

  const [errorMessage, setErrorMessage] = useState("");

  // change prompt input stlye in case of inappropriate prompt
  const [promptInputClass, setPromptInputClass] =
    useState("normal-input-class");

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
          setStep((currentStep) => currentStep + 1);
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
      console.log("Response data:", data);
      if (data.imageUrl) {
        setResultImage(data.imageUrl);
        toast.dismiss(); // Dismiss the loading toast
        toast.success("Image generation completed!");
      } else {
        console.error("URL not found in response");
        toast.error("URL not found in response");
      }
    } else {
      toast.dismiss(); // Dismiss the loading toast before displaying the error message
      const errorData = await response.json();
      // Check for nested error structure
      const errorMessage =
        errorData.error && errorData.error.error
          ? errorData.error.error
          : errorData.error;

      setErrorMessage(errorMessage);
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
        case "Inappropriate content detected in the prompt.":
          toast.error("Error: Inappropriate content detected in the prompt.");
          setPromptInputClass("border-2 border-red-700");
          setStep(2);
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
      setResultImage(null);
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

    const formData = new FormData();
    formData.append("userImage", image);
    formData.append("prompt", prompt);
    formData.append("name", name);
    formData.append("email", email);
    try {
      setLoading(true);
      setPromptInputClass("");
      setErrorMessage("");
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

  const handleTranscription = (englishTranslation: string) => {
    setPrompt(englishTranslation);
    setShoWAudio(englishTranslation);
  };

  const handleOriginalTranscription = (greekTranscription: string) => {
    // Handle the Greek transcription here
    console.log("Greek Transcription:", greekTranscription);
  };

  const authorizeError = () => {
    toast.error("Please authorize first");
    if (passcodeInputRef.current) {
      passcodeInputRef.current.style.border = "2px solid red";
      passcodeInputRef.current.focus();
    }
  };

  return (
    <>
      <div className="w-full flex justify-center items-center flex-col gap-[7vmin]">
        <Toaster />

        <Image src={Logo} width={150} height={150} alt="logo" />

        {errorMessage && (
          <div
            className="flex items-center p-4 mb-4 text-md text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
            role="alert"
          >
            <svg
              className="flex-shrink-0 inline w-4 h-4 me-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <span className="sr-only">Info</span>
            <div>
              <span className="font-bold">Error:</span> {errorMessage}
            </div>
          </div>
        )}
        {loading && (
          <>
            <h2 className="text-semibold w-1/4">
              Our Artificial Intelligence System is Creating image by your
              imagination, Please be patient, it takes about 60 seconds
            </h2>
            <button
              disabled
              type="button"
              className="py-4 px-8 me-2 text-lg font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center"
            >
              <svg
                aria-hidden="true"
                role="status"
                className="inline w-8 h-8 me-3 text-gray-200 animate-spin dark:text-gray-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="#1C64F2"
                />
              </svg>
              Loading...
            </button>
          </>
        )}
        {error && (
          <div>
            <div className="alert alert-danger">{error}</div>
          </div>
        )}
        {/* password */}
        {step === 1 && !isAuthorized && (
          <div className="flex flex-col items-center justify-center gap-3">
            <h1>Please verify password</h1>
            <div className="flex xl:flex-row lg:flex-row md:flex-row sm:flex-col xs:flex-col gap-6 h-15">
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
        )}
        {/* <div className="flex text-center">
        <TermsModal />
      </div> */}
        {/* upload field */}
        <div className="flex flex-col gap-5 items-center justify-center w-[50%]">
          {/* enter prompt */}
          {step === 2 && (
            <div className="flex fadeIn justify-center flex-col items-center w-full gap-4 p-3">
              <p className="text-center font-semibold xl:text-xl lg:text-xl md:text-lg sm:text-md xs:text-xs">
                Tell us about your imagination
              </p>
              {isUsingSpeech ? (
                <>
                  <SpeechToText
                    onTranscription={handleTranscription}
                    onOriginalTranscription={handleOriginalTranscription} // Provide this function
                    isAuthorized={isAuthorized}
                  />
                  {showAudio && <p>{showAudio}</p>}
                </>
              ) : (
                <input
                  type="text"
                  className={`bg-gray-50 border fadeIn border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block xl:w-3/4 lg:w-full md:w-full sm:full xs:w-[150%] p-2.5 outline-violet-700 ${promptInputClass}`}
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
          {step === 3 &&
            (resultImage ? (
              // Render a small button when resultImage is available
              <div className="flex justify-center items-center">
                <label className="flex w-full items-center justify-center border-2 rounded-lg cursor-pointer text-center bg-violet-500  hover:bg-violet-400 gap-2 px-2">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Image src={camera} alt="camera" width={30} height={30} />
                  </div>
                  <h1 className="font-bold text-white">Upload Again</h1>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            ) : imageUrl ? (
              // Render the small "Upload again" button and image preview when imageUrl is available
              <div className="flex flex-col gap-10 justify-center items-center">
                <label className="flex w-full items-center justify-center border-2 rounded-lg cursor-pointer text-center bg-violet-500  hover:bg-violet-400 gap-2 px-2">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Image src={camera} alt="camera" width={30} height={30} />
                  </div>
                  {loading ? (
                    <h1 className="font-bold text-white">Please Wait...</h1>
                  ) : (
                    <>
                      <h1 className="font-bold text-white">Upload Again</h1>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </>
                  )}
                </label>
                <img
                  src={imageUrl}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "250px" }}
                  className="rounded-md border border-violet-700"
                />
              </div>
            ) : (
              // Render the image upload section when neither imageUrl nor resultImage is set
              <div className="flex flex-col xl:gap-[10vmin] lg:gap-[10vmin] md:gap-[10vmin] sm:gap-[10vmin] xs:gap-[10vmin] py-[5vmin] fadeIn items-center justify-center w-full">
                <h1 className="font-bold text-lg">
                  Upload Image Or Take Selfie
                </h1>
                <label className="flex w-full flex-col items-center justify-center h-64 border-2 border-gray-300 focus:border-green-600 border-dashed rounded-lg cursor-pointer text-center bg-gray-50  hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Image src={camera} alt="camera" width={90} height={90} />
                  </div>
                  <h1 className="text-semibold">Click Here To Upload</h1>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            ))}

          {/* user image preview */}
          {
            step === 4 && null
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
              <DownloadButton imageUrl={resultImage} />
            </>
          )}
        </div>
      </div>
      <div className="flex gap-5 pb-5 pt-2">
        {/* Navigation Buttons */}
        {step > 1 && (step !== 2 || !isAuthorized) && (
          <button
            className={`${
              loading
                ? "bg-violet-300 cursor-not-allowed"
                : "bg-violet-500 hover:bg-violet-700"
            } text-white font-bold py-2 px-4 border border-violet-900 rounded-lg w-[90px]`}
            onClick={handleBack}
            disabled={loading}
          >
            Back
          </button>
        )}
        {step < 3 && (
          <button
            className={`py-2 px-4 border border-violet-900 rounded-lg w-[90px] font-bold ${
              (step === 1 && !isAuthorized) ||
              (step === 2 && prompt.trim() === "") ||
              (step === 3 && !imageUrl)
                ? "bg-violet-300 text-white cursor-not-allowed"
                : "bg-violet-500 hover:bg-violet-700 text-white"
            }`}
            onClick={handleNext}
            disabled={
              (step === 1 && !isAuthorized) ||
              (step === 2 && prompt.trim() === "") ||
              (step === 3 && !imageUrl)
            }
          >
            Next
          </button>
        )}
        {step === 3 && (
          <button
            className={`  text-white font-bold py-2 px-4 border border-violet-900 rounded-lg ${
              loading
                ? "cursor-not-allowed bg-violet-300"
                : "cursor-pointer bg-violet-500 hover:bg-violet-700"
            }`}
            onClick={isAuthorized ? handleSubmit : authorizeError}
            disabled={!isAuthorized || loading}
          >
            Submit
          </button>
        )}
      </div>
    </>
  );
};

export default Hero;
