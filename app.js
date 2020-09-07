// STORAGE Controller
const StorageCtrl = (function () {
  return {
    storeItem: function (item) {
      let items
      // check if any items in LS
      if (localStorage.getItem('items') === null) {
        items = []
        // push new item
        items.push(item)
        // set local storage
        localStorage.setItem('items', JSON.stringify(items))
      } else {
        // get what is already there in LS
        items = JSON.parse(localStorage.getItem('items'))
        // push new item
        items.push(item)
        // reset LS
        localStorage.setItem('items', JSON.stringify(items))
      }
    },
    getItemsFromStorage: function () {
      let items
      if (localStorage.getItem('items') === null) {
        items = []
      } else {
        items = JSON.parse(localStorage.getItem('items'))
      }
      return items
    },
    updateItemStorage: function (updatedItems) {
      localStorage.setItem('items', JSON.stringify(updatedItems))
    },
    deleteItemFromStorage: function (afterDeleteItems) {
      localStorage.setItem('items', JSON.stringify(afterDeleteItems))
    },
    clearItemsFromStorage: function () {
      localStorage.removeItem('items')
    }
  }
})()

// ITEM Controller
const ItemCtrl = (function () {
  const Item = function (id, name, calories) {
    this.id = id
    this.name = name
    this.calories = parseInt(calories)
  }
  const data = {
    items: StorageCtrl.getItemsFromStorage(),
    currentItem: null,
    totalCalories: 0
  }
  return {
    createItem: function (name, calories) {
      let id
      if (data.items.length === 0) {
        id = 0
      } else {
        id = data.items[data.items.length - 1].id + 1
      }
      const newItem = new Item(id, name, calories)
      data.items.push(newItem)
      data.totalCalories = parseInt(data.totalCalories)
      data.totalCalories += parseInt(calories)
      return newItem
    },
    setCurrentItem: function (item) {
      data.currentItem = item
    },
    getCurrentItem: function () {
      return data.currentItem
    },
    getAllItems: function () {
      return data.items
    },
    getTotalCalories: function () {
      return data.totalCalories
    },
    calculateTotalCalories: function () {
      let totalCalories = 0
      const allItems = ItemCtrl.getAllItems()
      allItems.forEach(function (item) {
        totalCalories += parseInt(item.calories)
      })
      data.totalCalories = totalCalories
    },
    updateItem: function (id, name, calories) {
      const ID = parseInt(id.split('-')[1])
      const allItems = ItemCtrl.getAllItems()
      allItems.forEach(function (item) {
        if (item.id === ID) {
          item.name = name
          item.calories = parseInt(calories)
        } else {
          item.calories = parseInt(item.calories)
        }
      })
      data.items = allItems
      // update items in LS
      StorageCtrl.updateItemStorage(allItems)
      UICtrl.updateUI(data.items)
    },
    deleteItem: function (id) {
      const ids = data.items.map(function (item) {
        return item.id
      })
      const index = ids.indexOf(parseInt(id))
      data.items.splice(index, 1)
      StorageCtrl.deleteItemFromStorage(data.items)
      UICtrl.updateUI(data.items)
    },
    clearAll: function () {
      data.items = []
      StorageCtrl.clearItemsFromStorage()
      UICtrl.updateUI(data.items)
    }
  }
})()

// UI Controller
const UICtrl = (function () {
  const UISelectors = {
    mealName: '#mealName',
    mealCalories: '#mealCalories',
    table: '#mealList',
    tableBody: '#tableBody',
    totalCaloriesDiv: '.totalCalories',
    addItem: '#addItem',
    updateItem: '#updateItem',
    deleteItem: '#deleteItem',
    clearAll: '#clearAll',
    backBtn: '#backBtn',
    itemRow: '.itemRow'
  }
  return {
    populateItemList: function (items) {
      let tableRow = ''
      items.forEach(function (item) {
        tableRow += `
        <tr class='itemRow' id='item-${item.id}'>
          <td>${item.name}</td>
          <td>${item.calories}</td>
          <td><i class="far fa-edit"></i></td>
        </tr>
        `
      })
      document.querySelector(UISelectors.tableBody).innerHTML = tableRow
    },
    populateTotalCalories: function () {
      ItemCtrl.calculateTotalCalories()
      const totalCalories = ItemCtrl.getTotalCalories()
      document.querySelector(UISelectors.totalCaloriesDiv).innerHTML = `
        <h4 class="text-center">Total Calories : ${totalCalories}</h4>
      `
    },
    populateForm: function () {
      const currentItem = ItemCtrl.getCurrentItem()
      document.querySelector(UISelectors.mealName).value = currentItem.name
      document.querySelector(UISelectors.mealCalories).value = currentItem.calories
    },
    getUISelectors: function () {
      return UISelectors
    },
    openEditState: function () {
      document.querySelector(UISelectors.addItem).style.display = 'none'
      document.querySelector(UISelectors.clearAll).style.display = 'none'
      document.querySelector(UISelectors.updateItem).style.display = 'inline'
      document.querySelector(UISelectors.deleteItem).style.display = 'inline'
      document.querySelector(UISelectors.backBtn).style.display = 'inline'
    },
    closeEditState: function () {
      document.querySelector(UISelectors.addItem).style.display = 'inline'
      document.querySelector(UISelectors.clearAll).style.display = 'inline'
      document.querySelector(UISelectors.updateItem).style.display = 'none'
      document.querySelector(UISelectors.deleteItem).style.display = 'none'
      document.querySelector(UISelectors.backBtn).style.display = 'none'
      document.querySelector(UISelectors.mealName).value = ''
      document.querySelector(UISelectors.mealCalories).value = ''
    },
    updateUI: function (items) {
      this.populateItemList(items)
      ItemCtrl.calculateTotalCalories()
      this.populateTotalCalories()
    }
  }
})()

