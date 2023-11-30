import { db } from "@/app/firebaseConfig";
import { getDocs, collection } from "firebase/firestore";

interface User {
  prompt: string;
  imageUrl: unknown;
  id: string;
  name: string;
  email: string;
  // ... add other fields as per your Firestore 'users' collection
}

export async function sendAudioToServer(
  audioBlob: Blob,
  onTranscription: (transcription: string) => void
) {
  const formData = new FormData();
  formData.append("audioFile", audioBlob, "recording.webm");

  try {
    const response = await fetch("http://localhost:8080/transcribe-audio", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        "Server responded with an error while sending audio file!"
      );
    }

    const data = await response.json();
    console.log("Transcription:", data.transcription);
    // Handle the transcription data as needed
    onTranscription(data.transcription);
  } catch (error) {
    console.error("Error sending audio to the server:", error);
  }
}

export async function getchDataFromFirestore() {
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
