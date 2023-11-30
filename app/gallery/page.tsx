import React from "react";
import { getchDataFromFirestore } from "@/utils";
import ImageCard from "@/components/ImageCard";

interface DataProps {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  prompt?: string;
}

const page = async () => {
  const data = await getchDataFromFirestore();

  // Filter out objects without 'imageUrl'
  const filteredData = data.filter((user) => user.imageUrl);

  // Transform data and add default 'prompt' if not available
  const transformedData = filteredData.map((user) => ({
    ...user,
    imageUrl: (user.imageUrl as string) || "No image provided",
    prompt: user.prompt || "No prompt provided",
  }));

  // Explicitly specify the type of data being passed to the ImageCard component
  const typedData = transformedData;

  return (
    <div>
      <ImageCard data={typedData} />
    </div>
  );
};

export default page;
