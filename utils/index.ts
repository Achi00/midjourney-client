import { db } from "@/app/firebaseConfig";
import { getDocs, collection } from "firebase/firestore";

interface User {
  prompt: string;
  imageUrl: unknown;
  id: string;
  name: string;
  email: string;
}

export async function sendAudioToServer(
  audioBlob: Blob,
  onTranscription: (
    englishTranslation: string,
    greekTranscription: string
  ) => void
) {
  const formData = new FormData();
  formData.append("audioFile", audioBlob, "recording.webm");

  try {
    const response = await fetch(
      "https://abovedigital-1696444393502.ew.r.appspot.com/transcribe-audio",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(
        "Server responded with an error while sending audio file!"
      );
    }

    const data = await response.json();
    // Call the callback with both transcriptions
    onTranscription(data.transcription, data.originalTranscription);
  } catch (error) {
    console.error("Error sending audio to the server:", error);
  }
}

export async function fetchDataFromFirestore() {
  const querySnapshot = await getDocs(collection(db, "users"));

  const data: User[] = [];
  querySnapshot.forEach((doc) => {
    const docData = doc.data() as User;
    // Assuming 'id' is a field in docData, exclude it
    const { id, ...otherData } = docData;
    data.push({ id: doc.id, ...otherData });
  });

  return data;
}

export async function fetchPaginatedImages(page: any, limit = 10) {
  const response = await fetch(
    `https://abovedigital-1696444393502.ew.r.appspot.com/paginated-images?page=${page}&limit=${limit}`
  );
  const data = await response.json();
  return data;
}
