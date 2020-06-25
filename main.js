let taskList = [];  // List to keep track of the order of the tasks
let lastTaskList = [];
let startAndEndTimes = [];
let chosenTask = '';
let chosenTaskId = '';  // When a task is clicked information about that task is stored here
let uniqueIdOfLastTouched = 0;
let uniqueIdList = [];
let nullTimeClicked = false;
let zoom = 0.5;  // The height of all elements will be multiplied with zoom. Values can be 1 or 0.5
let zoomSymbolModifyer = 7; // The last digit of the \u numbers \u2357 ⍐ and \u2350 ⍗
let defaultTaskDuration = 30;
let wakeUpH = 7;  // The hour your day start according to settings. This is default first time the page is loaded
let wakeUpM = 0;  // The minutes your day start according to settings
let wakeUpOrNowClickedOnce = false;
let wakeUpStress = 2;  // Stress level is a integer between 1 and 10 denoting percieved stress level with 1 as totally relaxed and 10 stress meltdown
let stressLevel = wakeUpStress;
let tDouble = 240;  // Doubling time for stress level in minutes
let alarmOn = false;

let storage = window.localStorage;
// A list of unique numbers to use as task-ids
// randomList = [117, 9030, 2979, 7649, 700, 3099, 1582, 4392, 3880, 5674, 8862, 5220, 9349, 6299, 1367, 4317, 9225, 1798, 7571, 4609, 6907, 1194, 9487, 9221, 2763, 1553, 128, 1318, 8762, 4974, 6508, 5277, 8256, 3863, 2860, 1904, 1218, 3932, 3615, 7110, 6770, 9075, 5270, 9184, 2702, 1039, 3420, 8488, 5522, 6071, 7870, 740, 2866, 8387, 3628, 5684, 9356, 6843, 9239, 9137, 9114, 5203, 8243, 9374, 9505, 9351, 7053, 4414, 8847, 5835, 9669, 9216, 7724, 5834, 9295, 1948, 8617, 9822, 5452, 2651, 5616, 4355, 1910, 2591, 8171, 7415, 7456, 2431, 4051, 4552, 9965, 7528, 911, 734, 6896, 249, 7375, 1035, 8613, 8836];

// TODO: Inserting at the same time as a fixed task does not generate an error

// console.table(taskList);  // Remember! Shows a table in the console.
// debugger;  // Remember! Stops execution in order to glean the current value of variable

// Daylight saving time shenanigans
let today = new Date();
let january = new Date(today.getFullYear(), 0, 1);
let july = new Date(today.getFullYear(), 6, 1);
const dstOffset = (july.getTimezoneOffset() - january.getTimezoneOffset()) * 60000; // Daylight saving time offset in ms

// Task-object. Each task will be an object of this type
class Task {
  constructor(date, duration, text, drain) {
    this.date = date; // Start time as Javascript date
    this.duration = duration; // Duration in milliseconds
    this.drain = drain;
    this.text = text;
    this.uniqueId = this.giveAUniqueId();
    this.end();
    this.height = this.height();
    this.isClicked = 'isNotClicked'
  }

  giveAUniqueId() {
    let tryAgain = false;
    let uniqueId = 0;
    do {
      tryAgain = false;
      uniqueId = Math.floor(Math.random() * 10000);
      for (const [index, id] of uniqueIdList.entries()) {
        if (uniqueId.toString() === id.toString()) {
          console.log('giveAUniqueId', uniqueId);
          tryAgain = true;
          break;
        }
      }
    }
    while (tryAgain);

    uniqueIdList.push(uniqueId);
    // uniqueIdOfLastTouched = uniqueId;
    return uniqueId;
  }

  end() { // End time as Javascript date
    if (this.date != '') {
      return new Date(this.date.getTime() + this.duration)
    }
  }

  height() { // Pixelheight is 1 minute = 1 px
    return this.duration / 60000
  }
}


// Runs when the page is loaded:
function setUpFunc() {
  retrieveLocallyStoredStuff();

  // fillStressBar();

  fillTimeBar(zoom);

  createTimeMarker();

  updateTimeMarker();

  // makeFirstTasks(); // Moved to retrieveLocallyStoredStuff()

  adjustNowAndWakeUpButtons();  // Needs to be after the first tasks is pushed to taskList because of renderTasks()

  // debugExamples(); // Make debug example tasks. Run from commandline if needed. DO NOT UNCOMMENT

  renderTasks();

  resetInputBox();

  jumpToNow()
}


function createTimeMarker() {
  // Create time marker to show current time on timebar
  let nowSpan = document.createElement('span');
  nowSpan.setAttribute('id', 'nowSpan');
  document.getElementById('container').appendChild(nowSpan);
}


function makeFirstTasks() {
  // Make the first tasks. Necessary for adding new tasks
  let startList = ['000 1m Day start', '2359 1m Day end'];
  for (const [index, text] of startList.entries()) {
    parsedList = parseText(text.trim());
    let task = new Task(parsedList[0], parsedList[1], parsedList[2], parsedList[3]);
    task.fuzzyness = 'isNotFuzzy';
    taskList.push(task);
  }
  localStorage.indexOfLastTouched = 0;
}


