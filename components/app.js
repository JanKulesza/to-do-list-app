// Array to store task dates
const taskDates = Array.from(document.querySelectorAll('.day .article-date'));

// Array to store focused elements
let focusedElements = [];
focusedElements.push(document.querySelector('.day .article-header .focus'));

// Array of month names
const monthsNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Array of days of the week
const daysOfTheWeek = [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
];

// Function to get number of days in a month
function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

// Flag to check if current date has been retrieved
let getDateFlag = false;

// Class to get current date
function GetCurrentDate() {
    if (!getDateFlag) {
        // Set flag to true to avoid redundant calculations
        getDateFlag = true;
        // Get current date information
        this.date = new Date();
        this.year = this.date.getFullYear();
        this.month = this.date.getMonth();
        this.monthName = monthsNames[this.date.getMonth()];
        this.daysInMonth = daysInMonth((this.date.getMonth() + 1), this.year);
        this.dayOfMonth = this.date.getDate();
        this.dayOfWeek = this.date.getDay();
        this.dayOfWeekName = daysOfTheWeek[this.date.getDay()];
    }
}

// Create an instance of GetCurrentDate to get current date information
const currentDate = new GetCurrentDate();

// Display current date on the page
document.getElementById('date').innerHTML = `<p>${currentDate.dayOfMonth} ${currentDate.monthName} </p>`;

// Array to store next three days information
const nextThreeDays = [];
for (let i = 0; i < 3; i++) {
    // Push information about the next three days into nextThreeDays array
    nextThreeDays.push({
        month: ((currentDate.dayOfMonth + i) > currentDate.daysInMonth) ? monthsNames[currentDate.date.getMonth() + 1] : monthsNames[currentDate.date.getMonth()],
        dayOfMonth: ((currentDate.dayOfMonth + i) > currentDate.daysInMonth) ? (i == 1) ? 0 : 1 : currentDate.date.getDate() + i,
        dayOfWeek: !(daysOfTheWeek[currentDate.date.getDay() + i]) ? i == 1 ? daysOfTheWeek[i - 1] : daysOfTheWeek[i - 2] : daysOfTheWeek[currentDate.date.getDay() + i],
        day: i == 0 ? 'Today' : i == 1 ? 'Tomorrow' : 'Day After Tomorrow'
    });
}

// Log nextThreeDays array to console
console.log(nextThreeDays);

// DOM element to display manager info
let managerInfo = document.getElementById('manager-info');
let addTaskBtns = document.querySelectorAll('.add-task');
addTaskBtns.forEach(element => {
    // Add event listener to each "Add Task" button
    element.addEventListener('click', function (event) {
        // Prevent the default behavior of the link
        event.preventDefault();
        // Toggle overlay to add new task
        toggleOverlay();
    });
});

// Class definition for ElementClass
class ElementClass {
    constructor(element) {
        // Initialize properties based on the given element
        this.articleNum = element;
        this.day = element.closest('.day');
        this.tasks = Array.from(this.day.querySelectorAll('.tasks-group .task'));
        this.tasksGroup = this.day.querySelector('.tasks-group');
        this.taskCheckBoxes = Array.from(this.day.querySelectorAll('.task-checkbox'));
    }

    // Method to style tasks
    stylingTasks() {
        // Add focus style to tasks if the element is focused
        if (this.tasks.length != 0 && this.articleNum.classList.contains('focus')) {
            this.tasks[0].classList.add('focus');
            this.tasks.forEach((task, index) => {
                task.querySelector('.checkbox-dot').style.display = 'inline';
            });
        }
        // Update manager info based on the number of tasks
        let index = taskDates.findIndex(el => el.closest('.day').getAttribute('data-id') === this.day.getAttribute('data-id'));
        managerInfo.innerHTML = `
            <h2>${nextThreeDays[index].day}</h2>
            <p>${this.tasks.length} tasks</p>
        `;
    }

    // Method to remove styling from tasks
    removeStylingFromTasks() {
        // Remove focus style and hide checkboxes from tasks
        if (!(this.tasks.length == 0)) {
            this.tasks[0].classList.remove('focus');
            this.tasks.forEach((task, index) => {
                task.querySelector('.checkbox-dot').style.display = 'none';
                this.taskCheckBoxes[index].classList.add('disabled');
            });
        }
    }

