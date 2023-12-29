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

  const fetchNextImageUrls = async () => {
    try {
      const response = await fetch("http://localhost:8080/next-image-url");
      if (!response.ok) throw new Error("No new images available");
      const data = await response.json();

      if (data.imageUrls.length > 0) {
        setImageUrls((prevImageUrls) => {
          let updatedImageUrls = [...data.imageUrls, ...prevImageUrls];
          updatedImageUrls = Array.from(new Set(updatedImageUrls));
          if (updatedImageUrls.length > 14) updatedImageUrls.length = 14;
          while (updatedImageUrls.length < 14) updatedImageUrls.push(null);
          return updatedImageUrls;
        });
        setLightboxActive(false); // Reset lightbox state
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
    // Fetch initial data
    fetchQrCode();
    fetchNextImageUrls();

    // Set up interval to fetch new image URLs every 10 seconds
    const intervalId = setInterval(fetchNextImageUrls, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    // Function to start lightbox cycle
    const startLightboxCycle = () => {
      const firstImageIndex = imageUrls.findIndex((url) => url !== null);
      if (firstImageIndex !== -1) {
        setSelectedImageIndex(firstImageIndex);
        setLightboxActive(true);
        cycleImages(firstImageIndex);
      }
    };

    // Start the lightbox cycle after 10 seconds of inactivity
    const timer = setTimeout(() => {
      if (!lightboxActive && imageUrls.some((url) => url !== null)) {
        startLightboxCycle();
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [lightboxActive, imageUrls]);

  // Cycle through images every 5 seconds
  const cycleImages = (index: any) => {
    if (!lightboxActive || imageUrls.every((url) => url === null)) return;

    const nextIndex = (index + 1) % imageUrls.length;
    setTimeout(() => {
      setSelectedImageIndex(imageUrls[nextIndex] ? nextIndex : 0);
      cycleImages(nextIndex);
    }, 5000);
  };

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
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <Image src={Logo} alt="logo" width={100} height={100} />
              </div>
            )}
          </div>
        );
      })}

      <AnimatePresence>
        {selectedImage && (
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
              className="max-w-2/3 max-h-2/3 rounded-xl"
              variants={imageVariant}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Page;
