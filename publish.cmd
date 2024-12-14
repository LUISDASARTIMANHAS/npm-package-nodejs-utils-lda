npm publish

:: Inicializa o repositório Git (se necessário)
if not exist ".git" (
    git init
    git remote add origin https://github.com/LUISDASARTIMANHAS/npm-package-nodejs-utils-lda.git
)

git pull

:: Verifica o status dos arquivos
git status

:: Adiciona todos os arquivos alterados, respeitando o .gitignore
git add .

:: Cria um commit com uma mensagem baseada no nome e versão do mod
git commit -m "Automated commit for NPM PACKAGE NODEJS UTILS LDA"

:: Envia os arquivos para o repositório remoto na branch especificada
git push origin main