    // Method to manage task time
    managingTaskTime(task) {
        task = (typeof task === 'undefined') ? this.tasks : [task];
        // Calculate and update task schedule
        task.forEach((element, index) => {
            let taskTime = [0, parseInt(element.querySelector('.req-time').innerHTML[0]),
                '.',
                parseInt(element.querySelector('.req-time').innerHTML[2]) ? parseInt(element.querySelector('.req-time').innerHTML[2]) : 0,
                parseInt(element.querySelector('.req-time').innerHTML[3]) ? parseInt(element.querySelector('.req-time').innerHTML[3]) : 0
            ];
            let taskSchedule = element.querySelector('.task-desc p');
            let taskStartTime = taskSchedule.innerHTML;
            let taskEndTime = [];

            taskStartTime = taskStartTime.split('');
            taskStartTime[taskStartTime.indexOf(':')] = '.';
            taskEndTime = [...taskStartTime];
            // Update task end time based on task duration
            for (let i = 0; i < taskEndTime.length; i++) {
                if (!(taskEndTime[i] == '.')) {
                    taskEndTime[i] = (parseInt(taskEndTime[i]) + taskTime[i]);
                    if (i == 1 || i == 4) {
                        if (taskEndTime[i] >= 10) {
                            taskEndTime[i] = taskEndTime[i] - 10
                            taskEndTime[i - 1] = taskEndTime[i - 1] + 1
                            if (taskEndTime[i - 1] >= 6) {
                                taskEndTime[i - 1] = taskEndTime[i - 1] - 6
                                taskEndTime[i - 3] = taskEndTime[i - 3] + 1
                            }
                        }
                    } else if (i == 3) {
                        if (taskEndTime[i] >= 6) {
                            taskEndTime[i] = taskEndTime[i] - 6
                            taskEndTime[i - 2] = taskEndTime[i - 2] + 1
                        }
                    }
                    taskEndTime[i].toString();
                }
            }
            taskSchedule.innerHTML = `${taskStartTime.join('')} - ${taskEndTime.join('')}`
        });
    }

    // Method to handle task completion
    taskDone() {
        let reqTimeInfo = this.day.querySelector('.hours');
        reqTimeInfo.innerHTML = `${this.hoursADay()} hours a day`;
        if (this.tasksGroup.innerHTML === '') {
            this.noTasks();
        }
        // Handle completion of tasks
        this.taskCheckBoxes.forEach((element, index) => {
            // Clone the element
            const clone = element.cloneNode(true);
            // Replace the original element with the cloned one
            element.parentNode.replaceChild(clone, element);
            // Update the element in the taskCheckBoxes array
            this.taskCheckBoxes[index] = clone;
            // Add new event listener to the cloned element
            clone.addEventListener('click', event => {
                // Disable the checkbox and remove the task
                clone.classList.add('disabled');
                clone.closest('.task').remove();
                this.tasks.shift();
                this.taskCheckBoxes.shift();
                managerInfo.querySelector('p').textContent = `${this.tasks.length} tasks`;
                if (this.tasks.length !== 0) {
                    this.taskCheckBoxes[0].closest('.task').classList.add('focus');
                    this.taskCheckBoxes[0].classList.remove('disabled');
                }
                if (this.tasks.length === 0) {
                    this.noTasks();
                }
                reqTimeInfo.innerHTML = `${this.hoursADay()} hours a day`;
            });
        });
    }

    // Method to calculate total hours of tasks in a day
    hoursADay() {
        let info = 0;
        if (!this.tasks) {
            return 0;
        }
        this.tasks.forEach(element => {
            info += parseInt(element.querySelector('.req-time').innerHTML[0]);
        });
        return info;
    }

    // Method to check and update task status
    checkingTasksStatus() {
        this.taskCheckBoxes.forEach((element, index) => {
            if (!element.closest('.task').classList.contains('focus')) {
                element.classList.add('disabled');
            }
            if (element.closest('.task').classList.contains('focus')) {
                element.classList.remove('disabled');
            }
        });
    }

    // Method to handle scenario when no tasks are added
    noTasks() {
        this.tasksGroup.innerHTML = `
        <p class="no-task">No tasks added</p>
        <div class="add-task-div">
            <a href="#add-task-overlay" class="add-task">Add New</a>
        </div>
        `;
        // Add event listener to "Add New" button when no tasks are added
        this.tasksGroup.querySelector('.add-task').addEventListener('click', function (event) {
            event.preventDefault(); // Prevent the default behavior of the link
            toggleOverlay();
        });
    }
}

// Class definition for FocusedElementClass
class FocusedElementClass extends ElementClass {
    constructor(element) {
        super(element);
    }
}

// Create an instance of FocusedElementClass
let focusedElement = new FocusedElementClass(focusedElements[0]);
focusedElements.pop();
focusedElements.push(focusedElement);
console.log(focusedElement);
console.log(focusedElements);

// Style tasks for each focused element
focusedElements.forEach(element => {
    element.stylingTasks();
});

// Create ElementClass instances for each task date element
const elements = []
taskDates.forEach((element, index) => {
    elements.push(new ElementClass(element));
    elements[index].taskDone();
    elements[index].managingTaskTime();
});