function storeLocally() {
  localStorage.taskListAsText = JSON.stringify(taskListExtractor());
  // if (!localStorage.storedTasksList) {
  //   localStorage.storedTasksList = JSON.stringify(storedTasksList);
  // }
  localStorage.wakeUpOrNowClickedOnce = false;
  for (const [index, task] of taskList.entries()) {
    if (task.uniqueId === uniqueIdOfLastTouched) {
      localStorage.indexOfLastTouched = index;
      break;
    }
  }

  localStorage.zoom = zoom;
  // // localStorage.wakeUpH = wakeUpH;
  // // localStorage.wakeUpM = wakeUpM;
  // sessionStorage.chosenTask = '';
  // // sessionStorage.chosenTaskId = chosenTaskId;
  // sessionStorage.uniqueIdList = JSON.stringify(uniqueIdList);
  // sessionStorage.nullTimeClicked = '';
  // sessionStorage.zoomSymbolModifyer = zoomSymbolModifyer;
}


function retrieveLocallyStoredStuff() {
  taskList = [];
  makeFirstTasks();

  if (localStorage.getItem('taskListAsText')) {
    lastTaskList = taskList;
    // localStorage.lastTaskListAsText = JSON.stringify(taskListExtractor()); // TODO: Is this line doing anything??
    taskListAsText = JSON.parse(localStorage.taskListAsText);
    textListToTaskList(taskListAsText);
  }
  // if (localStorage.getItem('storedTasksList')) {
  //   storedTasksList = JSON.parse(localStorage.storedTasksList);
  // }
  if (localStorage.getItem('wakeUpOrNowClickedOnce')) {
    wakeUpOrNowClickedOnce = (localStorage.wakeUpOrNowClickedOnce === 'true');
  }
  // if (sessionStorage.getItem('uniqueIdOfLastTouched')) {
  //   uniqueIdOfLastTouched = localStorage.uniqueIdOfLastTouched;
  // }
  if (localStorage.getItem('defaultTaskDuration')) {
    defaultTaskDuration = localStorage.defaultTaskDuration;
  }

  if (localStorage.getItem('zoom')) {
    zoom = localStorage.zoom;
  }
  // // if (localStorage.getItem('wakeUpH')) {
  // //   wakeUpH = localStorage.wakeUpH;
  // // }
  // // if (localStorage.getItem('wakeUpM')) {
  // //   wakeUpM = localStorage.wakeUpM;
  // // }
  // if (sessionStorage.getItem('chosenTask')) {
  //   chosenTask = sessionStorage.chosenTask;
  // }
  // if (sessionStorage.getItem('chosenTaskId')) {
  //   chosenTaskId = sessionStorage.chosenTaskId;
  // }
  // if (sessionStorage.getItem('uniqueIdList')) {
  //   uniqueIdList = JSON.parse(sessionStorage.uniqueIdList);
  // }
  // if (sessionStorage.getItem('')) {
  //   nullTimeClicked = sessionStorage.nullTimeClicked;
  // }
  // if (sessionStorage.getItem('zoom')) {
  //   zoom = sessionStorage.zoom;
  // }
  // if (sessionStorage.getItem('zoomSymbolModifyer')) {
  //   zoomSymbolModifyer = sessionStorage.zoomSymbolModifyer;
  // }
}


function debugExamples() {
  let exList = [
    '700 debugging example',
    '1h long1',
    '30m short1',
    '30m short2',
    '45m medium1',
    '1200 1h lunch',
    // '1530 1h tea',
    '1h long2' ,
    '45m medium2',
    '30m short3'
  ];

  console.log(exList);

  uniqueIdOfLastTouched = taskList[0].uniqueId;
  textListToTaskList(exList);
  renderTasks();
}


function textListToTaskList(taskListAsText) {
  let succes = false;
  if (taskListAsText === []) {
    makeFirstTasks();
    // storeLocally();
  } else {
    for (const [index, text] of taskListAsText.entries()) {
      let parsedList = parseText(text.trim());
      let id = uniqueIdOfLastTouched;
      let task = new Task(parsedList[0], parsedList[1], parsedList[2], parsedList[3]);
      // console.log(task.text, [].concat(taskList));
      succes = addTask(id, task);
      if (!succes) {console.log('Retrieval got wrong at index ', index);}
    }
  }
  uniqueIdOfLastTouched = taskList[localStorage.indexOfLastTouched].uniqueId;
}

// Clear input box and give it focus
function resetInputBox() {
  document.getElementById('inputBox').value = '';
  document.getElementById('inputBox').focus();
}

