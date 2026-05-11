import { connectMongo } from "./connection.mjs";

/**
 * Obtém collection MongoDB.
 *
 * @param {string} databaseName
 * @param {string} collectionName
 * @returns {Promise<import("mongodb").Collection>}
 */
export async function getCollection(databaseName, collectionName) {
  if (!databaseName) {
    throw new Error("databaseName required");
  }

  if (!collectionName) {
    throw new Error("collectionName required");
  }

  const client = await connectMongo();

  return client.db(databaseName).collection(collectionName);
}
