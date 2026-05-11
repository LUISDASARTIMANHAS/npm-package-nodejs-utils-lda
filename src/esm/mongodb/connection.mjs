import "dotenv/config";

import { MongoClient, ServerApiVersion } from "mongodb";

let client = null;

/**
 * Conecta ao MongoDB reutilizando pool.
 *
 * @param {string} [connectionString]
 * @returns {Promise<MongoClient>}
 */
export async function connectMongo(connectionString) {
	if (client) {
		return client;
	}

	const uri = connectionString || process.env.MONGO_CONNECTION_STRING;

	if (!uri) {
		throw new Error("MONGO_CONNECTION_STRING not defined");
	}

	client = new MongoClient(uri, {
		serverApi: {
			version: ServerApiVersion.v1,
			strict: true,
			deprecationErrors: true,
		},

		maxPoolSize: 20,
		minPoolSize: 2,

		retryWrites: true,

		connectTimeoutMS: 10000,
		socketTimeoutMS: 30000,
		serverSelectionTimeoutMS: 5000,
	});

	await client.connect();

	console.log("MongoDB connected");

	return client;
}

/**
 * Fecha conexão MongoDB.
 *
 * @returns {Promise<void>}
 */
export async function closeMongo() {
	if (!client) return;

	await client.close();

	client = null;

	console.log("MongoDB disconnected");
}
