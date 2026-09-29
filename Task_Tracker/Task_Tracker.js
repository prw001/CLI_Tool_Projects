#!/usr/bin/env node

const {program} = require('commander');
const fs = require('fs/promises');
const taskPath = './tasks.json';

program
    .version('1.0.0')
    .description('A tool to create, update, and track ongoing tasks')
    .option('-a --add <Task>', 'Add a new task', null)
    .option('-u --update <Task>', 'Update an existing task', null)
    .option('-d --delete <Task>', 'Delete a task', null)
    .option('-i --mark-in-progress <Task>', 'Mark a task as *in-progress*', null)
    .option('-f --mark-done <Task>', 'Mark a task as *done*', null)
    .parse(process.argv);

const options = program.opts();
let taskList = [];

async function loadTasks()
{
    console.log('Loading tasks...');
    try {
        const data = await fs.readFile(taskPath, 'utf8');
        taskList = JSON.parse(data);
    }
    catch (err) {
        console.error('Failed to load or parse tasks: ', err);
    }
}

function getNewId()
{
    return taskList.length; //update this later, should grab a value recorded in the tasks.json file
}

class Task {
    constructor(description)
    {
        this.desc = description,
        this.id = getNewId(),
        this.inProgress = false,
        this.isFinished = false
        this.createdAt = Date.now(),
        this.lastUpdated = Date.now()
    }

    updateDescription(newDesc)
    {
        this.desc = newDesc;
        this.lastUpdated = Date.now();
    }

    setInProgress()
    {
        this.inProgress = true;
        this.lastUpdated = Date.now();
    }

    haltProgress()
    {
        this.inProgress = false;
        this.lastUpdated = Date.now();
    }

    finishTask()
    {
        this.isFinished = true;
        this.haltProgress();
    }

}

loadTasks();
const testTask = new Task("This is a test task");
console.log(testTask);
testTask.setInProgress();
console.log(testTask);
testTask.updateDescription("This is still a test task, but with a new description");
console.log(testTask);
testTask.haltProgress();
console.log(`halted test task with id: ${testTask.id}`);
testTask.finishTask();
console.log(`finished task: ${testTask.desc}`, testTask);