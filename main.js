var taskList = [];
let chosenTask = '';

function Task(date, duration, text) {
  this.date = date; // Time as Javascript date
  this.duration = duration; // Duration in milliseconds
  this.text = text;

  this.height = function() { // Pixelheight is 1 minute = 1 px
    return this.duration / 60000
  }

  this.fuzzyness = function() {
    if (this.text == '') {
      return 'isNullTime'
    } else if (this.duration == '0' &&  (typeof(this.date) == 'number')) { // No starttime or duration
      return 'isFuzzy'
    } else if (this.duration != '0' &&  (typeof(this.date) == 'number')) { // No starttime, but duration
      return 'isFuzzyish'
    } else {
      return 'isNotFuzzy'
    }
  }
}

function setUpFunc() {
  // Create 24h nullTime
  let now = new Date();
  let fullNullStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 1);
  let day24h = 24 * 3600 * 1000;
  let startNullTime = new Task(fullNullStart, day24h, '');
  taskList.push(startNullTime);

  // Create a 15 minute planning time as a starting point
  let planningTask = new Task(now, 15 * 60000, 'Planning');
  insertFixTimeTask(planningTask);

  // taskList.forEach(renderTasks) // Draws task based on the content of the taskList
  renderTasks();
  resetInputBox();
}

function resetInputBox() {
  document.getElementById('inputBox').value = '';
  document.getElementById('inputBox').focus();
}

function insertFixTimeTask(fixTimeTask) {
  taskList.forEach((item, i) => {
    if (item.fuzzyness() == 'isNullTime') { // Find first nullTime slot
      if ((item.date <= fixTimeTask.date) && (fixTimeTask.duration < item.duration)) {

        null1Duration = fixTimeTask.date - item.date;
        let null1 = new Task(item.date, null1Duration, '')

        null2Duration = item.date.getTime() + item.duration - fixTimeTask.date.getTime() - fixTimeTask.duration;
        let endTime = new Date(fixTimeTask.date.getTime() + fixTimeTask.duration);
        let null2 = new Task(endTime, null2Duration, '');

        taskList.splice(i, 1, null1, fixTimeTask, null2);
      }
    }
  });
}

function renderTasks() {
  const dayNode = document.getElementById('day');
  while (dayNode.firstChild) { // Remove old task from view
    dayNode.removeChild(dayNode.lastChild);
  }

  taskList.forEach((task, index) => {  // Refresh view from taskList
    let newNode = document.createElement('div');
    newNode.setAttribute('id', index);
    newNode.classList.add(task.fuzzyness());
    if (task.fuzzyness() == 'isFuzzy' || index == 0) {
      newNode.style['line-height'] = '30px';
      newNode.style.height = '30px';
    } else {
      newNode.setAttribute('onClick', 'taskHasBeenClicked(this.id)');  // TODO: addEventListener here?
      newNode.style.height = task.height() + 'px';
      newNode.style['line-height'] = task.height() + 'px';
    }

    let nodeText = textExtractor(task);
    let textNode = document.createTextNode(nodeText);
    newNode.appendChild(textNode);
    document.getElementById('day').insertAdjacentElement('beforeend', newNode);
  });
}

function textExtractor(task) {
  let text = '';

  if (task.duration != '') {
    let hours = Math.floor(task.duration / 3600000);
    let minutes = Math.floor((task.duration - hours * 3600000) / 60000);
    if (hours > 0) {
      text = '(' + hours + 'h' + minutes + 'm)';
    } else {
      text = '(' + minutes + 'm) ' + task.text;
    }
  }

  if (task.date != '') {
    let timeH = task.date.getHours();
    let timeM = task.date.getMinutes();
    let endTime = new Date(task.date.getTime() + task.duration);
    let endH = endTime.getHours();
    let endM = endTime.getMinutes();
    let nils = ['', '', '', ''];
    if (timeH < 10) {
      nils[0] = '0';
    }
    if (timeM < 10) {
      nils[1] = '0';
    }
    if (endH < 10) {
      nils[2] = '0';
    }
    if (endM < 10) {
      nils[3] = '0';
    }
    text1 = nils[0] + timeH + ':' + nils[1] + timeM + '-';
    text = text1 + nils[2] + endH + ':' + nils[3] + endM + ' ' + text;
  }

  return text
}

