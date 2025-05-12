import { useUser } from "@/lib/userContext";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

function Nodes() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
    if (user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  return <div>Nodes</div>;
}

export default Nodes;
