document.addEventListener("DOMContentLoaded", function(event) {
  // CONSTANTS
  var ADD_ITEM_INPUT_ID = 'add-item';
  var DELETE_ALL_CLASS = 'js-clear-all';
  var DELETE_ITEM_CLASS = 'delete-item';
  var EDIT_ITEM_CLASS = 'edit-item';
  var GOODS_CONTAINER_ID = 'goods-list';
  var IGNORE_CLICK_CLASS = 'ignore-click';
  var ITEM_EXAMPLE_ID = 'list-item-example';
  var ITEM_CLASS = 'list-item';
  var ITEM_CONTENT_CLASS = 'item-content';
  var KEYCODE_ENTER = 13;
  var KEYCODE_ESC = 27;
  var MARKER_CLASS = 'mark-item';
  var TOGGLE_ALL_CLASS = 'js-toggle-all';
  //
  // add existing items into list
  var goods = ['apples', 'cucumbers'];
  for (var i = 0; i < goods.length; i++) {
    addItem(goods[i]);
  }

  // event listeners
  // add item on enter
  var addItemInput = document.getElementById(ADD_ITEM_INPUT_ID);
  addItemInput.addEventListener('keydown', addItemOnEnter);
  // ignore click
  var linksWhichShouldBeIgnored = document.getElementsByClassName(IGNORE_CLICK_CLASS);
  for (var i = 0; i < linksWhichShouldBeIgnored.length; i++) {
    ignoreClickLister(linksWhichShouldBeIgnored[i]);
  }
  // clear list
  document.getElementsByClassName(DELETE_ALL_CLASS)[0].addEventListener('click', clearList);
  // mark whole list
  document.getElementsByClassName(TOGGLE_ALL_CLASS)[0].addEventListener('click', toggleList);


  function addItemOnEnter(event) {
    if(event.which == KEYCODE_ENTER) {
      if(this.value == '') return false;
      addItem();
      // clear inout
      addItemInput.value = '';
    }
  }

  function ignoreClickLister(element) {
    element.addEventListener('click', function (event) {
      event.preventDefault();
    });
  }

  function addItem(value) {
    var itemExample = document.getElementById(ITEM_EXAMPLE_ID);
    var newItem = itemExample.cloneNode(true);
    // prepare element for inserting
    newItem.id = '';
    newItem.getElementsByTagName('span')[0].innerText = value || addItemInput.value;
    showElement(newItem);

    // add event listeners

    // ignore click on delete
    ignoreClickLister(newItem.getElementsByClassName('ignore-click')[0]);
    // remove from list on delete
    newItem.getElementsByClassName(DELETE_ITEM_CLASS)[0].addEventListener('click', deleteItem);
    // edit on doubleclick
    newItem.getElementsByClassName(ITEM_CONTENT_CLASS)[0].addEventListener('dblclick', enableEditItem);

    // add element into the list
    var goodsItemsContainer = document.getElementById(GOODS_CONTAINER_ID);
    goodsItemsContainer.appendChild(newItem);
  }

  function clearList() {
    var itemExampleCopy = document.getElementById(ITEM_EXAMPLE_ID).cloneNode(true);
    var goodsItemsContainer = document.getElementById(GOODS_CONTAINER_ID);
    var items = goodsItemsContainer.getElementsByClassName(ITEM_CLASS);
    goodsItemsContainer.innerHTML = '';
    goodsItemsContainer.appendChild(itemExampleCopy);
  }

  function toggleList() {
    var goodsItemsContainer = document.getElementById(GOODS_CONTAINER_ID);
    var itemCheckboxes = goodsItemsContainer.getElementsByClassName(MARKER_CLASS);
    for (var i = 0; i < itemCheckboxes.length; i++) {
      itemCheckboxes[i].checked = this.checked;
    }
  }

  function deleteItem() {
    var goodsItemsContainer = document.getElementById(GOODS_CONTAINER_ID);
    goodsItemsContainer.removeChild(this.parentNode);
  }

  function enableEditItem() {
    var itemTextNode = this;
    var itemInput = this.parentNode.getElementsByClassName(EDIT_ITEM_CLASS)[0];
    var oldValue = itemTextNode.innerText;
    itemInput.value = oldValue;
    itemInput.addEventListener('keydown', updateItemOnEnter);
    itemInput.addEventListener('keydown', discardItemChangesOnEscape);

    hideElement(itemTextNode);
    showElement(itemInput);

    function discardItemChangesOnEscape(event) {
      if(event.which == KEYCODE_ESC) {
        hideElement(itemInput);
        showElement(itemTextNode);
      }
    }

    function updateItemOnEnter(event) {
      if(event.which == KEYCODE_ENTER) {
        itemTextNode.innerText = this.value;
        hideElement(itemInput);
        showElement(itemTextNode);
      }
    }
  }

  function hideElement(element) {
    element.classList.add('hidden');
  }

  function showElement(element) {
    element.classList.remove('hidden');
  }
});
