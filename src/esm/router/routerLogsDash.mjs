import { Router } from "express";
import { join } from "path";
import { promises } from "fs";
import { exposeLogsFolder } from "../utils.cjs";
const routerLogsDash = Router();
const LOGS_DIR = "logs";

exposeLogsFolder(routerLogsDash);

/**
 * Lista arquivos da pasta /logs
 */
routerLogsDash.get("/", async (req, res) => {
  try {
    const files = await promises.readdir(LOGS_DIR);

    const fileLinks = files
      .map((file) => {
        return `
            <li class="list-group-item">
              <a href="/logs/${file}" target="_blank">${file}</a>
            </li>
          `;
      })
      .join("");

    res.status(200).send(`
        <!doctype html>
        <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Logs Dashboard</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body class="bg-dark text-light">
          <div class="container py-5">
            <h1 class="mb-4">Logs Dashboard</h1>
            <ul class="list-group">
              ${fileLinks || "<li class='list-group-item'>Nenhum arquivo encontrado</li>"}
            </ul>
          </div>
        </body>
        </html>
      `);
  } catch (error) {
    console.error("ERRO REAL:", error);
    res.status(500).send("Erro ao listar arquivos.");
  }
});

/**
 * Permite acessar arquivos individuais
 */
routerLogsDash.get("/:filename", (req, res) => {
  const filePath = join(LOGS_DIR, req.params.filename);

  // Proteção contra path traversal
  if (!filePath.startsWith(LOGS_DIR)) {
    return res.status(403).send("Acesso negado.");
  }

  res.sendFile(filePath);
});

export default routerLogsDash;
