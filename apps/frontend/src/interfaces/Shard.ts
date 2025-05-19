import { User } from "./User";

export interface Shard {
  id: string;
  name: string;

  nodeId: string;
  node: Node;

  users: User[];

  createdAt: Date;
  updatedAt: Date;
}