function taskHasBeenClicked(myId) { // myId is the id of the clicked task. (Duh)
  contentInputBox = document.getElementById('inputBox').value.trim();
  editButton = document.getElementById('editButton');

  if (contentInputBox !== '' && !chosenTask) {
    // Text in inputBox and no chosenTask. Create new task and insert before clicked element
    parsedList = parseText(contentInputBox);
    newTask = new Task(parsedList[0], parsedList[1], parsedList[2]);
    taskList.splice(myId, 0, newTask);
  } else if (contentInputBox !== '' && chosenTask){
    // Text in inputbox and a chosenTask. Should not happen.
    console.log('Text in inputbox and a chosenTask. Should not happen.');
  }  else if (contentInputBox == '' && !chosenTask) {
    // No text in inputBox and no chosenTask: Getting ready to Edit, delete or clone
    chosenTask = document.getElementById(myId);
    chosenTask.classList.add('isClicked');

    editButton.innerText = 'Edit';
    editButton.dataset.clonemode = 'true' // If a task is chosen it can mean swap or edit/clone/delete
  } else if (contentInputBox == '' && chosenTask) {
    // No text in inputBox and a chosenTask: Swap elements
    taskList.splice(myId, 0, chosenTask);

    resetInputBox();
    chosenTask = '';
    editButton.innerText = 'Clear';
    editButton.dataset.clonemode = 'false'
  }

  renderTasks(); // Draws task based on the content of the taskList
  if (!editButton.dataset.clonemode) {
    resetInputBox();
  }
}

function parseText(rawText) {
  let taskStart = '';

  let minutes = /[0-9]+m/.exec(rawText);
  if (minutes) { // If 30m is in rawText store number in minutes and remove 30m from rawText
    minutes = /[0-9]+/.exec(minutes).toString();
    rawText = rawText.replace(minutes + 'm', '')
  } else {
    minutes = '0';
  };

  let hours = /[0-9]+h/.exec(rawText);
  if (hours) { // If 2h is in rawText store number in minutes and remove 2h from rawText
    hours = /[0-9]+/.exec(hours).toString();
    rawText = rawText.replace(hours + 'h', '')
  } else {
    hours = '0';
  };

  // Make duration in milliseconds form hours and minutes
  let duration = hours * 3600000 + minutes * 60000;

  let time = /[0-9]?[0-9]:?[0-9][0-9]/.exec(rawText);
  if (time) { // If 1230 or 12:30 is in rawText store numbers in hours and minutes and remove 1230 from rawText
    time.toString().replace(':', '');
    time = time[0].toString();
    if (time.length == 4) {
      timeH = /[0-9][0-9]/.exec(time).toString();
    } else if (time.length == 3) {
      timeH = /[0-9]/.exec(time).toString();
    }
    time = time.replace(timeH, '')
    timeM = /[0-9][0-9]/.exec(time).toString();
    rawText = rawText.replace(timeH + timeM, '')
    // Make new datetime from timeM and timeH
    let now = new Date();
    taskStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), timeH, timeM);
  } else {
    timeM = '-1';
    timeH = '-1';
    taskStart = '';
  };


  // let drain = /d[1-5]./.exec(rawText);
  // if (/d[1-5]./.exec(drain)) {
  //   drain = /[1-5]/.exec(drain).toString();
  //   rawText = rawText.replace('d' + drain, '');
  // } else {
  //   drain = '-1';
  //   // rawText = rawText.replace('d', '');
  // };

  let text = rawText.trim();
  text = text.slice(0, 1).toUpperCase() + text.slice(1, );

  parsedList = [taskStart, duration, text];
  return parsedList;
}
