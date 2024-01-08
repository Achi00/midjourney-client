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
      const response = await fetch(
        "https://abovedigital-1696444393502.ew.r.appspot.com/next-image-url"
      );
      if (!response.ok) console.log("No new images available");
      const data = await response.json();

      if (data.imageUrls.length > 0) {
        setImageUrls((prevImageUrls) => {
          // Determine the new images
          const newImages = data.imageUrls.filter(
            (url: string) => !prevImageUrls.includes(url)
          );

          if (newImages.length > 0) {
            console.log("New images fetched:", newImages);

            // Combine new and old URLs, and ensure the array doesn't exceed 14 items
            let updatedImageUrls = [...newImages, ...prevImageUrls].slice(
              0,
              14
            );
            return updatedImageUrls;
          } else {
            console.log("No new images fetched");
            return prevImageUrls; // Return previous state if no new images
          }
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // UseEffect to close lightbox when new images are added
  useEffect(() => {
    if (imageUrls.some((url) => url !== null)) {
      closeLightbox();
    }
  }, [imageUrls]);

  // fetch qr code
  const fetchQrCode = async () => {
    try {
      const response = await fetch(
        "https://abovedigital-1696444393502.ew.r.appspot.com/qr"
      );
      if (!response.ok) throw new Error("Error fetching QR code");
      const qrCodeHtml = await response.text();
      setQrCode(qrCodeHtml);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  // execute and set timeout
  useEffect(() => {
    fetchQrCode();
    fetchNextImageUrls();
    const intervalId = setInterval(fetchNextImageUrls, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // Function to cycle through images
  const cycleImages = () => {
    const nonNullImages = imageUrls.filter((url) => url !== null);
    if (nonNullImages.length > 1) {
      // Ensure there is more than one image to cycle through
      let nextIndex = (selectedImageIndex ?? 0) + 1;
      nextIndex = nextIndex % nonNullImages.length; // Wrap around if it reaches the end
      setSelectedImageIndex(nextIndex);
    }
  };

  useEffect(() => {
    // Function to start lightbox cycle
    const startLightboxCycle = () => {
      if (imageUrls.some((url) => url !== null)) {
        setLightboxActive(true);
        setSelectedImageIndex(0); // Start from the first image
      }
    };

    if (lightboxActive) {
      console.log("Starting image cycling");
      cycleImagesTimer = setInterval(cycleImages, 5000);
    } else {
      // Start the lightbox cycle after 10 seconds of inactivity
      const timer = setTimeout(startLightboxCycle, 10000);
      return () => {
        console.log("Clearing timer for starting lightbox cycle");
        clearTimeout(timer);
      };
    }

    return () => {
      if (cycleImagesTimer) {
        console.log("Clearing cycle images timer");
        clearInterval(cycleImagesTimer);
      }
    };
  }, [lightboxActive, imageUrls, selectedImageIndex]); // Include selectedImageIndex in dependencies

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
            ) : null}
          </div>
        );
      })}

      <AnimatePresence>
        {lightboxActive && selectedImage && (
          <>
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
