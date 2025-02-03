const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { freadBin, fwriteBin } = require("./autoFileSysModule.cjs");
const fs = require("fs");
const databaseUserPath = "./data/users.bin";
let userIndexMap = {};

// Verifica se a pasta ./data existe
if (!fs.existsSync("./data")) {
  // Se não existir, cria a pasta
  fs.mkdirSync("./data");
}

// Verifica se o arquivo users.bin existe
if (!fs.existsSync(databaseUserPath)) {
  // Se não existir, cria o arquivo users.bin com um array vazio
  const defaultSchema = [

  ]
  fwriteBin(databaseUserPath, defaultSchema); // Cria um arquivo binário vazio
}

// user system
// insertUser(name,userdata)
// return userdata saved
// selectUser(ID)
// return userdata
// usersList()
// return users ID,name
// deleteUser(ID)
// alterUser(ID, name, newUserData)

// inserir usuario
function insertUser(name, userData) {
  const users = freadBin(databaseUserPath);
  const newID = uuidv4();
  const newIndex = users.length; // Define o índice como a posição atual no array
  const newUser = {
    ID: newID,
    ativo: true,
    usuario: name,
    userData,
    index: newIndex,
  };

  users.push(newUser);
  fwriteBin(databaseUserPath, users);
  ordenarUsuario();
  carregarIndice(); // Atualiza o índice após a inserção

  // Retorna os dados do novo usuário
  return newUser;
}

// Selecionar usuário pelo ID
function selectUser(ID) {
  if (userIndexMap[ID] === undefined) {
    console.error(`Err: userID ${ID} Not Found.`);
    
    return `Erro: Usuário com ID ${ID} não encontrado.`;
  }
  const users = freadBin(databaseUserPath);
  return users[userIndexMap[ID]];
}

// Alterar usuário
function alterUser(ID, name, newUserData) {
  if (userIndexMap[ID] === undefined) {
    console.error(`Err: userID ${ID} Not Found.`);
    return `Erro: Usuário com ID ${ID} não encontrado.`;
  }
  // Verifica se o ID existe no mapa de índices
  if (userIndexMap[ID] !== undefined) {
    const users = freadBin(databaseUserPath);
    const userIndex = userIndexMap[ID];

    users[userIndex].userData = newUserData;
    users[userIndex].usuario = name;
    fwriteBin(databaseUserPath, users);
    ordenarUsuario();
    carregarIndice(); // Atualiza o índice após a inserção

    // Retorna o usuário atualizado
    return users[userIndex];
  }

  // Se o ID não for encontrado, retorna null
  return null;
}

// Deletar usuário pelo ID
function deleteUser(ID) {
  if (userIndexMap[ID] === undefined) {
    console.error(`Err: userID ${ID} Not Found.`);
    return `Erro: Usuário com ID ${ID} não encontrado.`;
  }
  const users = freadBin(databaseUserPath);
  const userIndex = userIndexMap[ID];
  const username = users[userIndex].usuario;

  // Remove o usuário da lista
  users.splice(userIndex, 1);

  // Reorganiza a lista para atualizar os índices
  users.forEach((user, index) => {
    user.index = index; // Atualiza o índice de cada usuário
  });

  fwriteBin(databaseUserPath, users);
  carregarIndice();

  // Retorna o usuário removido
  return `Usuário ${username} DELETADO PERMANENTEMENTE com sucesso`;
}

// Desativar usuário pelo ID
function disableUser(ID) {
  if (userIndexMap[ID] === undefined) {
    console.error(`Err: userID ${ID} Not Found.`);
    return `Erro: Usuário com ID ${ID} não encontrado.`;
  }
  const users = freadBin(databaseUserPath);
  const userIndex = userIndexMap[ID];
  const username = users[userIndex].usuario;

  // Marca o usuário como inativo (não removemos o usuário, apenas o escondemos)
  users[userIndex].ativo = false;
  fwriteBin(databaseUserPath, users);
  carregarIndice();

  // Retorna o usuário desativado
  return `Usuário ${username} desativado com sucesso`;
}

// Reativar usuário
function reactivateUser(ID) {
  if (userIndexMap[ID] === undefined) {
    console.error(`Err: userID ${ID} Not Found.`);
    return `Erro: Usuário com ID ${ID} não encontrado.`;
  }
  const users = freadBin(databaseUserPath);
  const userIndex = userIndexMap[ID];
  const username = users[userIndex].usuario;

  if (userIndexMap[ID] === undefined) {
    console.error(`Err: userID ${ID} Not Found.`);
    return `Erro: Usuário com ID ${ID} não encontrado.`;
  }
  // Marca o usuário como ativo
  users[userIndex].ativo = true;
  fwriteBin(databaseUserPath, users);
  carregarIndice();

  // Retorna o usuário reativado
  return `Usuário ${username} reativado com sucesso`;
}

//  FUNÇÕES
async function carregarIndice() {
  const users = freadBin(databaseUserPath);
  userIndexMap = {}; // Reseta o mapa

  await users.forEach((user) => {
    userIndexMap[user.ID] = user.index;
  });
}
// Função para ordenar bases por usuario
function ordenarUsuario() {
  const data = freadBin(databaseUserPath);

  // Ordena o array de usuarios com base no usuario, do maior para o menor
  data.sort((user1, user2) => user2.usuario.localeCompare(user1.usuario));

  fwriteBin(databaseUserPath, data);
}

module.exports = {
  insertUser,
  selectUser,
  alterUser,
  deleteUser,
  disableUser,
  reactivateUser,
  ordenarUsuario
};
