"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Logo from "../../utils/Logo.png";

const Page = () => {
  const [imageUrls, setImageUrls] = useState(new Array(15).fill(null));
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [lightboxActive, setLightboxActive] = useState(false);
  let cycleImagesTimer: any = null;

  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch images from the server
  const fetchNextImageUrls = async () => {
    try {
      const response = await fetch("http://localhost:8080/next-image-url");
      if (!response.ok) throw new Error("No new images available");
      const data = await response.json();

      if (data.imageUrls.length > 0) {
        const newImages = data.imageUrls.filter(
          (url: string) => !imageUrls.includes(url)
        );

        console.log("New images fetched:", newImages);

        if (newImages.length > 0) {
          setImageUrls((prevImageUrls) => {
            let updatedImageUrls = [...data.imageUrls, ...prevImageUrls];
            updatedImageUrls = Array.from(new Set(updatedImageUrls));
            if (updatedImageUrls.length > 14) updatedImageUrls.length = 14;
            while (updatedImageUrls.length < 14) updatedImageUrls.push(null);
            return updatedImageUrls;
          });
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchQrCode = async () => {
    try {
      const response = await fetch("http://localhost:8080/qr");
      if (!response.ok) throw new Error("Error fetching QR code");
      const qrCodeHtml = await response.text();
      setQrCode(qrCodeHtml);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchQrCode();
    fetchNextImageUrls();
    const intervalId = setInterval(fetchNextImageUrls, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Function to cycle through images
  const cycleImages = () => {
    const nonNullImages = imageUrls.filter((url) => url !== null);
    if (nonNullImages.length > 0) {
      const nextIndex = (selectedImageIndex ?? 0) + 1;
      setSelectedImageIndex(nextIndex % nonNullImages.length);
    }
  };

  useEffect(() => {
    // Function to start lightbox cycle
    const startLightboxCycle = () => {
      if (imageUrls.some((url) => url !== null)) {
        setLightboxActive(true);
        setSelectedImageIndex(0);
      }
    };

    // Check if lightbox should start or cycle
    if (lightboxActive) {
      // Start cycling images if lightbox is active
      console.log("Starting image cycling");
      cycleImagesTimer = setInterval(cycleImages, 5000);
    } else {
      // Start the lightbox cycle after 10 seconds of inactivity
      const timer = setTimeout(startLightboxCycle, 10000);
      return () => clearTimeout(timer);
    }

    return () => {
      if (cycleImagesTimer) {
        console.log("Clearing cycle images timer");
        clearInterval(cycleImagesTimer);
      }
    };
  }, [lightboxActive, imageUrls]);

  const logImageUrls = () => {
    const nonNullImages = imageUrls.filter((url) => url !== null);
    if (nonNullImages.length > 0) {
      console.log(
        "images:" + nonNullImages[currentIndex % nonNullImages.length]
      );
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(logImageUrls, 5000); // Log every 5 seconds
    return () => clearInterval(intervalId);
  }, [imageUrls, currentIndex]);

  // Animation variants for Framer Motion
  const backdropVariant = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const imageVariant = {
    hidden: { scale: 0 },
    visible: { scale: 1 },
  };

  const selectedImage =
    selectedImageIndex !== null ? imageUrls[selectedImageIndex] : null;

  const closeLightbox = () => {
    console.log("Closing lightbox");
    setLightboxActive(false);
    if (cycleImagesTimer) {
      clearInterval(cycleImagesTimer);
      cycleImagesTimer = null;
    }
  };

  return (
    <div className="relative grid grid-cols-3 grid-rows-5 h-screen">
      <button
        onClick={closeLightbox}
        className="absolute cursor-pointer bg-violet-600 rounded-lg text-white text-lg font-bold p-4 top-5 right-5 z-[51]"
      >
        Close Lightbox
      </button>
      {imageUrls.map((url, index) => {
        const isQrCodePosition = index === 7;

        return (
          <div key={index} className="col-span-1 row-span-1">
            {isQrCodePosition ? (
              <div dangerouslySetInnerHTML={{ __html: qrCode || "" }} />
            ) : url ? (
              <img
                src={url}
                alt={`Generated Image ${index}`}
                className="object-cover w-full h-full cursor-pointer"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <Image src={Logo} alt="logo" width={100} height={100} />
              </div>
            )}
          </div>
        );
      })}

      <AnimatePresence>
        {lightboxActive && selectedImage && (
          <>
            {console.log("Displaying lightbox for image:", selectedImage)}
            <motion.div
              className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50"
              variants={backdropVariant}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.img
                src={selectedImage}
                alt="Enlarged Image"
                className="w-[800px] rounded-xl"
                variants={imageVariant}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Page;