// Fill the half hour time slots of the timebar
function fillTimeBar(zoom) {
  for (let i = 0; i < 24; i += 1) {
    let halfHourA = document.createElement('div');  // This IS the most readable and efficient way to make the required text
    let halfHourB = document.createElement('div');

    if (i < 10) {
      halfHourA.innerText = '0' + i + ':00';
      halfHourB.innerText = '0' + i + ':30';
    } else {
      halfHourA.innerText = i + ':00';
      halfHourB.innerText = i + ':30';
    }

    halfHourA.setAttribute('class', 'halfHours' + zoom * 2);
    halfHourA.setAttribute('id', i + '00');
    // halfHourA.classList.add(i + '00');
    halfHourB.setAttribute('class', 'halfHours' + zoom * 2);
    halfHourB.setAttribute('id', i + '30');
    // halfHourB.classList.add(i + '30');
    document.getElementById('timeDiv').appendChild(halfHourA);
    document.getElementById('timeDiv').appendChild(halfHourB);
  }
}


// Update time marker
let timer = setInterval(updateTimeMarker, 1000);

function updateTimeMarker() {
  let now = new Date();
  let hours = now.getHours();
  let min = now.getMinutes();
  let sec = now.getSeconds();
  // The height of the nowSpan is set to the percentage the passed time represents of the number of minutes in a day
  let nowHeight = zoom * ((hours * 60 + min) * 100 ) / (24*60) + '%';
  nowSpanElement = document.getElementById('nowSpan');
  nowSpanElement.style.height = nowHeight;

  let taskAlarms = localStorage.radioButtonResult;
  let nowTime = hours.toString() + min.toString() + sec.toString();
  if (taskAlarms != 'off') {
    if (taskAlarms === 'beginning' || taskAlarms === 'both') {
      if (startAndEndTimes.includes('beginning' + nowTime)) {
        sayToc();
      }
    }
    if (taskAlarms === 'end' || taskAlarms === 'both') {
      if (startAndEndTimes.includes('end' + nowTime)) {
        sayToc();
        setTimeout(sayToc, 300);
      }
    }
  }
}

function sayToc() {
  let sound = new Audio('429721__fellur__tic-alt.wav');
  sound.play();
}

////// Eventlisteners  //////                      // Remember removeEventListener() for anoter time

window.addEventListener('storage', function(e) {
  localStorage.setItem(e.key, e.newValue);
});

// Unfold settings
document.getElementById('settings').addEventListener('click', settings);

// Insert a 15 min planning task at start-your-day time according to settings // TODO: Settings
document.getElementById('upButton').addEventListener('click', wakeUpButton, {once:true});
document.getElementById('upButton').addEventListener('click', function() {jumpToTime(700);}); // // TODO: connect to wakeup time

// Insert a 15 min planning task at the current time
document.getElementById('nowButton').addEventListener('click', nowButton, {once:true});
document.getElementById('nowButton').addEventListener('click', jumpToNow);

// Makes pressing Enter add task
document.getElementById('inputBox').addEventListener('keypress', function () { inputAtEnter(event); });

// Tie event to Clear or Edit button
document.getElementById('editButton').addEventListener('click', clearOrEdit);

// Tie event to zoom button (⍐ / ⍗). Toggles zoom
document.getElementById('zoom').addEventListener('click', zoomFunc);

// Makes clicking anything inside the taskDiv container run taskHasBeenClicked()
document.getElementById('taskDiv').addEventListener('click', function () { taskHasBeenClicked(event); }, true);


// TODO: Make addPause buttons 15m, 30m + ?
// Used by an eventListener. Display settings.
function settings() {
  storeLocally();
  window.location.assign('settings.html')
  // displayMessage('To do: make settings', 5000);
  // Store a day from one session to another
  // Store multiple days? One pr. calender day?
  // Store wake up time (wakeUpH and wakeUpM)
  // Ligth/Dark theme?
  // Store variables descriping stress sensitivity (tHalf stressStart, ...)
}

// Used by an eventListener. Inserts a 15 min planning task at the start of your day
function wakeUpButton() {
  let succes = false;
  let now = new Date();
  let taskStartMinusDst = new Date(now.getFullYear(), now.getMonth(), now.getDate(), wakeUpH, wakeUpM);
  let taskStart = new Date(taskStartMinusDst.getTime() + 0 * dstOffset); // TODO: Remove dstOffset?
  let task = new Task(taskStart, 15 * 60000, 'Planning', 1);
  succes = addFixedTask(task);
  if (!succes) {
    console.log('wakeUpButton failed to insert a task');
  }
  document.getElementById('nowButton').removeEventListener('click', nowButton, {once:true});
  wakeUpOrNowClickedOnce = true;
  adjustNowAndWakeUpButtons();
}


// Used by an eventListener. Inserts a 15 min planning task at the current time
function nowButton() {
  let task = new Task(new Date(), 15 * 60000, 'Planning', 1);
  addFixedTask(task);
  document.getElementById('upButton').removeEventListener('click', wakeUpButton, {once:true});
  wakeUpOrNowClickedOnce = true;
  adjustNowAndWakeUpButtons();
}


