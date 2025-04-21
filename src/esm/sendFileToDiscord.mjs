import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import path from "path";

/* Funções auxiliares */
function handleBufferFile(file) {
	if (file.buffer && Buffer.isBuffer(file.buffer)) {
		return { stream: file.buffer, filename: file.originalname || "file" };
	}
	return null;
}

function handlePathFile(file) {
	if (file.path && typeof file.path === "string") {
		return {
			stream: fs.createReadStream(file.path),
			filename: file.originalname || path.basename(file.path),
		};
	}
	return null;
}

function handleStringFile(file) {
	if (typeof file === "string") {
		return {
			stream: fs.createReadStream(file),
			filename: path.basename(file),
		};
	}
	return null;
}

function handleRawBuffer(file) {
	if (Buffer.isBuffer(file)) {
		return { stream: file, filename: "file" };
	}
	return null;
}

function getFileStreamAndName(file) {
	let result = null;

	if (file && typeof file === "object") {
		result = handleBufferFile(file) || handlePathFile(file);
	} else {
		result = handleStringFile(file) || handleRawBuffer(file);
	}

	if (!result) {
		throw new Error("Tipo de arquivo inválido. Use string, Buffer ou objeto do multer.");
	}

	return result;
}

async function postToDiscord(form, webhookUrl) {
	const response = await fetch(webhookUrl, {
		method: "POST",
		body: form,
		headers: form.getHeaders(),
	});

	if (!response.ok) {
		throw new Error(`Falha ao enviar arquivo: ${response.statusText}`);
	}

	return response.json();
}

async function sendFileToDiscord(file, webhookUrl) {
	try {
		const { stream, filename } = getFileStreamAndName(file);
		const form = new FormData();
		form.append("file", stream, { filename });

		const result = await postToDiscord(form, webhookUrl);
		console.log("Arquivo enviado com sucesso:", result);
		return result;
	} catch (error) {
		console.error("Erro ao enviar arquivo:", error);
		return error;
	}
}

export default sendFileToDiscord;