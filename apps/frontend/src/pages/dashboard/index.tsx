import { useUser } from "@/lib/userContext";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

function Dashboard() {
  const { user } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (user === null) {
      return;
    }
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return null;

  return <div>Dashboard</div>;
}

export default Dashboard;
