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
    const data = await response.json();
    console.log("Transcription:", data.transcription);
    // Handle the transcription data as needed
    onTranscription(data.transcription);
  } catch (error) {
    console.error("Error sending audio to the server:", error);
  }
}
