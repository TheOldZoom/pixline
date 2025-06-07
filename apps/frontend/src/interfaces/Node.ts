import { Shard } from "./Shard";

export interface Node {
  id: string;
  identifier: string;
  port: number;
  label: string;
  location: string;
  ssl: boolean;
  secret_key: string;
  status: "ONLINE" | "OFFLINE";
  shards: Shard[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NodeFormData {
  identifier: string;
  port: string;
  label: string;
  location: string;
  ssl: boolean;
  secret_key: string;
}
