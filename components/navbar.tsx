// components/Navbar.tsx

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from "@auth0/nextjs-auth0/client";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); 
  const { user, error, isLoading } = useUser();

  return (
    <nav className="flex justify-end p-4 bg-gray-100">
      <div className="flex items-center text-center mr-5">
                  <h2 className="text-sm font-bold text-slate-500">{user?.name}</h2>
                </div>
      <div className="relative">
        <button onClick={() => setIsOpen(!isOpen)}>
        <img
                    src={user?.picture ?? ""}
                    alt={""}
                    width={50}
                    height={50}
                    className="bg-gray-200 w-10 h-10 rounded-full"
                  ></img>        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2">
            <Link href="/profile">
              <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</span>
            </Link>
            <a href="/api/auth/logout">
              <span className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign Out</span>
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
