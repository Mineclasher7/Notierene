'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Access sessionStorage only when in the browser
      const token = sessionStorage.getItem('jwtToken');
      setJwtToken(token);

      const intervalId = setInterval(() => {
        setJwtToken(sessionStorage.getItem('jwtToken'));
      }, 1000); // Check every second

      return () => clearInterval(intervalId); // Clean up on unmount
    }
  }, []);

  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="text-white font-bold text-xl cursor-pointer">Notieren</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {!jwtToken && (
                  <>
                    <Link href="/signup">
                      <span className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Sign Up</span>
                    </Link>
                    <Link href="/login">
                      <span className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Login</span>
                    </Link>
                  </>
                )}
                {jwtToken && (
                  <>
                    <Link href="/signout">
                      <span className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Sign Out</span>
                    </Link>
                    <Link href="/create">
                      <span className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Create Room</span>
                    </Link>
                    <Link href="/note">
                      <span className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Notes</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
