import Navbar from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/lib/userContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex flex-1 flex-col">
          <Component {...pageProps} />
          <Toaster closeButton={true} duration={5000} />
        </main>
      </div>
    </UserProvider>
  );
}
