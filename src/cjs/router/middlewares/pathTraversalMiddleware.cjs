// src/cjs/router/middlewares/pathTraversalMiddleware.cjs

const express = require("express");
const path = require("path");
const { getClientIp } = require("../../utils.cjs");
const { httpBadRequest, httpForbidden } = require("../exceptionAPI.cjs");

const routerPathTraversal = express.Router();

/**
 * Verifica se um caminho está contido dentro de um diretório seguro.
 *
 * @param {string} safeDir Diretório que contém os arquivos permitidos.
 * @param {string} requestedPath Caminho solicitado pelo usuário.
 * @returns {string|null} Caminho absoluto seguro ou null quando inválido.
 */
function resolveSafePath(safeDir, requestedPath) {
  if (typeof requestedPath !== "string" || requestedPath.length === 0) {
    return null;
  }

  const resolvedSafeDir = path.resolve(safeDir);

  const resolvedPath = path.resolve(resolvedSafeDir, requestedPath);

  const relativePath = path.relative(resolvedSafeDir, resolvedPath);

  /*
   * Se o caminho relativo:
   *
   * - for ".."
   * - começar com "../" ou "..\"
   * - ou for um caminho absoluto
   *
   * então ele está fora do diretório permitido.
   */
  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    return null;
  }

  return resolvedPath;
}

/**
 * Registra uma tentativa de Path Traversal.
 *
 * @param {Object} req Requisição Express.
 * @param {string} requestedPath Caminho solicitado.
 * @param {string} safeDir Diretório protegido.
 * @param {string} reason Motivo do bloqueio.
 * @returns {void}
 */
function logPathTraversalAttempt(req, requestedPath, safeDir, reason) {
  const ip = getClientIp(req);
  const userAgent = req.headers["user-agent"] || "Desconhecido";

  console.warn("\n[SECURITY] Path Traversal detectado!");

  console.warn(`[SECURITY] Data: ${new Date().toISOString()}`);

  console.warn(`[SECURITY] IP: ${ip}`);

  console.warn(`[SECURITY] Método: ${req.method}`);

  console.warn(`[SECURITY] URL: ${req.originalUrl}`);

  console.warn(`[SECURITY] Parâmetro: ${requestedPath}`);

  console.warn(`[SECURITY] Diretório protegido: ${safeDir}`);

  console.warn(`[SECURITY] Motivo: ${reason}`);

  console.warn(`[SECURITY] User-Agent: ${userAgent}`);
}

/**
 * Middleware de proteção contra Path Traversal.
 *
 * O diretório base padrão é o diretório
 * em que o processo Node.js foi iniciado.
 *
 * @param {Object} [options] Configurações do middleware.
 * @param {string} [options.query="file"] Parâmetro da query.
 * @param {string} [options.baseDir=process.cwd()] Diretório base permitido.
 * @param {number} [options.statusCode=403] Código HTTP para acesso negado.
 * @returns {Function} Middleware Express.
 */
function createPathTraversalMiddleware({
  query = "file",
  baseDir = process.cwd(),
} = {}) {
  const safeDir = path.resolve(baseDir);

  return function pathTraversalMiddleware(req, res, next) {
    const userInput = req.query[query];

    /*
     * A requisição não utiliza o parâmetro protegido.
     */
    if (typeof userInput === "undefined") {
      return next();
    }

    /*
     * O parâmetro existe, mas é inválido.
     */
    if (typeof userInput !== "string" || userInput.length === 0) {
      console.warn("\n[SECURITY] Parâmetro de arquivo inválido.");

      console.warn(`[SECURITY] IP: ${getClientIp(req)}`);

      console.warn(`[SECURITY] URL: ${req.originalUrl}`);

      return httpBadRequest(
        res,
        "\n\t[npm-package-nodejs-utils-lda] [pathTraversal]",
        " Parâmetro de arquivo inválido.",
      );
    }

    const safePath = resolveSafePath(safeDir, userInput);

    /*
     * Path Traversal detectado.
     */
    if (!safePath) {
      logPathTraversalAttempt(
        req,
        userInput,
        safeDir,
        "Caminho fora do diretório permitido.",
      );

      return httpForbidden(
        res,
        "\n\t[npm-package-nodejs-utils-lda] [pathTraversal]",
        "Acesso negado.",
      );
    }

    /*
     * Caminho validado disponibilizado para a aplicação.
     */
    req.safePath = safePath;

    return next();
  };
}

/**
 * Registra o middleware de Path Traversal no router principal.
 *
 * O diretório padrão será automaticamente o diretório
 * de trabalho do processo Node.js.
 *
 * @param {Object} mainRouter Router principal do Express.
 * @param {Object} [options] Configurações do middleware.
 * @returns {Object} Router principal.
 */
function pathTraversalMiddleware(mainRouter, options = {}) {
  const middleware = createPathTraversalMiddleware(options);

  routerPathTraversal.use(middleware);

  mainRouter.use(routerPathTraversal);

  const safeDir = path.resolve(options.baseDir || process.cwd());

  console.log("\n\t[npm-package-nodejs-utils-lda] [pathTraversal] loaded!");

  console.log(`\t[pathTraversal] Base directory: ${safeDir}`);

  return mainRouter;
}

module.exports = {
  pathTraversalMiddleware,
  createPathTraversalMiddleware,
  resolveSafePath,
};
