import { useUser } from "@/lib/userContext";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

function Shards() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return null;

  return <div>shards</div>;
}

export default Shards;
