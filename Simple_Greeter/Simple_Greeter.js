#!/usr/bin/env node

const {program} = require('commander');
program
    .version('1.0.0')
    .description('A CLI tool to greet uesrs')
    .option('-n --name <name>', 'Your name')
    .parse(process.argv);

const options = program.opts();
const name = options.name || 'World';
console.log(`Hello, ${name}!`);