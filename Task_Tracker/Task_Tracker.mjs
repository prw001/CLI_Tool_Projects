#!/usr/bin/env node

import {program} from 'commander';
import fs from 'fs/promises';
const taskPath = './tasks.json';
const validIdInputRegex = /^[\d]+$/;

program
    .version('1.0.0')
    .description('A tool to create, update, and track ongoing tasks')
    .option('-a, --add <args...>', 'Add a new task', null)
    .option('-u, --update-with-id <args...>', 'Update a task <id> with <description>', null)
    .option('-U --update-at-index <args...>', 'Update a task at <index> with <description>', null)
    .option('-d, --delete-with-id <Id>', 'Delete a task with <Id>', null)
    .option('-D --delete-at-index <Idx>', 'Delete a task at <Idx>', null)
    .option('-i, --mark-in-progress-with-id <Id>', 'Mark a task with <Id> as *in-progress*', null)
    .option('-I, --mark-in-progress-at-index <Idx', 'Mark a task at <Idx> as *in-progress*', null)
    .option('-f, --mark-done-with-id <Id>', 'Mark a task with <Id> as *done*', null)
    .option('-F, --mark-done-at-index <Idx>', 'Mark a task at <Idx> as *done*', null)
    .option('-l, --list-tasks', 'Show the list of all tasks', null)
    .option('-p, --list-in-progress', 'Show a list of all in-progress tasks', null)
    .option('-c, --list-completed-tasks', 'Show a list of all completed tasks', null)
    .parse(process.argv);

const options = program.opts();
let taskList = [];