function adjustNowAndWakeUpButtons() {
  let min = '';
  let upBtn = document.getElementById('upButton');
  let nowBtn = document.getElementById('nowButton');

  if (parseInt(wakeUpM) <= 9) {
    min = '0' + parseInt(wakeUpM);
  } else {
    min = parseInt(wakeUpM);
  }

  if (!wakeUpOrNowClickedOnce) {
    upBtn.title='Press to insert a 15 min planning period at ' + wakeUpH + ':' + min;
    upBtn.innerText = wakeUpH + ':' + min + '\u25B8';
    nowBtn.innerText = 'Now' + '\u25B8';
  } else {
    upBtn.title = 'Jump to ' + wakeUpH + ':' + min;
    upBtn.innerText = '\u25B8' + wakeUpH + ':' + min;
    nowBtn.title = 'Jump to now';
    nowBtn.innerText = '\u25B8' + 'Now';
  }
  renderTasks();
  document.getElementById('inputBox').focus();
}


// Used by an eventListener. Makes pressing Enter add task
function inputAtEnter(event) {
  if (event.key === 'Enter') {
    let contentInputBox = document.getElementById('inputBox').value.trim();
    if (/[a-c, e-g, i-l, n-z]/.exec(contentInputBox) != null && chosenTaskId === '') {
      let parsedList = parseText(contentInputBox);
      let task = new Task(parsedList[0], parsedList[1], parsedList[2], parsedList[3]);
      if (taskList.length == 1 && parsedList[0] == '') {
        displayMessage('\nPlease start planning with a fixed time \n\nEither press "Now" or add a task at\n6:00 by typing "600 15m planning"\n', 5000);
      } else {
        let succes = addTask(uniqueIdOfLastTouched, task); // TODO: The unique id changes when jumping between pages...

        if (!succes) {
          displayMessage('Not enough room. \nPlease clear some space', 3000);
        }
        renderTasks();
        jumpTo(uniqueIdOfLastTouched)
      }
    } else {
      if (/[^0-9]/.exec(contentInputBox) != null) { // If there is a chosen task AND text it must be an error
        nullifyClick();
      } else if (/\d[0,3][0]/.exec(contentInputBox) != null || /[1-2]\d[0,3][0]/.exec(contentInputBox) != null) {
        // If there is 3-4 numbers, jump to the time indicated
        resetInputBox();
        jumpToTime(contentInputBox);
      } else { // Give up. Something stupid happened.
        displayMessage('The format should be \n1200 1h30m text OR\n1200 text OR\n text OR \n1200 or 1230', 6000)
        resetInputBox();
      }
      // displayMessage('A task needs text ', 3000);
    }
  }
}

function nullifyClick() {
  let myId = getIndexFromUniqueId(chosenTaskId);
  taskList[myId].isClicked = 'isNotClicked';
  chosenTaskId = '';
}

function addTask(myId, task) {
  let succes = false;
  if (task.date == '') {  // No fixed time ...
    succes = addWhereverAfter(myId, task);
  } else {
    succes = addFixedTask(task);
  }
  resetInputBox();
  return succes;
}


function addWhereverAfter(uniqueId, task) {
  let succes = false;
  let myId = getIndexFromUniqueId(uniqueId);
  for (var id=myId; id<taskList.length - 1; id++) {
    succes = addTaskAfter(taskList[id].uniqueId, task);
    resetInputBox();
    if (succes) {
      break;
    }
  }
  return succes;
}


function addTaskAfter(uniqueId, task) {
  let id = getIndexFromUniqueId(uniqueId);
  task.date = taskList[id].end();
  task.end();
  task.fuzzyness = 'isFuzzy';
  if (taskList[id + 1].fuzzyness === 'isFuzzy' || task.end() <= taskList[id + 1].date) {
    taskList.splice(id + 1, 0, task);
    uniqueIdOfLastTouched = task.uniqueId;
    resetInputBox();
    anneal();
    return true;
  } else {
    return false;
  }
}


function addTaskBefore(myId, task) {
  let id = getIndexFromUniqueId(myId);
  task.date = new Date(taskList[id].date.getTime() - task.duration);
  if (taskList[id].fuzzyness != 'isFuzzy' && taskList[id - 1].end() > task.date) {
    displayMessage('Not enough rooom here', 3000);
    return false;
  } else {
    if (taskList[id].fuzzyness === 'isNotFuzzy') {
      task.fuzzyness = 'isNotFuzzy';
    } else {
      task.date = new Date(taskList[id - 1].end());
      task.fuzzyness = 'isFuzzy';
    }
    taskList.splice(id, 0, task);
    uniqueIdOfLastTouched = task.uniqueId;
    resetInputBox();
    anneal();
    return true;
  }
}


