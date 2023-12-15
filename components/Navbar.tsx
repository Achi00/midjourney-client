import Link from "next/link";
import Image from "next/image";
import React from "react";
import logo from "../utils/Logo2.png";
import gallery from "../utils/gallery.png";

const Navbar = () => {
  return (
    <nav className="w-full p-6">
      <div className="text-xl cursor-pointer font-bold flex justify-between ">
        {/* <Link href="/" className="flex flex-col items-center justify-center">
          <Image src={logo} width={50} height={50} alt="logo" />
          <p className="text-md font-bold">AI Imaginarium</p>
        </Link> */}
        {/* <Link
          href="/gallery"
          className="flex flex-col items-center justify-center"
        >
          <Image src={gallery} width={50} height={50} alt="gallery" />
          <p className="text-md font-bold">Gallery</p>
        </Link> */}
      </div>
    </nav>
  );
};

export default Navbar;
