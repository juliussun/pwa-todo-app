var db = new Dexie("ToDoDatabase");

/**
 * Define the schema for the database.
 * The database has a single table "students" with a primary key "id" and
 * indexes on the properties "name" and "city".
 */
db.version(1).stores({
  todos: "++id, todo, date",
});

/**
 * Retrieves all student records from the database.
 */
function getAllTodosFromDB() {
  if (db && db.todos) {
    // check if db and the students table are created
    return db.todos.toArray().then((data) => {
      return data;
    });
  } else {
    return undefined;
  }
}

/**
 * Adds a new student record to the database.
 */
function addTodoToDB(todo, date) {
  return db.todos
    .put({ todo, date })
    .then(id => { return id })
    .catch((err) => {
      alert("Ouch... " + err);
    });
}

/**
 * Queries the database for students by name.
 * (Not used in the app, just to showcase Dexie's capabilities)
 */
async function queryByTodo(todo) {
  if (todo === undefined) return 0;
  return await db.todos
    .filter((t) => {
      return t.todo === todo;
    })
    .toArray();
}

async function removeTodo(id){
  return db.todos
    .delete(id)
    .then(()=>true)
    .catch(err=>
      alert(err)
    );
}

// Ref -> https://dexie.org/docs/Tutorial/Hello-World
