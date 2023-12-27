"use client";
import React, { useState, useEffect } from "react";

const Page = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [queueLength, setQueueLength] = useState(0);

  const fetchNextImageUrl = async () => {
    try {
      const response = await fetch("http://localhost:8080/next-image-url");
      if (!response.ok) {
        throw new Error("No new image available");
      }
      const data = await response.json();
      setImageUrl(data.imageUrl); // Set the image URL
      setQueueLength(data.queueLength); // Update the queue length
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // And include it in the useEffect hook that sets up the interval
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNextImageUrl();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const fetchQrCode = async () => {
    try {
      const response = await fetch("http://localhost:8080/qr");
      if (!response.ok) {
        throw new Error("Error fetching QR code");
      }
      const qrCodeHtml = await response.text();
      setQrCode(qrCodeHtml);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchQrCode(); // Fetch QR code on component mount

    const interval = setInterval(() => {
      fetchNextImageUrl();
    }, 10000); // Poll for new images every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="w-full flex justify-center items-center min-h-screen flex-col">
      {qrCode && <div dangerouslySetInnerHTML={{ __html: qrCode }}></div>}
      {imageUrl ? (
        <img width={550} src={imageUrl} alt="Generated" />
      ) : (
        <p>No image available</p>
      )}
      <p>Queue length: {queueLength}</p>
    </div>
  );
};

export default Page;
