#! /usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv;
const chalk = require('chalk');

function isValidCommand(commandHandlers, commands) {
    let allowedCommands = Object.keys(commandHandlers);
    let errorMsg;

    if (!~allowedCommands.indexOf(commands[0])) errorMsg = 'Command not allowed';
    if (commands.length > 2) errorMsg = 'Too many commands';

    if (errorMsg) {
        printError(errorMsg);
        return false;
    }
    return true;
}

function printError(msg) {
    console.log(chalk.red('error:'), msg);
    printUsage();
}

function printUsage() {
    console.log(chalk.green('usage:\n'), 'profile-manager profile [profileName]');
}

function flow() {
    const commands = argv._;

    if (!isValidCommand(commandHandlers, commands)) return;
    const command = commands[0];
    const param = commands[1];

    commandHandlers[command](param);
}

const commandHandlers = {

    // hardcode profiles for now
    profile(param) {
        const gitconfig = path.resolve(process.env.HOME, '.gitconfig');
        const vimrc = path.resolve(process.env.HOME, '.vimrc');

        const profile = profiles[param];
        if (!profile) {
            printError(param + '\'s profile does not exists');
            return;
        }

        helper.gitconfigReplaceEmail(gitconfig, profile.gitconfig);
        helper.vimrcReplaceTabs(vimrc, profile.vimrc);
    }
};

const profiles = {
    home: {
        gitconfig: {
            email: 'esayemm@gmail.com',
        },
        vimrc: {
            tabs: '4',
        },
    },
    work: {
        gitconfig: {
            email: 'samlau@trimian.com',
        },
        vimrc: {
            tabs: '2',
        },
    }
};

const helper = {

    gitconfigReplaceEmail(file, profileGitconfig) {
        let buffer = fs.readFileSync(file, 'utf8');

        let regExp = /email\ =\ [A-Za-z]*@[A-Za-z]*\.[A-Za-z]*/;
        let replacement = 'email = ' + profileGitconfig.email;
        let modifiedFile = buffer.replace(regExp, replacement);

        fs.writeFileSync(file, modifiedFile, 'utf8');
        console.log('gitconfig email changed to', profileGitconfig.email);
    },

    vimrcReplaceTabs(file, profileVimrc) {
        let buffer = fs.readFileSync(file, 'utf8');

        let regExp = [
            /set\ shiftwidth=[0-9]*/,
            /set\ tabstop=[0-9]*/,
        ];

        let replacements = [
            'set shiftwidth='+profileVimrc.tabs,
            'set tabstop='+profileVimrc.tabs,
        ];

        let modifiedFile;
        regExp.forEach((a, i) => {
            modifiedFile = (modifiedFile)
                ? modifiedFile.replace(a, replacements[i])
                : buffer.replace(a, replacements[i]);
        });

        fs.writeFileSync(file, modifiedFile, 'utf8');
        console.log('vimrc tab settings changed to ', profileVimrc.tabs);
    },

};

// Main
flow();
