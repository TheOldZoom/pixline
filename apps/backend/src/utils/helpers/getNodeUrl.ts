import { Node } from "../../prisma/.client";

function getNodeUrl(node: Node) {
  const protocol = node.ssl ? "https" : "http";

  const host = node.fqdn || node.ip;

  const port =
    (node.ssl && node.port !== 443) || (!node.ssl && node.port !== 80)
      ? `:${node.port}`
      : "";

  return `${protocol}://${host}${port}`;
}

export default getNodeUrl;
