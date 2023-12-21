type DownloadButtonProps = {
  imageUrl: any;
};

const DownloadButton: React.FC<DownloadButtonProps> = ({ imageUrl }) => {
  const handleDownload = (imageUrl: string) => {
    fetch(
      `https://https://abovedigital-1696444393502.ew.r.appspot.com/downloadImage?imageUrl=${encodeURIComponent(
        imageUrl
      )}`
    )
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = imageUrl.split("/").pop() || "downloaded_image.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(console.error);
  };

  return (
    <button
      className="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 border border-violet-900 rounded-lg w-[90px]"
      onClick={() => handleDownload(imageUrl)}
    >
      Download Image
    </button>
  );
};

export default DownloadButton;