// Update task dates display
taskDates.forEach((element, index) => {
    element.innerHTML = `<h3>${nextThreeDays[index].dayOfMonth}</h3><p> ${nextThreeDays[index].dayOfWeek} </p>`;

    // Add event listener to task date elements
    element.addEventListener('click', function (event) {
        focusedElement = new FocusedElementClass(event.currentTarget);
        console.log(focusedElement);
        // Remove styling from all focused elements
        focusedElements.forEach(element => {
            element.removeStylingFromTasks();
        });

        // Toggle focus class for clicked element
        focusedElement.articleNum.classList.toggle('focus');
        focusedElements.forEach(element => {
            element.articleNum.classList.remove('focus');
        });
        focusedElements.length = 0;
        focusedElements.push(focusedElement);

        // Apply styling to clicked element and handle task completion
        focusedElement.stylingTasks();
        focusedElement.checkingTasksStatus();
    });
});

// Handle overlay for adding new task
let overlay = document.getElementById('add-task-overlay');
let closeLink = overlay.querySelector('.close');
let submitBtn = overlay.querySelector('.submit');
let taskName, taskStartTime, taskDuration;
let taskDate = 0;

function hideOverlay() {
    overlay.style.visibility = 'hidden';
    overlay.style.opacity = '0';
}

function toggleOverlay() {
    if (overlay.style.visibility === 'visible') {
        hideOverlay();
    } else {
        overlay.style.visibility = 'visible';
        overlay.style.opacity = '1';
    }
}

closeLink.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default behavior of the link
    hideOverlay();
});

// Function to create a new task
function taskCreator(taskName, taskStartTime, taskDuration, taskDate) {
    let targetDay = taskDates[taskDate].closest('.day');
    let taskStatusFlag = 'disabled';
    if (taskDates[taskDate].classList.contains('focus')) {
        if (Array.from(targetDay.querySelectorAll('.task')).length == 0) {
            taskStatusFlag = 'focus';
        }
    }

    let newTask = document.createElement('section');
    newTask.className = `task ${taskStatusFlag == 'focus' ? 'focus' : ''}`;
    newTask.innerHTML = `
        <span class="req-time">${taskDuration} hours</span>
        <div class="task-info">
            <div class="checkbox-info">
                <input type="checkbox" name="task-checkbox" class="task-checkbox ${taskStatusFlag == 'disabled' ? 'disabled' : ''}">
                <span style="display: none;" class="checkbox-dot"></span>
            </div>
            <div class="task-desc">
                <h4>${taskName}</h4>
                <p>${taskStartTime}</p>
            </div>
        </div>
    `;
    if (elements[taskDate].tasks.length == 0) {
        targetDay.querySelector('.tasks-group').innerHTML = '';
    }

    targetDay.querySelector('.tasks-group').appendChild(newTask);
    elements[taskDate] = new ElementClass(taskDates[taskDate]);

    elements[taskDate].taskDone();
    elements[taskDate].managingTaskTime(newTask);
    if (taskDates[taskDate].classList.contains('focus')) {
        elements[taskDate].stylingTasks();
        focusedElements.push(elements[taskDate]);
    }
}

// Add event listeners to task date elements for selecting a date to add a task
const taskDatesAddTask = Array.from(document.querySelectorAll('.box .article-date'));
taskDatesAddTask.forEach((element, index) => {
    element.innerHTML = `
        <h3>${nextThreeDays[index].dayOfMonth}</h3>
        <p>${nextThreeDays[index].dayOfWeek}</p>
    `;
    element.addEventListener('click', function (event) {
        taskDatesAddTask.forEach(element => element.classList.remove('focus'));
        event.currentTarget.classList.add('focus');
        taskDate = event.currentTarget.getAttribute('data-date-id');
    });
});

// Add event listener for submit button in overlay to create a new task
submitBtn.addEventListener('click', function (event) {
    taskName = document.getElementById('taskName').value;
    taskStartTime = document.getElementById('taskStartTime').value;
    taskDuration = document.getElementById('taskDuration').value;

    hideOverlay();
    taskCreator(taskName, taskStartTime, taskDuration, taskDate);
});

// Store the initial value of the d attribute of #blob1
var initialPath = document.querySelector('#blob1').getAttribute('d');
let addTaskBtnManager = document.querySelector('.add-task-div .add-task');
// Add event listener for mouseenter
addTaskBtnManager.addEventListener('mouseenter', function (event) {
    // Morph #blob1 to #blob2
    KUTE.to('#blob1', { path: '#blob2' }, { duration: 300 }).start();
});

// Add event listener for mouseout
addTaskBtnManager.addEventListener('mouseout', function (event) {
    // Morph #blob1 back to its initial shape
    KUTE.to('#blob1', { path: initialPath }, { duration: 300 }).start();
});
