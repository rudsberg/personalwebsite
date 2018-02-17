/*
  Developer: Joel Rudsberg
  Email: rudsberg@live.se
*/

// jshint esversion: 6
// jshint curly: false

/*
  - Eventlistener for submitting new item
  - Get value
  - Add item to data structure, todo object
  - UI, item in todo list
  - Eventlistener for finishing task
  - UI, remove item from todo list
  - Remove item from todo object
  - Add item to data structure, completed object
  - UI, item in completed list
  - Eventlistener for removing task
  - UI, remove from completed list
  - Remove item from completed object

  - Always update localstorage

  - on load, load data if it exists
*/

/*
  DATA MODULE:
  - Add item to todo object
  - Remove item from todo object
  - Add item to completed object
  - Remove item from completed object
  - Update localstorage after every data change

  UI MODULE
  - Get input value
  - Add item to UI todo list
  - Remove item from todo list
  - Add item to completed list
  - Remove item from completed list

  CONTROLLER MODULE
  - Add Eventlisteners
  - Act as manager, run program and access to modules
*/

/* ======================================= */

/*
  TODO: add remove all btn
  TODO: set ID and stick to it, don't change it.
*/


// *** DATA MANIPULATION MODULE ***
let dataController = (function() {

  // Contructor, these are used in todo and completed arrays
  let Item = function(des, type, id) {
    this.des = des;
    this.type = type;
    this.id = id;
  };

  // Data structure
  let data = {
    todo: [],
    completed: []
  };

  // Updates localStorage
  let _updateLocalStorage = function() {
    localStorage.setItem('Items', JSON.stringify(data));
  };

  // Removes item from todo or completed and adds to other one
  let updateDataOnBtnCLick = function(btnID, li) {
    btnID = btnID.replace('Btn', '');
    if (btnID === 'todo') {
      // Remove item from todo and add to completed
      data[btnID].forEach(function(element, i) {
        if (element.id == li.id) {
          data[btnID][i].type = 'completed';
          data[btnID][i].id = _setIDAttribute(data[btnID][i].type);
          data['completed'].push(data[btnID][i]);
          data[btnID].splice(i, 1);
        }
      });
    } else {
      // Remove item from completed
      data[btnID].forEach(function(element, i) {
        if (element.id == li.id) {
          data[btnID].splice(i, 1);
        }
      });
    }
    _updateLocalStorage();
  };

  // Applies id to list item
  let _setIDAttribute = function(type) {
    // Get highest id in todo list
      // New array with only id values

      // Use Math.max on it

    // Get highest id in completed list

    // Return the highest one + 1

    if (type === 'todo') {
      if (data['todo'].length === 0) {
        ID = 100;
      } else {
        ID = data['todo'][data['todo'].length - 1].id + 1;
      }
    } else {
      if (data['completed'].length === 0) {
        ID = 200;
      } else {
        ID = data['completed'][data['completed'].length - 1].id + 1;
      }
    }
    return ID;

  };

  // Updates the data structure (on load, by copying the localStorage data)
  let updateDataStructure = function(array) {
    data = array;
  };

  // Adds item to todo or completed data structure
  let addItem = function(des, type) {
    let ID, newItem;

    ID = _setIDAttribute(type);

    newItem = new Item(des, type, ID);
    data[type].push(newItem);
    _updateLocalStorage();

    return newItem;
  };

  let checkData = function() {
    return data;
  };


  return {
    updateDataOnBtnCLick: updateDataOnBtnCLick,
    addItem: addItem,
    updateDataStructure: updateDataStructure,
    checkData: checkData
  };

})();


