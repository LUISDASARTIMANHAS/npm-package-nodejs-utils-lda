import crypto from "crypto";
import {
	readUsers,
	writeUsers,
	initDatabase,
} from "./database.mjs";

import {
	validateUsername,
	validateEmail,
} from "./validators.mjs";

import { defaultUserSchema } from "./user.types.mjs";

initDatabase();

/**
 * Cria usuário
 * @param {Object} data
 */
export function createUser(data) {
	const users = readUsers();

	validateUsername(data.username);
	validateEmail(data.email);

	const usernameExists = users.some(
		(u) =>
			u.username.toLowerCase() ===
			data.username.toLowerCase(),
	);

	if (usernameExists) {
		throw new Error("Username já existe");
	}

	const emailExists = users.some(
		(u) =>
			u.email &&
			u.email.toLowerCase() ===
				data.email?.toLowerCase(),
	);

	if (emailExists) {
		throw new Error("Email já existe");
	}

	const now = Date.now();

	const user = {
		...defaultUserSchema,
		...data,
		id: crypto.randomUUID(),
		createdAt: now,
		updatedAt: now,
	};

	users.push(user);

	writeUsers(users);

	return user;
}

/**
 * Atualiza usuário
 * @param {string} id
 * @param {Object} updates
 */
export function updateUser(id, updates) {
	const users = readUsers();

	const index = users.findIndex(
		(u) => u.id === id,
	);

	if (index === -1) {
		throw new Error("Usuário não encontrado");
	}

	if (updates.username) {
		validateUsername(updates.username);

		const exists = users.some(
			(u) =>
				u.id !== id &&
				u.username.toLowerCase() ===
					updates.username.toLowerCase(),
		);

		if (exists) {
			throw new Error(
				"Username já está em uso",
			);
		}
	}

	if (updates.email) {
		validateEmail(updates.email);
	}

	users[index] = {
		...users[index],
		...updates,
		updatedAt: Date.now(),
	};

	writeUsers(users);

	return users[index];
}

/**
 * Soft delete
 * @param {string} id
 */
export function deleteUser(id) {
	return updateUser(id, {
		deleted: true,
		ativo: false,
	});
}

/**
 * Desativa usuário
 * @param {string} id
 */
export function disableUser(id) {
	return updateUser(id, {
		ativo: false,
	});
}

/**
 * Reativa usuário
 * @param {string} id
 */
export function reactivateUser(id) {
	return updateUser(id, {
		ativo: true,
	});
}