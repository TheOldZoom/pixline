import { User } from "@/interfaces/User";
import { useUser } from "@/lib/userContext";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const getShards = async (user: User) => {
  const token = user.token;

  const response = await fetch("/api/shards/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch shards");
  }

  const data = await response.json();
  return data;
};

function Shards() {
  const router = useRouter();
  const { user } = useUser();
  const [shards, setShards] = useState<object[] | null>(null);

  useEffect(() => {
    if (user === null) {
      return;
    }

    if (!user) {
      router.push("/");
    }

    getShards(user)
      .then(setShards)
      .catch((err) => {
        console.error(err);
      });
  }, [user, router]);

  return (
    <div>
      {shards ? (
        <ul>
          {shards.map((shard, index) => (
            <li key={index}>{JSON.stringify(shard)}</li>
          ))}
        </ul>
      ) : (
        <p>Loading shards...</p>
      )}
    </div>
  );
}

export default Shards;
