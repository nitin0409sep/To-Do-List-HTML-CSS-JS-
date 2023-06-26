const app = document.querySelector('#app');

app.innerHTML = `
    <div class="todos">
        <div class="todos-header">
            <h3 class="todos-title">Todo List</h3>
            <div>
                <p>You have <span class="todos-count"></span> items</p>
                <button type="button" class="todos-clear" style="display: none;">Clear Completed</button>
            </div>
        </div>
        <form action="" class="todos-form " name="todos">
            <input type="text" placeholder="What's next?" name="todo">
        </form>
        <ul class="todos-list"></ul>
    </div>
`

// state
let todos = JSON.parse(localStorage.getItem('todos')) || []; // Parsing is necessary as data is present in form of json string so to convert to js oject 

// selectors
const form = document.forms.todos;
const input = form.elements.todo;

const root = document.querySelector('.todos');
const ul = root.querySelector('.todos-list');
const count = root.querySelector('.todos-count');
const clearComplete = root.querySelector('.todos-clear');


// Functions
input.focus();
count.innerText = 0;

// Saving data to local Storage
function savetoStorage(todos) {
    localStorage.setItem('todos', JSON.stringify(todos));  // it accept only string in form of key value, so we are converting obj as json string
}

// Render Todos
function renderTodos(todos) {
    let todoString = '';

    // looping over the todos array, so that we can add item at last of the array, for which we had used +=, which will add new items with the previous items
    todos.forEach((val, idx) => {
        todoString += `              
        <li data-id='${idx}'${val.complete ? ' class="todos-complete"' : ''}> <!-- line through if checkbox is checked  -->  
            <input type='checkbox'${val.complete ? 'checked' : ''}/>
            <span> ${val.label}</span>
            <button type='button'></button>
        </li>
        `;
    });

    // Rendering the whole todos list/array 
    ul.innerHTML = todoString;

    // Rendering the count of the todolist items
    count.innerText = todos.filter(todo => !todo.complete).length;   // Count of the items that are not checked

    // Clear Complete Items --> if len == 0, hence it will be treated as false, else for any value it will be true condition.
    clearComplete.style.display = todos.filter((val, idx) => { return val.complete }).length ? 'block' : 'none';
}

// Adding Item's in Todos List
function addTodo(event) {
    event.preventDefault();

    const label = input.value.trim();
    const complete = false;

    // Adding new value to the array of list
    todos = [
        ...todos,
        {
            label,
            complete
        }
    ];

    // Render the todos list
    renderTodos(todos);

    // Storing in the browser database 
    savetoStorage(todos)

    // After adding the item to the list, the input box should be empty
    input.value = '';
}


// Update Todo's Item's/List
function updateTodo(event) {
    // Index of the list to which we are targeting
    const id = parseInt(event.target.parentNode.getAttribute('data-id'));

    // console.log(event.target);   // o/p --> <input type = 'checkbox'>

    // Making the chekbox checked/complete property --: true
    const complete = event.target.checked;

    // Mapping over the todos array inorder to find the target list which is being checked/uncheked
    todos = todos.map((val, idx) => {
        if (id === idx) {
            return {
                ...val,
                complete
            }
        }
        return val;
    });

    // console.log([...todos]);  --> return todo list array

    // Rendering the whole todolist
    renderTodos(todos);

    // Storing in the browser database 
    savetoStorage(todos)
}

// Edit Todo's Item
function editTodo(event) {
    if (event.target.nodeName.toLowerCase() != 'span') {
        return;
    };

    const id = parseInt(event.target.parentNode.getAttribute('data-id'));
    const todolabel = todos[id].label;

    // Created a new input in which old label is present to which the user would be abel to edit
    const input = document.createElement('input');
    input.type = 'text';
    input.value = todolabel;

    function handleEdit(event) {
        event.stopPropagation();
        const label = this.value;
        if (label !== todolabel) {
            todos = todos.map((todo, idx) => {
                if (idx === id) {
                    return {
                        ...todo,
                        label: label.trim()
                    };
                }
                return todo;
            });
            renderTodos(todos);
            savetoStorage(todos);
        }

    }

    // console.log(event.target.parentNode);   // <li data-id='id'> ... </li>
    event.target.style.display = 'none';
    event.target.parentNode.append(input);
    input.addEventListener('change', handleEdit);
    input.focus();
}

// Delete Todo's Item
function deleteTodo(event) {
    // As we r using evemt delegation, so it may be span, button, chekbox
    if (event.target.nodeName.toLowerCase() !== 'button') {
        return;
    }

    // Idx of the particular list(li) item, of which the button is clicked
    const id = parseInt(event.target.parentNode.getAttribute('data-id'));

    // Getting Name of the label u r going to delete
    const label = todos[id].label;

    // Really want to delete pop-up for cofirmation
    if (window.confirm(`Delete ${label}?`)) {
        // Filtering the index != id, and then generating a new array for todos
        todos = todos.filter((val, idx) => {
            if (idx !== id) {
                return val;
            };
        });

        // Rendering todos list
        renderTodos(todos);

        // Storing in the browser database 
        savetoStorage(todos)
    }
}

// Clear Compelte Todo Items
function clearCompleteTodos(event) {

    // Total number of checked items
    const count = todos.filter((todo) => todo.complete).length;

    // If none item is checked 
    if (count === 0) {
        return;
    }

    // Ask for confirmation to delete all items checked from the user
    if (window.confirm(`Delete ${count} items?`)) {

        // Checking the items that are not chekced and adding them to out todos
        todos = todos.filter(todo => !todo.complete);

        // Rendendring the updated list
        renderTodos(todos);

        // Storing in the browser database 
        savetoStorage(todos)
    }
}

// Initializations

// Items Present in local storage will be rendered
renderTodos(todos);

// Add Todo
form.addEventListener('submit', addTodo);

// Update Todo  -- Used event delegation
ul.addEventListener('change', updateTodo);

// Edit Todo
ul.addEventListener('dblclick', editTodo);

// Delete Todo
ul.addEventListener('click', deleteTodo);

// Clear Complete Items of Todo List
clearComplete.addEventListener('click', clearCompleteTodos)