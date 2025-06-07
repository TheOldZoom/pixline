import { useUser } from "@/lib/userContext";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

function Images() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (user === null) return;
    if (!user) {
      router.push("/");
      return;
    }
  }, [user, router]);

  if (!user) return null;

  return <div>Images</div>;
}

export default Images;
