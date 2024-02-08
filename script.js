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
async function main() {
  const form = document.querySelector('form');
  const todoInput = document.querySelector("[name='todo']");
  const dateInput = document.querySelector("[name='date']");
  const todoList = document.getElementById('todos');

  // Retrieve existing todos, ensure we only have one source of truth: indexedDB
  const existingTodos = (await getAllTodosFromDB()) || [];

  // Store todo data locally, act like a buffer
  const todoData = existingTodos.slice();

  // Populate initial todo list, need to track three object:
  // todo items, todoData from localStorage, todoList for rendering
  // t fetching from the databse for rendering is needed, as refreshing will cause problem otherwise.
  existingTodos.forEach((t) => {
    displayTodo(t, todoData, todoList);
  });

  // Handle form submission, need to have id back from the database for deletion
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
      todoInput.value = ''; //clear value in the input fields
      dateInput.value = ''; //
    } catch (error) {
      console.error(error);
    }
  };
}

// this is to handle deletion, use todoData to update localStorage
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

//render function for the todo list
function displayTodo(t, todoData, todoList) {
  const div = document.createElement('div');
  div.classList.add('todo');
  const h3 = document.createElement('h3');
  h3.textContent = t.todo;
  const p = document.createElement('p');
  p.textContent = formatDateTime(t.date);

  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Done/Remove';
  removeBtn.classList.add('remove-todo');
  
  div.append(h3, p, removeBtn);
  todoList.appendChild(div);

  const idParagraph = document.createElement('p');
  idParagraph.textContent = `#${t.id}`;
  div.prepend(idParagraph);

  setUpRemoveFunction(removeBtn, div, t.id, todoData);
}

function formatDateTime(isoString) {
  if(!isoString){
    return "";
  }
  // Split the string into date and time
  const [datePart, timePart] = isoString.split('T');
  // Further split the date into parts
  const [year, month, day] = datePart.split('-');
  // Reassemble into a more friendly format
  const formattedDate = `${month}/${day}/${year}`;
  const formattedTime = timePart; // time format as 'HH:MM'

  return `due ${formattedDate} ${formattedTime}`;
}

// Initialize service worker and main application logic
registerServiceWorker();
main();