function addFixedTask(task) {
  let succes = false;
  let overlap = '';
  let backUpTaskList = [].concat(taskList); // Make a deep copy
  let len = taskList.length;

  overlap = isThereASoftOverlap(task);
  if (overlap === 'hardOverlap') {
    displayMessage('There is an overlap with another fixed time', 3000);
    return false;
  } else if (overlap === 'softOverlap') {
    overlappingTasks = removeFuzzyOverlap(task);
    let id = getIndexFromUniqueId(overlappingTasks[0][0]);
    taskList.splice(id + 1, 0, task);
    task.fuzzyness = 'isNotFuzzy';
    uniqueIdOfLastTouched = task.uniqueId;
    succes = true;
    if (overlappingTasks.length > 0) {
      for (const [index, task] of overlappingTasks.entries()) {
        succes = addWhereverAfter(task[0], task[1]);
      }
    }
  } else if (overlap === 'noOverlap') {
    for (var n=0; n<len; n++) {
      if (task.end() < taskList[n].date) {
        taskList.splice(n, 0, task);
        task.fuzzyness = 'isNotFuzzy';
        uniqueIdOfLastTouched = task.uniqueId;
        succes = true;
        break;
        }
      }
  }

  if (!succes) {
    taskList = [].concat(backUpTaskList);
  }
  return succes;
}


function isThereASoftOverlap(task) {
  let overlap = '';
  let len = taskList.length;

  for (var n=0; n<len; n++) {
    if ((taskList[n].date < task.date && task.date < taskList[n].end())
      || (taskList[n].date < task.end() && task.end() < taskList[n].end())) {
        if (taskList[n].fuzzyness === 'isNotFuzzy') {
          overlap = 'hardOverlap';
          return overlap;
        } else {
          overlap = 'softOverlap';
        }
      }
      if (n === len - 1 && overlap === 'softOverlap') {
        return overlap
      }
  }

  overlap = 'noOverlap';
  return overlap;
}


function removeFuzzyOverlap(task) {
  let overlappingTasks = [];
  let len = taskList.length;
  // debugger;
  for (var n=1; n<len - 1; n++) {
    if ((taskList[n].date < task.date && task.date < taskList[n].end())
    || (taskList[n].date < task.end() && task.end() < taskList[n].end())) {
      if (taskList[n].fuzzyness === 'isNotFuzzy') {
        console.log('Bugger. Logic broke.', taskList[n]);
      };
      overlappingTasks.push([taskList[n - 1].uniqueId, taskList[n]]);
    }
  }
  for (const [index, overlappingTask] of overlappingTasks.entries()) {
    let uniqueId = overlappingTask[1].uniqueId;
    for (const [index, task] of taskList.entries()) {
      if (uniqueId === task.uniqueId) {
        taskList.splice(index, 1);
      }
    }
  }
  return overlappingTasks
}

// Used by an eventListener. Govern the Edit/Clear button
function clearOrEdit() {
  editButton = document.getElementById('editButton');  // TODO: Get ridt of edit? Double click is more natural
  // if (editButton.innerText == 'Edit') {
  //   editTask();
  //   editButton.innerText = 'Clear\u25B8';
  // } else
  if (document.getElementById('inputBox').value != '' ) {
    resetInputBox();
    editButton.innerText = '\u25BEClear'; // TODO: Fix clear button after an edited task is inserted
    id = '';
  } else {
    clearDay();
  }
}


function clearDay() {
  let answer = confirm('Do you want to remove all tasks and start planning a new day?');
  if (answer == true) {
    taskList = [];
    makeFirstTasks();
    wakeUpOrNowClickedOnce = false;
    document.getElementById('upButton').addEventListener('click', wakeUpButton, {once:true});
    document.getElementById('nowButton').addEventListener('click', nowButton, {once:true});
    storeLocally();
    adjustNowAndWakeUpButtons();
    setUpFunc();
  } else {
    displayMessage('Nothing was changed', 3000);
  }
}


function editTask() {
  let id = getIndexFromUniqueId(chosenTaskId);
  taskText = taskList[id].text + ' ' + taskList[id].duration / 60000 + 'm';  //  Save the text from clickedElement
  document.getElementById('inputBox').value = taskText;  // Insert text in inputBox
  taskList.splice(id, 1);
  uniqueIdOfLastTouched = taskList[id - 1].uniqueId;

  document.getElementById('editButton').innerText = 'Clear\u25B8';  // \u23F5
  chosenTaskId = '';
  renderTasks();
  document.getElementById('inputBox').focus();
  let nextLast = taskText.length - 1;
  inputBox.setSelectionRange(nextLast, nextLast); // Makes changing task time easier by focusing just before m in 45m
}

// Used by an eventListener. Toggles zoom.
function zoomFunc() {
  let zoomButton = document.getElementById('zoom');

  zoom = (1 + 0.5) - zoom;
  zoomSymbolModifyer = 7 - zoomSymbolModifyer;

  zoomButton.innerText = String.fromCharCode(9040 + zoomSymbolModifyer); // Toggles between \u2357 ⍐ and \u2350 ⍗

  renderTasks();
  jumpToNow();
}


