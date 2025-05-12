import React from "react";
import Container from "../ui/Container";
import Link from "next/link";
import ProfileButton from "../ui/profileButton";
import { useUser } from "@/lib/userContext";

function Navbar() {
  const { user } = useUser();
  if (!user) return null;

  return (
    <header className="sm:flex sm:justfify-between py-3 px-4 border-b">
      <Container>
        <div className="relative px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between w-full">
          <div className="flex items-center">
            <Link href="/dashboard" className="ml-4 lg:ml-0">
              <h1 className="font-bold text-2xl">Pixline</h1>
            </Link>
          </div>
          <nav className="mx-6  items-center space-x-4 lg:space-x-6 hidden md:block"></nav>
          <ProfileButton />
        </div>
      </Container>
    </header>
  );
}

export default Navbar;
