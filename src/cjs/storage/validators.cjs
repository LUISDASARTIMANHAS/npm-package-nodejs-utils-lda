/**
 * Valida tipo de arquivo permitido
 * @param {string[]} allowedMimeTypes
 * @return {Function}
 */
function fileTypeValidator(allowedMimeTypes) {
	return (req, file, cb) => {
		if (!allowedMimeTypes.includes(file.mimetype)) {
			return cb(new Error("Tipo de arquivo não permitido"), false);
		}
		cb(null, true);
	};
}

module.exports = { fileTypeValidator };
