import fs from "fs";
import path from "path";
import multer from "multer";
import crypto from "crypto";
import { fileURLToPath } from "url";

/**
 * Necessário para substituir __dirname em ESM
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Cria um diskStorage configurável
 * @param {string} baseDir
 * @param {boolean} useHashName
 * @return {multer.StorageEngine}
 */
export function createDiskStorage(baseDir, useHashName = true) {
	return multer.diskStorage({
		destination: (req, file, cb) => {
			const now = new Date();

			const uploadDir = path.resolve(
				__dirname,
				"..",
				baseDir,
				`${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`
			);

			fs.mkdirSync(uploadDir, { recursive: true });
			cb(null, uploadDir);
		},

		filename: (req, file, cb) => {
			if (!useHashName) {
				return cb(null, file.originalname);
			}

			const ext = path.extname(file.originalname);
			const hash = crypto.randomBytes(16).toString("hex");

			cb(null, `${hash}${ext}`);
		},
	});
}
