const express = require("express");
const path = require("path");

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPath = path.join(__dirname, "todoapplication.db");
const app = express();

app.use(express.json());

let db = null;

const initializeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("SErver Running Successfully At http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB ERROR ${e.message}`);
    process.exit(1);
  }
};

initializeDatabaseAndServer();

// API 1 Returns a list of all todos whose status is 'TO DO'

app.get("/todos/", async (request, response) => {
  const { search_q } = request.query;
  const obtainingQueryStatus = `
    SELECT 
    * FROM
    todo 
    WHERE 
    status LIKE '${search_q}';`;
  const dbResponse = db.all(obtainingQueryStatus);
  response.send(dbResponse);
});