// *** USER INTERFACE MODULE ***
let UIController = (function() {

  const DOMStrings = {
    inputField: '#item',
    addBtn: '#add',
    container: '.my-container',
    todoUl: '#todo',
    completedUl: '#completed',
    todoBtn: '#todoBtn',
    completedBtn: '#completedBtn'
  };

  // Updates necessary styles when item is moved from todo to completed
  let _setStylesCompletedItem = function(li) {
    let button, fa;

    button = li.lastChild.firstChild;
    button.id = DOMStrings.completedBtn.replace('#', '');

    fa = li.lastChild.firstChild.firstChild;
    fa.className = 'fa fa-times fa-2x';

    li.setAttribute('class', 'faded');
  };

  // Retrieves input text and cleares field
  let getInput = function() {
    let text, type;

    text = document.querySelector(DOMStrings.inputField).value;
    document.querySelector(DOMStrings.inputField).value = '';

    type = 'todo';

    return {
      description: text,
      type: type
    };
  };

  // Adds todo or completed item to UI
  let addItem = function(obj, type) {
    let html, newHtml, parent;

    // Create placeholder html
    html = '<li class="%class%" id="%id%">%description%<div class="buttons"><button id="%type%"><i class="fa %fa-type% fa-2x"></i></button></div></li>';

    if (type === 'todo') {
      parent = DOMStrings.todoUl;
      newHtml = html.replace('%fa-type%', 'fa-check');
      newHtml = newHtml.replace('%class%', '');
    } else {
      parent = DOMStrings.completedUl;
      newHtml = html.replace('%fa-type%', 'fa-times');
      newHtml = newHtml.replace('%class%', 'faded');
    }

    // Insert real data values in html placeholder
    newHtml = newHtml.replace('%id%', obj.id);
    newHtml = newHtml.replace('%description%', obj.des);
    newHtml = newHtml.replace('%type%', obj.type + 'Btn');

    document.querySelector(parent).insertAdjacentHTML('beforeend', newHtml);
  };

  // Update UI after the btn on mcomplete item or remove item is clicked
  let updateUIOnBtnClick = function(id, child) {
    //child = li, id = todoBtn or completedBtn
    let todoUl, completedUl;

    todoUl = document.querySelector(DOMStrings.todoUl);
    completedUl = document.querySelector(DOMStrings.completedUl);
    id = id.replace('Btn', '');

    if (id === 'todo') {
      // Remove item from todo and add to completed & update styles
      completedUl.insertBefore(child, completedUl.childNodes[0]);
      _setStylesCompletedItem(child);
    } else {
      // Remove item from completed list
      completedUl.removeChild(child);
    }
  };

  // Updates UI on start of application if data existed in localStorage
  let updateOnStart = function(dataArray) {
    // Update todo section
    for (let i = 0; i < dataArray.todo.length; i++) {
      addItem(dataArray.todo[i], dataArray.todo[i].type);
    }

    // Update completed section
    for (let i = 0; i < dataArray.completed.length; i++) {
      addItem(dataArray.completed[i], dataArray.completed[i].type);
    }
  };

  return {
    addItem: addItem,
    getInput: getInput,
    DOMStrings: DOMStrings,
    updateUIOnBtnClick: updateUIOnBtnClick,
    updateOnStart: updateOnStart
  };

})();


// *** CONTROLLER MODULE ***
let controller = (function(dataCtrl, UICtrl) {

  const DOMText = UICtrl.DOMStrings;
  const constants = {
    liForRemoveAllBtn: 2
  };

  // Adds all Eventlisteners
  let _addEventListeners = function() {
    document.querySelector(DOMText.addBtn).addEventListener('click', _addItem);
    document.addEventListener('keypress', function(e) {
      if (e.code === 'Enter') _addItem();
    });

    document.querySelector(DOMText.container).addEventListener('click', function(e) {
      // If click was on btn (or fa icon), update data and UI
      if (e.target.id === 'todoBtn' || e.target.id === 'completedBtn' || e.target.tagName === 'I') {
        let ID, li;

        ID = e.target.id;
        li = e.target.parentNode.parentNode;

        if (e.target.tagName === 'I') {
          ID = e.target.parentNode.id;
          li = e.target.parentNode.parentNode.parentNode;
        }

        dataCtrl.updateDataOnBtnCLick(ID, li);
        UICtrl.updateUIOnBtnClick(ID, li);
        _checkIfInsertRemoveAllBtn();
      }
    });

    // DOM Change observer
    //_DOMObserver('todo');
    //_DOMObserver('completed');

  };

  // Checks if completed items exceed a value and inserts remove all btn
  let _checkIfInsertRemoveAllBtn = function() {
    // Get number of items in completed list
    console.log(dataCtrl.checkData());
    let completedItems = dataCtrl.checkData()['completed'].length;
    console.log(completedItems);
  };

  // Observe changes in the DOM (if li item is added or not) and adds removeAllbtn
  /*
  let _DOMObserver = function(type) {
    // Node that is observed for mutations
    let targetNode = document.getElementById(type);

    // Options for observer (which mutations to observe)
    let config = {
      childList: true
    };

    // Callback function to execute when mutations are observed
    let callback = function(mutationsList) {
      for(var mutation of mutationsList) {
        if (mutation.type == 'childList') {
          // Check if completed item is above certain value
          let dataArray = dataCtrl.TEMPORARY();
          if (dataArray['completed'].length > constants.liForRemoveAllBtn) {
            console.log(dataArray);
            console.log(dataArray['completed'].length);
          }
        }
      }
    };

    // Create an observer instance linked to the callback function
    let observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
  };
  */

  // Loads localStorage and loads items and updates data
  let _addItemsAtStart = function() {
    let dataArray = JSON.parse(localStorage.getItem('Items'));

    // Only run if data exist in localStorage
    if (dataArray) {
      // Update data structure
      dataCtrl.updateDataStructure(dataArray);

      // Update UI
      UICtrl.updateOnStart(dataArray);
    }
  };


  // Adds item to todo list
  let _addItem = function() {
    let input, newItem;

    // 1. Get input value
    input = UICtrl.getInput();

    // 2. Add item to data controller
    newItem = dataCtrl.addItem(input.description, input.type);

    // 3. Add item to UI
    UICtrl.addItem(newItem, input.type);
  };

  let init = function() {
    _addEventListeners();
    _addItemsAtStart();
  };

  return {
    init: init
  };

})(dataController, UIController);

controller.init();
