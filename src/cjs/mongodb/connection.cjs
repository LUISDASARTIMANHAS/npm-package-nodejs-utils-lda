require("dotenv/config");

const {
	MongoClient,
	ServerApiVersion,
} = require("mongodb");

let client = null;

/**
 * Conecta ao MongoDB reutilizando pool.
 *
 * @param {string} [connectionString]
 * @returns {Promise<MongoClient>}
 */
async function connectMongo(connectionString) {
	if (client) {
		return client;
	}

	const uri =
		connectionString ||
		process.env.MONGO_CONNECTION_STRING;

	if (!uri) {
		throw new Error(
			"MONGO_CONNECTION_STRING not defined",
		);
	}

	client = new MongoClient(uri, {
		serverApi: {
			version: ServerApiVersion.v1,
			strict: true,
			deprecationErrors: true,
		},

		maxPoolSize: 30,
		minPoolSize: 10,

		retryWrites: true,

		connectTimeoutMS: 60000,
		socketTimeoutMS: 60000,
		serverSelectionTimeoutMS: 60000,
		family: 4, // Use IPv4, skip trying IPv6
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
async function closeMongo() {
	if (!client) return;

	await client.close();

	client = null;

	console.log("MongoDB disconnected");
}

module.exports = {
	connectMongo,
	closeMongo,
};