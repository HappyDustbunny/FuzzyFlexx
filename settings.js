let weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Extra store 1', 'Extra store 2', 'Extra store 3'];

// window.addEventListener('storage', function(e) {
//   localStorage.setItem(e.key, e.newValue);
// });

document.getElementById('apply1').addEventListener('click', apply1);
document.getElementById('apply2').addEventListener('click', apply2);
document.getElementById('apply3').addEventListener('click', applyStressModel);
document.getElementById('goBack').addEventListener('click', goBack);
document.getElementById('inputBoxM').addEventListener('focus', inputBoxMGotFocus);
document.getElementById('storeList').addEventListener('click', storeList);
document.getElementById('stores').addEventListener('click', function () { storeHasBeenClicked(event); }, true);
// document.getElementById('stressLevel').addEventListener('click', setStressLevel);
// document.getElementById('tDouble').addEventListener('click', setTDouble);

function storeList() {
  let storeButtons = document.getElementsByClassName('store');
  for (const button of storeButtons) {
    if (/\d/.exec(button.id)) { // Only buttons with a number in their id gets highlighted
      button.classList.add('highLighted');
    }
  }
}

function storeHasBeenClicked(event) {
  let id = event.target.id;
  let text = '';
  let clickedButton = document.getElementById(id);

  if (id === 'lastTaskList') {
    // Restore stuff from trashBin
    let trash = JSON.parse(localStorage.getItem(id));
    localStorage.setItem('lastTaskList', JSON.stringify(localStorage.taskListAsText)); // Move current tasklist to trash bin
    localStorage.taskListAsText = trash;
    window.location.assign('main.html');
  }

  // Ask for new label and tidy button up
  if (clickedButton.classList.contains('highLighted')) {
    if (clickedButton.classList[0] === 'notInUse') {
      clickedButton.classList.remove('notInUse');
    }
    if (localStorage.taskListAsText != '[]') {
      text = prompt('Change label of the stored list?', clickedButton.innerText);
    }
    if (text === '' || text === null) {
      localStorage.setItem(id + 'label', clickedButton.innerText);
    }
    else if (/^[^'!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']+$/.exec(text)) { // Sanitize input: only alpha numericals
      text = text.slice(0, 1).toUpperCase() + text.slice(1, );
      clickedButton.innerText = text;
      localStorage.setItem(id + 'label', text);
    } else if (text != '') {
      alert('Limit your charcters to letters and numbers, please.');
      return;
    }
    // Store stuff
    localStorage.setItem(id, JSON.stringify(localStorage.taskListAsText));
    if (localStorage.taskListAsText === '[]') {
      clickedButton.classList.remove('inUse');
      clickedButton.classList.add('notInUse');
      clickedButton.innerText = weekDays[/\d/.exec(clickedButton.id) - 1]
      displayMessage('Stored list is cleared', 3000)
    } else {
      displayMessage('Current task list stored in ' + clickedButton.innerText, 3000);
    }
    setTimeout(function() {window.location.assign('main.html');}, 3500);
    // window.location.assign('main.html');
  } else if (localStorage.getItem(id)) { // Get stuff
    localStorage.setItem('lastTaskList', JSON.stringify(localStorage.taskListAsText)); // Move current tasklist to trash bin
    localStorage.taskListAsText = JSON.parse(localStorage.getItem(id)); // Let current tasklist be chosen stored tasklist
    window.location.assign('main.html');
  } else {
    displayMessage('This store is empty', 3000);
  }

  // Remove highlights
  let storeButtons = document.getElementsByClassName('store');
  for (const button of storeButtons) {
    if (/\d/.exec(button.id)) { // Only buttons with a number in their id gets highlighted
      button.classList.remove('highLighted');
    }
  }

}


function setUpFunc() {
  let storeButtons = document.getElementsByClassName('store');
  for (const button of storeButtons) {
    if ((localStorage.getItem(button.id) === null) || JSON.parse(localStorage.getItem(button.id)) === "[]") {
      button.classList.add('notInUse');
      button.innerText = weekDays[/\d+/.exec(button.id) - 1]
    } else {
      button.classList.remove('notInUse');
      button.classList.add('inUse');
      button.innerText = localStorage.getItem(button.id + 'label');
    }
  }
  if (localStorage.defaultTaskDuration) {
    document.getElementById('inputBoxM').value = localStorage.defaultTaskDuration;
  }
  if (localStorage.wakeUpStress) {
    document.getElementById('stressLevel').value = localStorage.wakeUpStress;
  }
  if (localStorage.tDouble) {
    document.getElementById('tDouble').value = localStorage.tDouble;
  }
}

function inputBoxMGotFocus() {
  document.getElementById('inputBoxM').select();
}


function applyTaskDuration() {

  let min = document.getElementById('inputBoxM').value.trim();

  if (isNaN(min) || min < 0 || 24*60 - 2 < min) {
    displayMessage('Use only numbers between 0 and 1438, please.', 3000);
    document.getElementById('inputBoxM').select();
    return;
  }

  window.location.assign('main.html');
}


function applyToc() {

 let radioButtonResult = document.getElementsByClassName('alarm');
 for (var i = 0; i < 4; i++) {
   if (radioButtonResult[i].type === 'radio' && radioButtonResult[i].checked) {
     localStorage.radioButtonResult = radioButtonResult[i].value;
   }
 }

  localStorage.defaultTaskDuration = min;

  window.location.assign('main.html');
}


// function clearDay() {
//   let answer = confirm('Do you want to remove all tasks and start planning a new day?');
//   if (answer == true) {
//     localStorage.taskListAsText = [];
//     localStorage.wakeUpOrNowClickedOnce = false;
//     window.location.assign('main.html');
//   } else {
//     displayMessage('Nothing was changed', 3000);
//   }
// }


function goBack() {
  window.location.assign('main.html');
}

function displayMessage(text, displayTime) {
  console.log(text);
  msg = document.getElementById('message');
  msg.style.display = 'inline-block';
  msg.style.color = 'red';
  msg.innerText = text;

  setTimeout(function() {msg.style.display = 'none';}, displayTime)
}


function applyStressModel() {
  // Set wakeup stress level
  let value = document.getElementById('stressLevel').value.trim();
  if (isNaN(value) || value < 0 || 9 < value) {
    displayMessage('Use only numbers between 0 and 9, please', 3000);
    document.getElementById('stressLevel').select();
  } else {
    localStorage.wakeUpStress = value;
  }

  // Set tDouble
  let min = document.getElementById('tDouble').value.trim();
  if (isNaN(min) || min < 0 || 24*60 < min) {
    displayMessage('Use only numbers between 0 and 1438, please', 3000);
    document.getElementById('stressLevel').select();
  } else {
    localStorage.tDouble = min;
  }

  window.location.assign('main.html');
}