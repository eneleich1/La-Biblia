import Typesense from "typesense";

export function getTypesenseClient() {
  const host = process.env.TYPESENSE_HOST ?? "localhost";
  const port = Number(process.env.TYPESENSE_PORT ?? "8108");
  const protocol = (process.env.TYPESENSE_PROTOCOL ?? "http") as "http" | "https";
  const apiKey = process.env.TYPESENSE_API_KEY ?? "xyz";

  return new Typesense.Client({
    nodes: [{ host, port, protocol }],
    apiKey,
    connectionTimeoutSeconds: 10,
  });
}

export const VERSES_COLLECTION = "bible_verses";