function createNullTimes() {
  let jumpToId = uniqueIdOfLastTouched;
  stressLevel = wakeUpStress; // Stress level is a integer between 1 and 10 denoting percieved stress level with 1 as totally relaxed and 10 stress meltdown

  displayList = [];
  let duration = 0;

  displayList.push(taskList[0]);
  taskList[0].stressGradient = stressLevel;// TODO: Fix this: stressGradient needs to be a list of 2+ elements

  let len = taskList.length;
  for (var n=1; n<len; n++) {
    duration = taskList[n].date.getTime() - taskList[n-1].end().getTime();
    if (duration > 0) { // Create a nullTime task if there is a timegab between tasks
      let nullTime = new Task(taskList[n-1].end(), duration, '', -1);
      nullTime.uniqueId = taskList[n-1].uniqueId + 'n';
      nullTime.fuzzyness = 'isNullTime';
      // nullTime.drain = -1;
      if (n === 1) {
        let colour = 'hsl(255, 100%, ' + (100 - Math.floor(stressLevel*10)).toString() + '%)';
        nullTime.stressGradient = [colour, colour];
      } else {
        nullTime.stressGradient = getStress(nullTime);
      }
      displayList.push(nullTime);
      duration = 0;
    }
    taskList[n].stressGradient = getStress(taskList[n]);
    displayList.push(taskList[n]);
  }

  uniqueIdOfLastTouched = jumpToId;
  return displayList
}


function getStress(task) {
  console.log(task.text, stressLevel);
  let gradient = ['hsl(255, 100%, ' + (100 - Math.floor(stressLevel * 10)).toString() + '%)'];

  let durationM = Math.floor(task.duration / 60000);
  let stress = 0;
  for (var i = 0; i < durationM; i += 5) {
    stress = stressLevel * Math.pow(2, i/(tDouble/task.drain)); // The stress doubles after the time tDouble (in minutes) - or fall if drain is negative
    // console.log(durationM, i, stressLevel, stress, 100 - Math.floor(stress * 10));
    colourBit = 'hsl(255, 100%, ' + (100 - Math.floor(stress * 10)).toString() + '%)';
    gradient.push(colourBit);
  }

  stressLevel = stress;
  // console.log(gradient);
  console.log(task.text, stressLevel);

  return gradient;
}


function displayMessage(text, displayTime) {
  console.log(text);
  msg = document.getElementById('message');
  msg.style.display = 'inline-block';
  msg.style.color = 'red';
  msg.innerText = text;

  setTimeout(function() {msg.style.display = 'none';}, displayTime)
}


function taskHasBeenClicked(event) {
  let myUniqueId = event.target.id;
  let chosenId = '';
  let id = getIndexFromUniqueId(myUniqueId); // Mostly to check for nulltimes being clicked
  if (chosenTaskId != '') {
    chosenId = getIndexFromUniqueId(chosenTaskId);
  }

  // The eventListener is tied to the parent, so the event given is the parent event
  let contentInputBox = document.getElementById('inputBox').value.trim();
  let editButton = document.getElementById('editButton');

  if (contentInputBox !== '' && !chosenTaskId) {
    // Text in inputBox and no chosenTaskId. Create new task and insert before clicked element
    let contentInputBox = document.getElementById('inputBox').value.trim();
    if (/[a-c, e-g, i-l, n-z]/.exec(contentInputBox) != null) {
      let parsedList = parseText(contentInputBox);
      let task = new Task(parsedList[0], parsedList[1], parsedList[2], parsedList[3]);
      if (nullTimeClicked) {
        nullTimeClicked = false;
        addWhereverAfter(myUniqueId, task);  // Nulltimes shares id with the task before the nulltime
      } else {
        addTaskBefore(myUniqueId, task);
      }
      editButton.innerText = '\u25BEClear';

    } else {
      displayMessage('The format should be \n1200 1h30m text OR\n1200 text OR\n text OR \n1200', 6000)
    }

  } else if (contentInputBox !== '' && chosenTaskId){
    // Text in inputbox and a chosenTaskId. Should not happen.
    nullifyClick();

  }  else if (contentInputBox == '' && !chosenTaskId) {
    // No text in inputBox and no chosenTaskId: Getting ready to Edit, delete or clone
    chosenTask = document.getElementById(myUniqueId);
    // chosenTask.classList.add('isClicked'); // TODO: Affects only DOM. Make it a part of Task
    let myId = getIndexFromUniqueId(myUniqueId);
    taskList[myId].isClicked = 'isClicked'; // TODO: Unclick later
    // editButton.innerText = 'Clear\u25B8';
    chosenTaskId = chosenTask.id;
    uniqueIdOfLastTouched = chosenTaskId;

    // jumpTo(chosenTaskId);

  } else if (contentInputBox == '' && chosenTaskId) {
    // No text in inputBox and a chosenTaskId: Swap elements - or edit if the same task is clicked twice
    if (/[n]/.exec(myUniqueId) != null) {  // If nulltime ...
      displayMessage('Unasigned time can not be edited', 3000);
    } else if (chosenTaskId === myUniqueId) {
      editTask(); // TODO: Edit eats task
    } else if (taskList[chosenId].fuzzyness === 'isNotFuzzy' || taskList[id].fuzzyness === 'isNotFuzzy') {
      displayMessage('A fixed task can not be swapped. \nPlease edit before swap.', 3000)
    } else if (taskList[chosenId].fuzzyness === 'isFuzzy' && taskList[id].fuzzyness === 'isFuzzy') {
      swapTasks(myUniqueId);
    }
    chosenTaskId = '';
    // editButton.innerText = 'Clear\u25B8';  // \u25b8 for small triangle
  }
  renderTasks();

}


