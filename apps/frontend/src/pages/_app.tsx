import Navbar from "@/components/layout/Navbar";
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
        </main>
      </div>
    </UserProvider>
  );
}
