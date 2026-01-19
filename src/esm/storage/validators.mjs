/**
 * Valida o tipo MIME do arquivo enviado
 * @param {string[]} allowedMimeTypes
 * @return {(req: any, file: Express.Multer.File, cb: Function) => void}
 */
export function fileTypeValidator(allowedMimeTypes) {
	return (req, file, cb) => {
		if (!allowedMimeTypes.includes(file.mimetype)) {
			return cb(new Error("Tipo de arquivo não permitido"), false);
		}
		cb(null, true);
	};
}