function getIndexFromUniqueId(uniqueId) {
  if (/[n]/.exec(uniqueId) != null) {  // Nulltimes have the same unique id as the task before them, but with an 'n' attached
    nullTimeClicked = true;
    uniqueId = /[0-9]*/.exec(uniqueId)[0];
  } else {
    nullTimeClicked = false;
  }
  for (const [index, task] of taskList.entries()) {
    // console.log('get', index, task, task.uniqueId, uniqueId);
    if (task.uniqueId.toString() === uniqueId.toString()) {
      return index
    }
  }
}


function swapTasks(myId) { // TODO: Fix swap by allowing inserting task by moving fuzzy tasks
    let id1 = getIndexFromUniqueId(chosenTaskId);
    let id2 = getIndexFromUniqueId(myId);
    taskList[id1].isClicked = 'isNotClicked';
    taskList[id2].isClicked = 'isNotClicked';
    taskList[id1].date = '';
    taskList[id2].date = '';
    [taskList[id2], taskList[id1]] = [taskList[id1], taskList[id2]];
    anneal();
    uniqueIdOfLastTouched = taskList[id1].uniqueId;
}


function anneal() { // TODO: Tasks can end up after 23:59. At least a warning is needed(?)
  fixTimes();
  let len = taskList.length;
  for (var n=1; n<len - 1; n++) {
    if (taskList[n + 1].date < taskList[n].end()) {
      [taskList[n], taskList[n + 1]] = [taskList[n + 1], taskList[n]];
      fixTimes();
    }
    if (taskList[n + 1].date - taskList[n].end() > 0 && taskList[n + 1].fuzzyness === 'isFuzzy') {
      taskList[n + 1].date = taskList[n].end();
    }
  }
  fixTimes();
}


function fixTimes() {
  let len = taskList.length;
  for (var n=1; n<len - 1; n++) {
    if (taskList[n].end() <= taskList[n + 1].date) {
      continue;
    } else if (taskList[n + 1].fuzzyness === 'isFuzzy') {
      taskList[n + 1].date = taskList[n].end();
    } else {
      // console.log(n, 'Overlapping a fixed task');
    }
  }
}


function renderTasks() {
  let displayList = createNullTimes();

  let taskListAsText = taskListExtractor();
  if (JSON.stringify(taskListAsText)) {
    localStorage.taskListAsText = JSON.stringify(taskListAsText);  // Store a backup of taskList
  }

  clearOldTasksEtc();

  // fillStressBar(zoom);

  // Make new time markings in timeBar
  fillTimeBar(zoom);


  // Refresh view from taskList
  for (const [index, task] of displayList.entries()) {
    // Create tasks as buttons
    let newNode = document.createElement('button');
    newNode.setAttribute('id', task.uniqueId);
    newNode.classList.add(task.fuzzyness);  // Fuzzyness is used for styling tasks
    newNode.classList.add(task.isClicked);
    newNode.classList.add('task');
    if (Number(task.drain) < 0 && task.fuzzyness != 'isNullTime') {
      newNode.classList.add('isGain');
    }

    // Create stress indicators as divs
    let stressMarker = document.createElement('div');
    stressMarker.innerText = ' ! ';
    stressMarker.classList.add('stressDiv');
    stressMarker.setAttribute('style', 'background-image: linear-gradient(' + task.stressGradient + ')');

    // Set the task height
    if (zoom * task.height < 20) {  // Adjust text size for short tasks
      newNode.style['font-size'] = '12px';
      stressMarker.style['font-size'] = '12px';
    } else {
      newNode.style['font-size'] = null;
      stressMarker.style['font-size'] = null;
    }
    newNode.style['line-height'] = zoom * task.height + 'px';
    stressMarker.style['line-height'] = zoom * task.height + 'px';
    newNode.style.height = (zoom * task.height * 100) / (24 * 60) + '%';
    stressMarker.style.height = (zoom * task.height * 100) / (24 * 60) + '%';

    // Write text in task
    let nodeText = textExtractor(task);
    let textNode = document.createTextNode(nodeText);
    newNode.appendChild(textNode);

    // Create the elements
    document.getElementById('stressDiv').appendChild(stressMarker);
    document.getElementById('taskDiv').insertAdjacentElement('beforeend', newNode);
  }
}


function clearOldTasksEtc() {
  // Remove old task from stressDiv
  const stressNode = document.getElementById('stressDiv');
  while (stressNode.firstChild) {
    stressNode.removeChild(stressNode.lastChild);
  }

  // Remove old time markings from timeBar
  const timeNode = document.getElementById('timeDiv');
  while (timeNode.firstChild) { // Remove old task from view
    timeNode.removeChild(timeNode.lastChild);
  }

  // Remove old task from taskDiv
  const taskNode = document.getElementById('taskDiv');
  while (taskNode.firstChild) {
    taskNode.removeChild(taskNode.lastChild);
  }
}


