## MongoDB Utils Functions

lista de funções disponiveis para MongoDB na blibioteca npm-package-nodejs-utils-lda

```js
// Connection
async function connectMongo(connectionString);
async function closeMongo();
async function getCollection(databaseName, collectionName);

// Search / Find
async function findDocuments(databaseName, collectionName, query = {}, options = {});
async function findOneDocument(databaseName, collectionName, query = {}, options = {});
async function existsDocument(databaseName, collectionName, query);
async function countDocuments(databaseName, collectionName, query = {});

// Insertion
async function insertDocument(databaseName, collectionName, data);
async function insertManyDocuments(databaseName, collectionName, data);

// Update
async function updateOneDocument(databaseName, collectionName, filter, update, options = {});
async function updateManyDocuments(databaseName, collectionName, filter, update, options = {});

// Deletion
async function deleteOneDocument(databaseName, collectionName, filter);
async function deleteManyDocuments(databaseName, collectionName, filter);

// Aggregation
async function aggregateDocuments(databaseName, collectionName, pipeline = [], options = {});
```