//attempts to read in serialized tasks from the tasks.json file
async function loadTasks()
{
    console.log(`\nLoading tasks...\n`);
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

//writes all tasks objects to the tasks.json file
async function writeTasks()
{
    console.log('Updating tasks...');
    try {
        await fs.writeFile(taskPath, JSON.stringify(taskList, null, 2), 'utf8');
        console.log('Finished.');
    }
    catch (err) {
        console.error(`Failed to write tasks: ${err}`);
        return;
    }
}

function buildTask(description)
{
    const date = getDateString();
    const task = {
        id: Number(Date.now()),
        desc: description,
        inProgress: false,
        isFinished: false,
        createdAt: date,
        lastUpdated: date
    };
    return task;
}

function getTask(id)
{
    return taskList.find(a => a.id === Number(id));
}

function getTaskIdx(id)
{
    return taskList.findIndex(a => a.id === Number(id));
}

//returns a string in format: '<Day> <Month> <dd> <yyyy> @ <hh:mm:ss tz>'
function getDateString()
{
    const date = new Date();
    return `${date.toDateString()} @ ${date.toTimeString()}`;
}

function getStatus(task)
{
    if (task.isFinished)
    {
        return `Completed`;
    }
    else if (task.inProgress)
    {
        return `In progress`;
    }
    return `Not started`;
}

//Formats a task object's data for printing in the console
const displayTask = (task, idx) => {
    const border = `------------------------------`;
    const section = `*         *         *        *`;
    const text = `${border}\nTASK: ${task.desc}\nIndex: ${idx} | ID: ${task.id}\n\n${section}\nStatus: ${getStatus(task)}\nCreated on: ${task.createdAt}\nLast updated: ${task.lastUpdated}\n\n${section}\n${border}\n`;
    return text;
}

//Handles all the CLI input options and their respective args
const handleOptions = () => {
    if (options.add)
    {
        if (options.add.length < 160)
        {
            const nextTask = buildTask(options.add.join(' '));
            taskList.push(nextTask);
            console.log(taskList);
            console.log(`Added new task: ${nextTask.desc}`);
        }
        else
        {
            console.error(`Please provide a task description in less than 160 characters`);
        }
    }

    if (options.updateWithId)
    {
        const arg1 = options.update[0];
        const arg2 = options.update.slice(1).join(' ');
        if (arg2.length <= 160)
        {
            const task = getTask(arg1)
            if (task === -1)
            {
                console.error(`No task available with provided id: ${options.update[0]}`);
            }
            else
            {
                task.desc = arg2;
                task.lastUpdated = getDateString();
                console.log(`Task successfully updated to: ${taskList[idx].desc}`);
            }
        }
        else
        {
            console.error(`Please provide a task description in less than 160 characters.`);
        }
    }

    if (options.updateAtIndex)
    {
        const arg1 = Number(options.updateAtIndex[0]);
        const arg2 = options.updateAtIndex.slice(1).join(' ');

        if (arg1 > taskList.length - 1 || arg1 < 0)
        {
            console.error(`Must provide an index within bounds`);
        }
        else
        {
            if (arg2.length < 160)
            {
                const task = taskList[arg1];
                task.desc = arg2;
                task.lastUpdated = getDateString();
                console.log(`Task successfully updated to: ${taskList[arg1].desc}`);
            }
            else
            {
                console.error(`Please provide a task description in less than 160 characters.`);
            }
        }
    }

    if (options.deleteWithId)
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
                console.log(`Successfully removed task from list: ${deleted[0].desc}`);
            }
        }
    }

    if (options.deleteAtIndex)
    {
        if (options.deleteAtIndex > taskList.length - 1 || options.deleteAtIndex < 0)
        {
            console.error(`Must provide an index within bounds`);
        }
        else
        {
            const deleted = taskList.splice(options.deleteAtIndex, 1);
            console.log(`Successfully removed task from list: ${deleted[0].desc}`);
        }
    }

    if (options.markInProgressWithId)
    {
        const task = getTask(options.markInProgressWithId);
        if (task === -1)
        {
            console.error(`No task available with provided id: ${options.markInProgressWithId}`);
        }
        else
        {
            task.inProgress = true;
            task.isFinished = false;
            task.lastUpdated = getDateString();
            console.log(`Successfully updated "${task.desc}" to: In progress`);
        }
    }

    if(options.markInProgressAtIndex)
    {
        const idx = Number(options.markInProgressAtIndex);
        if (idx > taskList.length - 1 || idx < 0)
        {
            console.error(`Must provide an index within bounds`);
        }
        else
        {
            let task = taskList[idx];
            task.inProgress = true;
            task.isFinished = false;
            task.lastUpdated = getDateString();
            console.log(`Successfully updated "${task.desc}" to: In progress`);
        }
    }

    if (options.markDoneWithId)
    {
        let task = getTask(options.markDoneWithId);
        if (task === -1)
        {
            console.error(`No task available with provided id: ${options.markInProgressWithId}`);
        }
        else
        {
            task.inProgress = false;
            task.isFinished = true;
            task.lastUpdated = getDateString();
            console.log(`Successfully updated "${task.desc}" to: Completed`);
        }
    }

    if (options.markDoneAtIndex)
    {
        const idx = Number(options.markDoneAtIndex);
        if (idx > taskList.length - 1 || idx < 0)
        {
            console.error(`Must provide an index within bounds`);
        }
        else
        {
            let task = taskList[idx];
            task.inProgress = false;
            task.isFinished = true;
            task.lastUpdated = getDateString();
            console.log(`Successfully updated "${task.desc}" to: Completed`);
        }
    }

    //print to the console a complete list of tasks
    if (options.listTasks)
    {
        if (taskList.length === 0)
        {
            console.log(`No tasks to show, add a task using the argument -a and a description`);
        }
        else
        {
            taskList.forEach((task) => { console.log(displayTask(task, getTaskIdx(task.id))); });
        }
    }

    //print to the console all tasks marked as 'in progress'
    if (options.listInProgress)
    {
        const inProgress = taskList.filter(task => task.inProgress === true);
        inProgress.forEach((task) => { console.log(displayTask(task, getTaskIdx(task.id))) });
    }

    //print to the console all tasks marked as 'completed'
    if (options.listCompletedTasks)
    {
        const completed = taskList.filter(task => task.isFinished === true);
        completed.forEach((task) => { console.log(displayTask(task, getTaskIdx(task.id))) });
    }
}

async function main() {
    await loadTasks();
    handleOptions();
    await writeTasks();
}

main();