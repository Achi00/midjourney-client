import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav className="w-full p-6">
      <div className="text-xl cursor-pointer font-bold flex justify-between ">
        <Link href="/">Home</Link>
        <Link href="/gallery">Gallery</Link>
      </div>
    </nav>
  );
};

export default Navbar;
