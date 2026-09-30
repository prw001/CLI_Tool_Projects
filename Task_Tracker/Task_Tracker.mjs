#!/usr/bin/env node

import {program} from 'commander';
import fs from 'fs/promises';
import pc from 'picocolors';
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
    console.log(`\n${pc.yellow('Loading tasks...')}\n`);
    try {

        const data = await fs.readFile(taskPath, 'utf8');
        if (data.trim())
        {
            taskList = JSON.parse(data);
        }
    }
    catch (err) {
        if (err.code === 'ENOENT') //nonexistent file
        {
            console.log(`No task file found, creating ${pc.blue('new')} task file at ${taskPath}\n`);
            await fs.appendFile(taskPath, '[]', 'utf8');
        }
        else
        {
            console.error(pc.redBright('Failed to load or parse tasks: '), err);
        }
    }
}

//writes all tasks objects to the tasks.json file
async function writeTasks()
{
    console.log(`${pc.yellow('\nUpdating tasks...\n')}`);
    try {
        await fs.writeFile(taskPath, JSON.stringify(taskList, null, 2), 'utf8');
        console.log(pc.greenBright('Finished.'));
    }
    catch (err) {
        console.error(`${pc.redBright('Failed to write tasks:')} ${err}`);
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
        return `${pc.green('Completed')}`;
    }
    else if (task.inProgress)
    {
        return `${pc.yellow('In progress')}`;
    }
    return `${pc.red('Not started')}`;
}

//Formats a task object's data for printing in the console
const displayTask = (task, idx) => {
    const border = `------------------------------`;
    const section = `*         *         *        *`;
    const text = `${border}\n${pc.bgBlack(pc.italic(pc.whiteBright('TASK:')))} ${pc.bgBlue(pc.whiteBright(task.desc))}\nIndex: ${idx} | ID: ${task.id}\n\n${section}\nStatus: ${getStatus(task)}\nCreated on: ${task.createdAt}\nLast updated: ${task.lastUpdated}\n\n${section}\n${border}\n`;
    return text;
}

//Handles all the CLI input options and their respective args
const handleOptions = () => {
    if (options.add)
    {
        if (options.add.length <= 160 && options.add.length > 0)
        {
            const nextTask = buildTask(options.add.join(' '));
            taskList.push(nextTask);
            console.log(`Added new task: ${pc.blueBright(nextTask.desc)}`);
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
        if (arg2.length <= 160 && arg2.length > 0)
        {
            const task = getTask(arg1)
            if (task === -1)
            {
                console.error(`${pc.redBright('No task available with provided id: ')}${options.update[0]}`);
            }
            else
            {
                task.desc = arg2;
                task.lastUpdated = getDateString();
                console.log(`${pc.green('Task successfully updated to: ')}${pc.blueBright(taskList[idx].desc)}`);
            }
        }
        else
        {
            console.error(`${pc.redBright('Please provide a task description in less than 160 characters.')}`);
        }
    }

    if (options.updateAtIndex)
    {
        const arg1 = Number(options.updateAtIndex[0]);
        const arg2 = options.updateAtIndex.slice(1).join(' ');

        if (arg1 > taskList.length - 1 || arg1 < 0)
        {
            console.error(`${pc.redBright('Must provide an index within bounds')}`);
        }
        else
        {
            if (arg2.length <= 160 && arg2.length > 0)
            {
                const task = taskList[arg1];
                task.desc = arg2;
                task.lastUpdated = getDateString();
                console.log(`${pc.green('Task successfully updated to: ')}${pc.blueBright(taskList[arg1].desc)}`);
            }
            else
            {
                console.error(`${pc.redBright('Please provide a task description in less than 160 characters.')}`);
            }
        }
    }

    if (options.deleteWithId)
    {
        if (validIdInputRegex.test(options.deleteWithId))
        {
            const idx = getTaskIdx(options.deleteWithId)
            if (idx === -1)
            {
                console.error(`${pc.redBright('No task available with provided id: ')}${options.deleteWithId}`);
            }
            else
            {
                const deleted = taskList.splice(idx, 1);
                console.log(`${pc.green('Successfully removed task from list: ')}${pc.blueBright(deleted[0].desc)}`);
            }
        }
    }

    if (options.deleteAtIndex)
    {
        if (options.deleteAtIndex > taskList.length - 1 || options.deleteAtIndex < 0)
        {
            console.error(`${pc.redBright('Must provide an index within bounds')}`);
        }
        else
        {
            const deleted = taskList.splice(options.deleteAtIndex, 1);
            console.log(`${pc.green('Successfully')} removed task from list: ${pc.blueBright(deleted[0].desc)}`);
        }
    }

    if (options.markInProgressWithId)
    {
        const task = getTask(options.markInProgressWithId);
        if (task === -1)
        {
            console.error(`${pc.redBright('No task available with provided id: ')}${options.markInProgressWithId}`);
        }
        else
        {
            task.inProgress = true;
            task.isFinished = false;
            task.lastUpdated = getDateString();
            console.log(`${pc.green('Successfully updated ')}"${pc.blueBright(task.desc)}" to: ${pc.yellow('In progress')}`);
        }
    }

    if(options.markInProgressAtIndex)
    {
        const idx = Number(options.markInProgressAtIndex);
        if (idx > taskList.length - 1 || idx < 0)
        {
            console.error(`${pc.redBright('Must provide an index within bounds')}`);
        }
        else
        {
            let task = taskList[idx];
            task.inProgress = true;
            task.isFinished = false;
            task.lastUpdated = getDateString();
            console.log(`${pc.green('Successfully updated ')}"${pc.blueBright(task.desc)}" to: ${pc.yellow('In progress')}`);
        }
    }

    if (options.markDoneWithId)
    {
        let task = getTask(options.markDoneWithId);
        if (task === -1)
        {
            console.error(`${pc.redBright('No task available with provided id: ')}${options.markDoneWithId}`);
        }
        else
        {
            task.inProgress = false;
            task.isFinished = true;
            task.lastUpdated = getDateString();
            console.log(`${pc.green('Successfully updated ')}"${pc.blueBright(task.desc)}" to: ${pc.greenBright('Completed')}`);
        }
    }

    if (options.markDoneAtIndex)
    {
        const idx = Number(options.markDoneAtIndex);
        if (idx > taskList.length - 1 || idx < 0)
        {
            console.error(`${pc.redBright('Must provide an index within bounds')}`);
        }
        else
        {
            let task = taskList[idx];
            task.inProgress = false;
            task.isFinished = true;
            task.lastUpdated = getDateString();
            console.log(`${pc.green('Successfully updated ')}"${pc.blueBright(task.desc)}" to: ${pc.greenBright('Completed')}`);
        }
    }

    //print to the console a complete list of tasks
    if (options.listTasks)
    {
        if (taskList.length === 0)
        {
            console.log(`${pc.yellow('No tasks to show, add a task using the argument -a and a description')}`);
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
        if (inProgress.length > 0)
        {
            inProgress.forEach((task) => { console.log(displayTask(task, getTaskIdx(task.id))) });
        }
        else
        {
            console.log(pc.yellow('No in-progress tasks to show'));
        }
    }

    //print to the console all tasks marked as 'completed'
    if (options.listCompletedTasks)
    {
        const completed = taskList.filter(task => task.isFinished === true);
        if (completed.length > 0)
        {
            completed.forEach((task) => { console.log(displayTask(task, getTaskIdx(task.id))) });
        }
        else
        {
            console.log(pc.yellow('No completed tasks to show'));
        }
    }
}

async function main() {
    await loadTasks();
    handleOptions();
    await writeTasks();
}

main();