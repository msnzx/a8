'use strict'

const $ = document.querySelector.bind(document)

// login link action
$('#loginLink').addEventListener('click', openLoginScreen)

// register link action
$('#registerLink').addEventListener('click', openRegisterScreen)

// logout link action
$('#logoutLink').addEventListener('click', () => {
  // remove authToken from localStorage
  localStorage.removeItem('authToken')

  openLoginScreen()
})

// Sign In button action
$('#loginBtn').addEventListener('click', () => {
  // check to make sure username/password aren't blank
  if (!$('#loginUsername').value || !$('#loginPassword').value) return

  fetch(`/users/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: $('#loginUsername').value,
      password: $('#loginPassword').value
    })
  })
    .then((res) => res.json())
    .then((doc) => {
      if (doc.error) {
        showError(doc.error)
      } else {
        localStorage.setItem('authToken', doc.authToken)
        openHomeScreen(doc)
      }
    })
    .catch((err) => showError('ERROR: ' + err))
})

// Register button action
$('#registerBtn').addEventListener('click', () => {
  // check to make sure no fields aren't blank
  if (
    !$('#registerUsername').value ||
    !$('#registerPassword').value ||
    !$('#registerName').value ||
    !$('#registerEmail').value
  ) {
    showError('All fields are required.')
    return
  }
  // grab all user info from input fields, and POST it to /users
  var data = {
    username: $('#registerUsername').value,
    password: $('#registerPassword').value,
    name: $('#registerName').value,
    email: $('#registerEmail').value
  }

  fetch('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then((res) => res.json())
    .then((doc) => {
      if (doc.error) {
        console.log({ doc })
        showError(doc.error)
      } else {
        localStorage.setItem('authToken', doc.authToken)
        openHomeScreen(doc)
      }
    })
    .catch((err) => {
      console.log({ err })

      showError('ERROR: ')
    })
})

// Update button action
$('#updateBtn').addEventListener('click', () => {
  // check to make sure no fields aren't blank
  if (!$('#updateName').value || !$('#updateEmail').value) {
    showError('Fields cannot be blank.')
    return
  }
  // grab all user info from input fields
  var data = {
    name: $('#updateName').value,
    email: $('#updateEmail').value
  }

  const authToken = localStorage.getItem('authToken')

  fetch(`/users/${$('#username').innerText}/${authToken}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then((res) => res.json())
    .then((doc) => {
      if (doc.error) {
        showError(doc.error)
      } else if (doc.ok) {
        alert('Your name and email have been updated.')
      }
    })
    .catch((err) => showError('ERROR: ' + err))
})

// Delete button action
$('#deleteBtn').addEventListener('click', () => {
  // confirm that the user wants to delete
  if (!confirm('Are you sure you want to delete your profile?')) return

  const authToken = localStorage.getItem('authToken')

  fetch(`/users/${$('#username').innerText}/${authToken}`, {
    method: 'DELETE'
  })
    .then((res) => res.json())
    .then((doc) => {
      if (doc.error) {
        showError(doc.error)
      } else {
        openLoginScreen()
      }
    })
    .catch((err) => showError('ERROR: ' + err))
})

function showListOfUsers() {
  fetch('/users')
    .then((res) => res.json())
    .then((docs) => {
      docs.forEach(showUserInList)
    })
    .catch((err) => showError('Could not get user list: ' + err))
}

function showUserInList(doc) {
  // add doc.username to #userlist
  var item = document.createElement('li')
  $('#userlist').appendChild(item)
  item.innerText = doc._id
}

function showError(err) {
  // show error in dedicated error div
  $('#error').innerText = err
}

function resetInputs() {
  // clear all input values
  var inputs = document.getElementsByTagName('input')
  for (var input of inputs) {
    input.value = ''
  }
}

function openHomeScreen(doc) {
  // hide other screens, clear inputs, clear error
  $('#loginScreen').classList.add('hidden')
  $('#registerScreen').classList.add('hidden')
  resetInputs()
  showError('')
  // reveal home screen
  $('#homeScreen').classList.remove('hidden')
  // display name, username
  $('#name').innerText = doc.name
  $('#username').innerText = doc._id
  // display updatable user info in input fields
  $('#updateName').value = doc.name
  $('#updateEmail').value = doc.email
  // clear prior userlist
  $('#userlist').innerHTML = ''
  // show new list of users
  showListOfUsers()
}

function openLoginScreen() {
  // hide other screens, clear inputs, clear error
  $('#registerScreen').classList.add('hidden')
  $('#homeScreen').classList.add('hidden')
  resetInputs()
  showError('')
  // reveal login screen
  $('#loginScreen').classList.remove('hidden')
}

function openRegisterScreen() {
  // hide other screens, clear inputs, clear error
  $('#loginScreen').classList.add('hidden')
  $('#homeScreen').classList.add('hidden')
  resetInputs()
  showError('')
  // reveal register screen
  $('#registerScreen').classList.remove('hidden')
}