function jumpTo(index) {
  if (document.getElementById('container') !== null  && taskList.length > 0) {
    container = document.getElementById('container');
    container.scrollTop = document.getElementById(index).offsetTop - 180 * zoom;
    // document.getElementById('inputBox').focus();
  }
}


function jumpToNow() {
  if (document.getElementById('container') !== null  && taskList.length > 0) {
    container = document.getElementById('container');
    container.scrollTop = document.getElementById('nowSpan').offsetTop + 600 * zoom;
    // document.getElementById('inputBox').focus();
  }
}


function jumpToTime(time) {
  if (document.getElementById('container') !== null  && taskList.length > 0) {
    container = document.getElementById('container');
    timeDiv = document.getElementById(time);  // time in the format of a string ex: '700'
    if (timeDiv) {
      container.scrollTop = timeDiv.offsetTop - 180 * zoom;
      // document.getElementById('inputBox').focus();
      let min = /[0-9][0-9]$/.exec(time);
      let hours = time.toString().replace(min, '')
      displayMessage('Jumped to ' + hours + ':' + min, 700);
    } else {
      displayMessage('Number not recognised as a time', 1000)
    }
  }
}


function textExtractor(task) {  // Extract the text to be written on screen
  let text = task.text;

  if (task.duration != '') {
    let hours = Math.floor(task.duration / 3600000);
    let minutes = Math.floor((task.duration - hours * 3600000) / 60000);
    if (hours > 0 && minutes > 0) {
      text = '(' + hours + 'h' + minutes + 'm) ' + task.text;
    } else if (hours > 0) {
      text = '(' + hours + 'h' + ') ' + task.text;
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


function taskListExtractor() {  // Make a list of strings that can generate the current taskList
  startAndEndTimes = [];
  let taskListAsText = [];
  for (const [index, task] of taskList.entries()) {
    let timeH = task.date.getHours();
    let timeM = task.date.getMinutes();
    if ((timeH === 0 && timeM === 0) || (timeH === 23 && timeM === 59)) {
      continue;
    }
    let text = task.text;

    if (task.duration != '') {
      let hours = Math.floor(task.duration / 3600000);
      let minutes = Math.floor((task.duration - hours * 3600000) / 60000);
      if (hours > 0 && minutes > 0) {
        text = hours + 'h' + minutes + 'm ' + task.text;
      } else if (hours > 0) {
        text = hours + 'h '  + task.text;
      } else {
        text = minutes + 'm ' + task.text;
      }
      updateStartAndEndTimes(timeH, timeM, hours, minutes); // Makes alarm list for toc
    } else {
      updateStartAndEndTimes(timeH, timeM, 0, 30);
    }

    if (task.fuzzyness === 'isNotFuzzy' && task.date != '') {
      let nils = '';
      if (timeM < 10) {
        nils = '0';
      }
      text = timeH + nils + timeM + ' ' + text;
    }

    text += ' d' + task.drain;

    taskListAsText.push(text);

  }
  return taskListAsText;
}


function updateStartAndEndTimes(timeH, timeM, hours, minutes) { // Makes a list of start and end times for sayToc
  var time = '';
  time = 'beginning' + timeH.toString() + timeM.toString() + '0';
  startAndEndTimes.push(time);
  let endH = timeH + hours;
  let endM = timeM + minutes;
  if (59 < endM) {
    endM -= 60;
    endH += 1;
  }
  time = 'end' + endH.toString() + endM.toString() + '0';
  startAndEndTimes.push(time);
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
  if (duration == 0) {
    duration = defaultTaskDuration * 60000; // If no duration is provided use the default task duration
  }

  let time = /[0-9]?[0-9]:?[0-9][0-9]/.exec(rawText);
  if (time) { // If 1230 or 12:30 is found in rawText store numbers in hours and minutes and remove 1230 from rawText
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
    taskStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), timeH, timeM);  // NO need for DST shenanigans here!
  } else {
    timeM = '-1';
    timeH = '-1';
    taskStart = '';
  };


  let drain = /d+[-]*[1-9]+/.exec(rawText); // TODO: Limit drain to 1-5?
  if (/d+[-]*[1-9]+/.exec(drain)) {
    drain = /[-]*[1-9]/.exec(drain).toString();
    rawText = rawText.replace('d' + drain, '');
  } else {
    drain = '1';
    // rawText = rawText.replace('d', '');
  };

  let gain = /g+[-]*[1-9]+/.exec(rawText); // TODO: Should gain count double?
  if (/g+[-]*[1-9]+/.exec(gain)) {
    gain = /[-]*[1-9]/.exec(gain).toString();
    drain = '-' + gain;
    rawText = rawText.replace('g' + gain, '');
  };

  let text = rawText.trim();
  text = text.slice(0, 1).toUpperCase() + text.slice(1, );

  parsedList = [taskStart, duration, text, drain];
  return parsedList;
}