// APP Controller
const App = (function (ItemCtrl, StorageCtrl, UICtrl) {
  const loadAllEventListeners = function () {
    const UISelectors = UICtrl.getUISelectors()
    document.querySelector(UISelectors.addItem).addEventListener('click', addItemSubmit)
    // disable submit on enter
    document.addEventListener('keypress', function (e) {
      if (e.keyCode === 13 || e.which === 13) {
        e.preventDefault()
        return false
      }
    })
    document.querySelector(UISelectors.tableBody).addEventListener('click', clickEditSubmit)
    document.querySelector(UISelectors.backBtn).addEventListener('click', function (e) {
      UICtrl.closeEditState()
      e.preventDefault()
    })
    document.querySelector(UISelectors.updateItem).addEventListener('click', clickUpdateSubmit)
    document.querySelector(UISelectors.deleteItem).addEventListener('click', clickDeleteSubmit)
    document.querySelector(UISelectors.clearAll).addEventListener('click', clickClearAllSubmit)
  }
  const addItemSubmit = function (e) {
    const UISelectors = UICtrl.getUISelectors()
    const name = document.querySelector(UISelectors.mealName).value
    const calories = document.querySelector(UISelectors.mealCalories).value
    if (name !== '' && calories !== '') {
      const newItem = ItemCtrl.createItem(name, calories)
      App.init()
      // store in LS
      StorageCtrl.storeItem(newItem)
      document.querySelector(UISelectors.mealName).value = ''
      document.querySelector(UISelectors.mealCalories).value = ''
    }
    e.preventDefault()
  }
  const clickEditSubmit = function (e) {
    if (e.target.classList.contains('fa-edit')) {
      UICtrl.openEditState()
      const UISelectors = UICtrl.getUISelectors()
      const currentItemId = e.target.parentNode.parentNode.id
      const currentItemName = e.target.parentNode.parentNode.children[0].textContent
      const currentItemCalories = e.target.parentNode.parentNode.children[1].textContent
      const currentItem = { id: currentItemId, name: currentItemName, calories: currentItemCalories }
      ItemCtrl.setCurrentItem(currentItem)
      UICtrl.populateForm()
    }
    e.preventDefault()
  }
  const clickUpdateSubmit = function (e) {
    const UISelectors = UICtrl.getUISelectors()
    const updateItem = ItemCtrl.getCurrentItem()
    const updateItemId = updateItem.id
    const updateItemName = document.querySelector(UISelectors.mealName).value
    const updateItemCalories = parseInt(document.querySelector(UISelectors.mealCalories).value)
    ItemCtrl.updateItem(updateItemId, updateItemName, updateItemCalories)
    e.preventDefault()
  }
  const clickDeleteSubmit = function (e) {
    const currentItem = ItemCtrl.getCurrentItem()
    const currentItemId = currentItem.id.split('-')[1]
    ItemCtrl.deleteItem(currentItemId)
    UICtrl.closeEditState()
    e.preventDefault()
  }
  const clickClearAllSubmit = function (e) {
    ItemCtrl.clearAll()
    e.preventDefault()
  }
  return {
    init: function () {
      const items = ItemCtrl.getAllItems()
      UICtrl.populateItemList(items)
      UICtrl.populateTotalCalories()
      loadAllEventListeners()
    }
  }
})(ItemCtrl, StorageCtrl, UICtrl)

App.init()