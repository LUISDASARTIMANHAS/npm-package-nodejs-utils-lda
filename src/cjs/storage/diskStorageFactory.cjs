const fs = require("fs");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");

/**
 * Cria um storage configurável
 * @param {string} baseDir
 * @param {boolean} useHashName
 * @return {multer.StorageEngine}
 */
function createDiskStorage(baseDir, useHashName = true) {
	return multer.diskStorage({
		destination: (req, file, cb) => {
			const today = new Date();
			const dir = path.resolve(
				baseDir,
				`${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`
			);

			fs.mkdirSync(dir, { recursive: true });
			cb(null, dir);
		},

		filename: (req, file, cb) => {
			if (!useHashName) return cb(null, file.originalname);

			const ext = path.extname(file.originalname);
			const hash = crypto.randomBytes(16).toString("hex");
			cb(null, `${hash}${ext}`);
		},
	});
}

module.exports = { createDiskStorage };
