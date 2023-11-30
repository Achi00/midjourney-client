import Link from "next/link";
import React, { useState } from "react";

const TermsModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div>
      <p className="text-sm">
        By uploading your image you agree to our{" "}
        <button onClick={toggleModal}>
          <span className="text-violet-700 hover:underline decoration-1 cursor-pointer">
            terms and conditions
          </span>
        </button>
      </p>

      {/* Modal */}
      <div
        className={`fixed inset-0 transition-opacity duration-700 ${
          isModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center`}
        style={{ visibility: isModalOpen ? "visible" : "hidden" }}
      >
        {/* modal content */}
        <div
          className={`transition-transform duration-700 ${
            isModalOpen ? "translate-y-0" : "translate-y-4"
          } bg-white w-[50%] p-5 rounded-2xl shadow-lg`}
        >
          <h2 className="text-lg font-bold mb-4">Terms & Conditions</h2>
          <p>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ab
            asperiores ratione laboriosam repudiandae minus. Nobis,
            necessitatibus consequatur nihil beatae veniam quaerat
            exercitationem dolor eligendi harum deserunt sed voluptates suscipit
            magnam, vitae porro at enim? Fugiat blanditiis, earum eos
            perferendis similique dolor nam amet deserunt at perspiciatis minus
            consequatur reprehenderit ipsam eligendi quas quibusdam labore?
            Error maiores placeat hic dolores, expedita amet, magnam quaerat,
            blanditiis culpa vero repudiandae facilis adipisci reiciendis?
          </p>
          <button
            className="mt-4 px-4 py-2 bg-violet-700 text-white rounded-lg"
            onClick={toggleModal}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
