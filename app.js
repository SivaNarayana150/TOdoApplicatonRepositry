const express = require("express");
const path = require("path");

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPath = path.join(__dirname, "todoApplication.db");
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
const whenBothPriorityAndStatusDefined = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const whenPriorityIsDefined = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const whenStatusIsDefined = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodoQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case whenBothPriorityAndStatusDefined(request.query):
      getTodoQuery = `
            SELECT *
            FROM
            todo
            WHERE
            todo LIKE '%${search_q}%'
            AND status = '${status}'
            AND priority = '${priority}';`;

      break;

    case whenPriorityIsDefined(request.query):
      getTodoQuery = `
            SELECT * FROM
            todo 
            WHERE 
            todo LIKE '%${search_q}%'
            AND priority = '${priority}'; `;
      break;
    case whenStatusIsDefined(request.query):
      getTodoQuery = `
            SELECT * FROM
            todo 
            WHERE 
            todo LIKE '%${search_q}%'
            AND status = '${status}'; `;
      break;

    default:
      getTodoQuery = `
            SELECT * FROM
            todo 
            WHERE 
            todo LIKE '%${search_q}%';`;

      break;
  }

  data = await db.all(getTodoQuery);
  response.send(data);
});

//API 2
app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;

  getTodoQuery = `
            SELECT *
            FROM
            todo
            WHERE
            id=${todoId} ;`;

  const data = await db.all(getTodoQuery);
  response.send(data);
});

// API 3

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const createQuery = `
    INSERT INTO todo 
    (id,todo,priority,status)
    VALUES('${id}','${todo}','${priority}','${status}');

    `;
  const dbResponse = db.run(createQuery);
  response.send("Todo Successfully Added");
});

//API 4
app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  let updateColumn = "";
  switch (true) {
    case todoDetails.status !== undefined:
      updateColumn = "status";
      break;
    case todoDetails.priority !== undefined:
      updateColumn = "priority";
      break;

    case todoDetails.todo !== undefined:
      updateColumn = "todo";
      break;
  }
  const previousTodoQuery = `
   SELECT * FROM
   todo 
   WHERE id= ${todoId}`;

  const previousTodo = await db.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateQuery = `
    UPDATE todo
   SET
   todo='${todo}',
   priority='${priority}',
   status='${status}'
   WHERE id = ${todoId};

    `;

  const dbResponse = db.run(updateQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE * FROM todo WHERE 
    id= ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
