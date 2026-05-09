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
import { SYSTEM_ROLES } from "./roles.mjs";

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
 * Cria usuário comum
 * @param {Object} data
 */
export function createDefaultUser(data) {
	return createUser({
		...data,
		roles: [SYSTEM_ROLES.USER],
	});
}

/**
 * Cria moderador
 * @param {Object} data
 */
export function createModerator(data) {
	return createUser({
		...data,
		roles: [SYSTEM_ROLES.USER, SYSTEM_ROLES.MODERATOR],
	});
}

/**
 * Cria administrador
 * @param {Object} data
 */
export function createAdmin(data) {
	return createUser({
		...data,
		roles: [SYSTEM_ROLES.USER, SYSTEM_ROLES.MODERATOR, SYSTEM_ROLES.ADMIN],
	});
}

/**
 * Cria owner
 * @param {Object} data
 */
export function createOwner(data) {
	return createUser({
		...data,
		roles: [
			SYSTEM_ROLES.USER,
			SYSTEM_ROLES.MODERATOR,
			SYSTEM_ROLES.ADMIN,
			SYSTEM_ROLES.OWNER,
		],
	});
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