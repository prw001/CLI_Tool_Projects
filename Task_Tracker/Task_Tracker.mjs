#!/usr/bin/env node

import {program} from 'commander';
import fs from 'fs/promises';
const taskPath = './tasks.json';
const validIdInputRegex = /^[\d]+$/;

program
    .version('1.0.0')
    .description('A tool to create, update, and track ongoing tasks')
    .option('-a, --add <Task>', 'Add a new task', null)
    .option('-u, --update <args...>', 'Update a task <id> with <description>', null)
    .option('-d, --delete <Task>', 'Delete a task', null)
    .option('-i, --mark-in-progress <Task>', 'Mark a task as *in-progress*', null)
    .option('-f, --mark-done <Task>', 'Mark a task as *done*', null)
    .option('-l, --list-tasks', 'Show the list of all tasks', null)
    .option('-p, --list-in-progress', 'Show a list of all in-progress tasks', null)
    .option('-c, --list-completed-tasks', 'Show a list of all completed tasks', null)
    .parse(process.argv);

const options = program.opts();
let taskList = [];

async function loadTasks()
{
    console.log('Loading tasks...');
    try {
        const data = await fs.readFile(taskPath, 'utf8');
        if (data.trim())
        {
            taskList = await JSON.parse(data);
        }
    }
    catch (err) {
        console.error('Failed to load or parse tasks: ', err);
    }
}

async function unpackTasks()
{

}

async function packTasks()
{

}

async function writeTasks()
{
    console.log('Updating tasks...');
    try {
        await fs.writeFile(taskPath, JSON.stringify(taskList, null, 2), 'utf8');
    }
    catch (err) {
        console.error(`Failed to write tasks: ${err}`);
        return;
    }
}

function getNewId()
{
    return taskList.length; //update this later, should grab a value recorded in the tasks.json file
}

class Task {
    constructor(description)
    {
        this.desc = description;
        this.id = getNewId();
        this.inProgress = false;
        this.isFinished = false;
        this.createdAt = Date.now();
        this.lastUpdated = Date.now();
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

function getTask(id)
{
    return taskList.find(a => a.id === Number(id));
}

function getTaskIdx(id)
{
    return taskList.findIndex(a => a.id === Number(id));
}

const handleOptions = () => {
    if (options.add)
    {
        const nextTask = new Task(options.add);
        taskList.push(nextTask);
        console.log(taskList);
        console.log(`Added new task: ${nextTask.desc}`);
    }

    if (options.update)
    {
        const arg1 = options.update[0];
        const arg2 = options.update.slice(1).join(' ');
        if (arg2.length <= 160)
        {
            //TODO: fix the below bug, when reading in the tasks with JSON.parse, the class instances are not
            //recreated, and so updateDescription() does not work.  Switch to just using objects and calling on
            //their keys directly to update values.
            const task = getTask(arg1)
            if (task === -1)
            {
                console.error(`No task available with provided id: ${options.update[0]}`);
            }
            else
            {
                task.updateDescription(arg2);
                console.log(`Task successfully updated to: ${taskList[idx].desc}`);
            }
        }
        else
        {
            console.error(`Please provide a task description in less than 160 characters.`);
        }
    }

    if (options.delete)
    {
        if (validIdInputRegex.test(options.delete))
        {
            const idx = getTaskIdx(options.delete)
            if (idx === -1)
            {
                console.error(`No task available with provided id: ${options.delete}`);
            }
            else
            {
                const deleted = taskList.splice(idx, 1);
                console.log(`Successfully removed task from list: ${deleted.desc}`);
            }
        }
    }

    if (options.markInProgress)
    {

    }

    if (options.markDone)
    {

    }

    if (options.listTasks)
    {
        if (taskList.length === 0)
        {
            console.log(`No tasks to show, add a task using the argument -a and a description`);
        }
        else
        {
            taskList.forEach(task => {
                console.log(task);
            });
        }
    }

    if (options.listInProgress)
    {

    }

    if (options.listCompletedTasks)
    {

    }
}

async function main() {
    await loadTasks();
    handleOptions();
    await writeTasks();
}

main();