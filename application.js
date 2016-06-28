document.addEventListener("DOMContentLoaded", function(event) {
  // CONSTANTS
  var ADD_ITEM_INPUT_ID = 'add-item';
  var DELETE_ALL_CLASS = 'js-clear-all';
  var DELETE_ITEM_CLASS = 'delete-item';
  var EDIT_ITEM_CLASS = 'edit-item';
  var HIDDEN_CLASS = 'hidden';
  var GOODS_CONTAINER_ID = 'goods-list';
  var IGNORE_CLICK_CLASS = 'ignore-click';
  var ITEM_EXAMPLE_ID = 'list-item-example';
  var ITEM_CLASS = 'list-item';
  var ITEM_CONTENT_CLASS = 'item-content';
  var KEYCODE_ENTER = 13;
  var KEYCODE_ESC = 27;
  var MARKER_CLASS = 'mark-item';
  var TOGGLE_ALL_CLASS = 'js-toggle-all';

  var GOODS_CONTAINER = document.getElementById(GOODS_CONTAINER_ID);
  var TOGGLE_ALL_CHECKBOX = document.getElementsByClassName(TOGGLE_ALL_CLASS)[0];
  var ITEM_CHECKBOXES = GOODS_CONTAINER.getElementsByClassName(MARKER_CLASS);
  var EDIT_ITEM_INPUTS = document.getElementsByClassName(EDIT_ITEM_CLASS);
  var CONTENT_ELEMENTS = document.getElementsByClassName(ITEM_CONTENT_CLASS);

  // add existing items into list
  goodsFromLocalStorage().forEach(function(item) {
    addHtmlItem(item);
  });

  // event listeners
  // add item on enter
  var addItemInput = document.getElementById(ADD_ITEM_INPUT_ID);
  addItemInput.addEventListener('keydown', addItemOnEnter);
  // ignore click
  var linksWhichShouldBeIgnored = document.getElementsByClassName(IGNORE_CLICK_CLASS);
  Array.prototype.forEach.call(linksWhichShouldBeIgnored, function(link) {
    ignoreClickLister(link);
  });
  // deletete selected
  document.getElementsByClassName(DELETE_ALL_CLASS)[0].addEventListener('click', deleteSelected);
  // mark whole list
  TOGGLE_ALL_CHECKBOX.addEventListener('click', toggleAllList);
  // when click is performed outside the box - cancel editing
  document.body.addEventListener('click', function(event){
    var result = Array.prototype.find.call(event.target.classList, function(className) {
      return className === EDIT_ITEM_CLASS;
    });
    if(!result) {
      cancelCurrentEditInputs();
    }
  });


  function addItemOnEnter(event) {
    if(event.which == KEYCODE_ENTER) {
      if(this.value.trim() === '') {
        this.value = '';
        return false;
      }
      var itemObject = createItemObject(this.value);
      addHtmlItem(itemObject);
      addItemToLocalStorage(itemObject);
      // clear input
      this.value = '';
    }
  }

  function ignoreClickLister(element) {
    element.addEventListener('click', function (event) {
      event.preventDefault();
    });
  }

  function addHtmlItem(itemObject) {
    var newItem = document.createElement('li');
    newItem.setAttribute('data-id', itemObject.id);
    newItem.classList.add(ITEM_CLASS);
    // checkbox
    var checkboxElementContainer = document.createElement('div');
    var checkboxElement = document.createElement('input');
    checkboxElementContainer.classList.add('mark-item-container');
    checkboxElement.classList.add('mark-item');
    checkboxElement.type = 'checkbox';
    checkboxElement.checked = itemObject.done;
    checkboxElementContainer.appendChild(checkboxElement);
    // content
    var contentElement = document.createElement('span');
    var contentElementContainer = document.createElement('div');
    contentElementContainer.classList.add('item-content-container');
    contentElement.classList.add('item-content');
    contentElement.innerText = itemObject.value;

    contentElementContainer.appendChild(contentElement);
    // delete link
    var deleteElement = document.createElement('a');
    var deleteElementContainer = document.createElement('div');
    deleteElementContainer.classList.add('delete-item-container');
    deleteElement.innerText = 'x';
    deleteElement.classList.add('delete-item');
    deleteElement.classList.add(IGNORE_CLICK_CLASS);
    deleteElementContainer.appendChild(deleteElement);
    // add elements inside item
    newItem.appendChild(checkboxElementContainer);
    newItem.appendChild(contentElementContainer);
    newItem.appendChild(deleteElementContainer);

    // add event listeners
    ignoreClickLister(deleteElement);
    checkboxElement.addEventListener('click', toggleAllMarker);
    checkboxElement.addEventListener('click', toggleContentChecked);

    var markItemDoneWithItemObject = markItemDone.bind(itemObject);
    checkboxElement.addEventListener('click', markItemDoneWithItemObject);

    deleteElement.addEventListener('click', deleteItem);
    contentElement.addEventListener('dblclick', enableEditItem);
    // add new item to the list
    TOGGLE_ALL_CHECKBOX.checked = allChecked();
    // add item to html
    GOODS_CONTAINER.appendChild(newItem);
  }

  function deleteSelected() {
    Array.prototype.forEach.call(ITEM_CHECKBOXES, function(itemCheckbox) {
      if(itemCheckbox.checked) GOODS_CONTAINER.removeChild(itemCheckbox.parentNode.parentNode);
    });
  }

  function toggleAllList() {
    var self = this;
    var checked = self.checked;
    if(checked) {
      Array.prototype.forEach.call(CONTENT_ELEMENTS, function(contentElement) {
        contentElement.classList.add('item-content-checked');
      });
    } else {
      Array.prototype.forEach.call(CONTENT_ELEMENTS, function(contentElement) {
        contentElement.classList.remove('item-content-checked');
      });
    }

    var toggledItems = goodsFromLocalStorage().map(function(itemObject) {
      itemObject.done = checked;
      return itemObject;
    });

    localStorage.goods = JSON.stringify(toggledItems);

    Array.prototype.forEach.call(ITEM_CHECKBOXES, function(itemCheckbox) {
      itemCheckbox.checked = checked;
    });
  }

  function deleteItem() {
    var goods = goodsFromLocalStorage();
    var itemId = this.parentNode.parentNode.getAttribute('data-id');
    var itemIndex = goods.findIndex(function(lsItem) {
      return lsItem.id === itemId;
    });
    goods.splice(itemIndex, 1);
    localStorage.goods = JSON.stringify(goods);

    GOODS_CONTAINER.removeChild(this.parentNode.parentNode);
  }

  function enableEditItem() {
    var itemTextNode = this;
    var editItemInput = createEditItemNode();
    editItemInput.value = itemTextNode.innerText;
    editItemInput.type = 'text';

    editItemInput.addEventListener('keydown', updateItemOnEnter);
    editItemInput.addEventListener('keydown', discardItemChangesOnEscape);

    itemTextNode.parentNode.insertBefore(editItemInput, itemTextNode);

    hideElement(itemTextNode);
    showElement(editItemInput);

    function discardItemChangesOnEscape(event) {
      if(event.which == KEYCODE_ESC) {
        hideElement(editItemInput);
        showElement(itemTextNode);
      }
    }

    function updateItemOnEnter(event) {
      if(event.which == KEYCODE_ENTER) {
        if(this.value.trim() === '') {
          this.value = '';
          return false;
        }
        var itemObject = {
          id: this.parentNode.parentNode.getAttribute('data-id'),
          value: this.value
        };

        updateItemObjectInLocalStorage(itemObject);
        itemTextNode.innerText = itemObject.value;

        hideElement(editItemInput);
        showElement(itemTextNode);
      }
    }

    function createEditItemNode() {
      var editItemNode = document.createElement('input');
      editItemNode.classList.add(EDIT_ITEM_CLASS);
      hideElement(editItemNode);
      return editItemNode;
    }
  }

  function hideElement(element) {
    element.classList.add(HIDDEN_CLASS);
  }

  function showElement(element) {
    element.classList.remove(HIDDEN_CLASS);
  }

  function allChecked() {
    var goods = goodsFromLocalStorage();
    if(goods.length) {
      return goods.every(function(itemObject) {
        return itemObject.done;
      });
    }
  }

  function toggleAllMarker() {
    if(this.checked) {
      if(allChecked()) TOGGLE_ALL_CHECKBOX.checked = true;
    } else {
      TOGGLE_ALL_CHECKBOX.checked = false;
    }
  }

  function cancelCurrentEditInputs() {
    Array.prototype.forEach.call(EDIT_ITEM_INPUTS, function(element){
      hideElement(element);
      showElement(element.parentNode.parentNode.getElementsByClassName(ITEM_CONTENT_CLASS)[0]);
    });
  }

  function toggleContentChecked() {
    var contentElement = this.parentNode.parentNode.getElementsByClassName(ITEM_CONTENT_CLASS)[0];
    if(this.checked) {
      contentElement.classList.add('item-content-checked');
    } else {
      contentElement.classList.remove('item-content-checked');
    }
  }

  function addItemToLocalStorage(item) {
    var goods;

    if(localStorage.goods) {
      goods = JSON.parse(localStorage.goods);
    } else {
      goods = [];
    }
    goods.push(item);
    localStorage.goods = JSON.stringify(goods);
  }

  function createItemObject(value) {
    return {id: generateId(), value: value, done: false};
  }

  function generateId() {
    return Math.random().toString(36);
  }

  function goodsFromLocalStorage() {
    if(localStorage.goods) {
      return JSON.parse(localStorage.goods);
    } {
      return [];
    }
  }

  function markItemDone() {
    var itemObject = this;
    itemObject.done = !itemObject.done;
    updateItemObjectInLocalStorage(itemObject);
  }

  function updateItemObjectInLocalStorage(itemObject) {
    var goods = goodsFromLocalStorage();
    var itemIndex = goods.findIndex(function(lsItem) {
      return lsItem.id === itemObject.id;
    });
    goods[itemIndex] = itemObject;
    localStorage.goods = JSON.stringify(goods);
  }

});
