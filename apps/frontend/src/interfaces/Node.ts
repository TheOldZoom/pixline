export interface Node {
  identifier: string;
  port: number;
  label: string;
  location: string;
  ssl: boolean;
  secret_key: string;
}

export interface NodeFormData {
  identifier: string;
  port: string;
  label: string;
  location: string;
  ssl: boolean;
  secret_key: string;
}
