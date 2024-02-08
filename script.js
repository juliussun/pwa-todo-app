async function registerServiceWorker() {
  // Register service worker
  if ("serviceWorker" in navigator) {
    // checking if the browser supports service workers
    window.addEventListener("load", function () {
      // when app loads, fire callback
      navigator.serviceWorker.register("/sw.js").then(
        function () {
          // register sw
          console.log("ServiceWorker registration successful"); // registration was successful
        },
        function (err) {
          console.log("ServiceWorker registration failed", err); // registration failed
        }
      );
    });
  }
}

/**
 * Main function to handle the student form and display logic.
 */
async function main2() {
  // Select form and input elements
  const form = document.querySelector("form");
  const todoInput = document.querySelector("[name='todo']");
  const dateInput = document.querySelector("[name='date']");
  const todoList = document.getElementById("todos");

  // Retrieve existing todos from the database
  const existingTodos = (await getAllTodosFromDB()) || [];

  // Store todo data locally
  const todoData = existingTodos.slice();

  // Populate initial todo list
  existingTodos.forEach((t) => {
    addTodo(t.todo, t.date);
  });

  /**
   * Adds a todo to the list and updates the storage.
   */
  function addTodo(todo, date) {
    // Create student elements
    const div = document.createElement("div");
    div.classList.add("todo");
    const h3 = document.createElement("h3");
    h3.textContent = todo;
    const p = document.createElement("p");
    p.textContent = date;

    //Button to remove the todo item
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.classList.add("remove-todo")

    function setUpRemoveFunction(removeBtn, div, id){
      removeBtn.addEventListener("click",function(){
        div.remove();
        try {
          const currentTodoData = JSON.parse(localStorage.getItem("todos")) || [];
          const updateTodoData = currentTodoData.filter(item=>item.id!==id);
          // console.log(updateTodoData);
          localStorage.setItem("todos", JSON.stringify(updateTodoData));
          removeTodo(id)
        } catch (error) {
          alert(error);
          return false;
        }
      })
      
    }

    // Append to DOM
    div.append(h3, p, removeBtn);
    todoList.appendChild(div);

    // Update storage
    addTodoToDB(todo, date).then(async (id)=>{

      todoData.push({ id, todo, date });
      localStorage.setItem("todos", JSON.stringify(todoData));

      const idParagraph = document.createElement("p");
      idParagraph.textContent = `#${id}`;
      div.prepend(idParagraph);
      // inject id varible into removeBtn callback
      setUpRemoveFunction(removeBtn,div,id);
    }).catch((err)=>{
      console.log(err);
    }); // addTodoToDB is defined and return id on promise

    // Clear input fields
    [todoInput, dateInput].forEach((input) => (input.value = ""));
  }

  // Handle form submission
  form.onsubmit = (event) => {
    event.preventDefault();
    try {
      addTodo(todoInput.value, dateInput.value);
    } catch (error) {
      console.log(error);
    }
  };
}

async function main() {
  const form = document.querySelector('form');
  const todoInput = document.querySelector("[name='todo']");
  const dateInput = document.querySelector("[name='date']");
  const todoList = document.getElementById('todos');

  // Retrieve existing todos from the database
  const existingTodos = (await getAllTodosFromDB()) || [];

  // Store todo data locally
  const todoData = existingTodos.slice();

  // Populate initial todo list
  existingTodos.forEach((t) => {
    displayTodo(t, todoData, todoList);
  });

  // Handle form submission
  form.onsubmit = async (event) => {
    event.preventDefault();
    const todo = todoInput.value;
    const date = dateInput.value;

    try {
      const id = await addTodoToDB(todo, date); // Add todo to the database and get the id
      const newTodo = { id, todo, date };
      todoData.push(newTodo);
      localStorage.setItem('todos', JSON.stringify(todoData));
      displayTodo(newTodo, todoData, todoList); // Display the new todo
      todoInput.value = '';
      dateInput.value = '';
    } catch (error) {
      console.error(error);
    }
  };
}

function setUpRemoveFunction(removeBtn, div, id, todoData) {
  removeBtn.addEventListener('click', async function() {
    div.remove();
    try {
      await removeTodo(id); // Make sure this function exists and correctly removes the todo from the database
      // Update local storage after removal
      const updatedTodoData = todoData.filter(todo => todo.id !== id);
      localStorage.setItem('todos', JSON.stringify(updatedTodoData));
    } catch (error) {
      alert(error);
    }
  });
}

function displayTodo(t, todoData, todoList) {
  const div = document.createElement('div');
  div.classList.add('todo');
  const h1 = document.createElement('h1');
  h1.textContent = t.todo;
  const p = document.createElement('p');
  p.textContent = t.date;

  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remove';
  removeBtn.classList.add('remove-todo');
  
  div.append(h1, p, removeBtn);
  todoList.appendChild(div);

  const idParagraph = document.createElement('p');
  idParagraph.textContent = `#${t.id}`;
  div.prepend(idParagraph);

  setUpRemoveFunction(removeBtn, div, t.id, todoData);
}

// Initialize service worker and main application logic
registerServiceWorker();
main();
