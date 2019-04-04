#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const yosay = require('yosay');
// 文件读写模块.
const fs = require('fs');
// 路径模块
const path = require('path');
// 命令行
const {execSync} = require('child_process');
// 工具模块（用来判断操作系统）
const os = require("os");

console.log(yosay(
    'Welcome to the frame Scaffold ' + chalk.red('create-frame-vue') + '!'
));

const prompts = [
    {
        type: 'input',
        name: 'projectName',
        message: '请输入您要新建的项目名称: ',
        default: 'app'
    }, {
        type: 'input',
        name: 'projectDec',
        message: '请输入项目说明: ',
        default: 'Simple project, base on frame'
    }, {
        type: 'input',
        name: 'projectAuthor',
        message: '请输入创建者信息: ',
        default: 'xufeng'
    }, {
        type: 'input',
        name: 'projectPort',
        message: '请设定dev-server端口: ',
        default: '9090'
    }
];
var promptParams = {};
inquirer.prompt(prompts).then(answers => {
    promptParams = answers;
}).then(() => {
    this.combPath = promptParams.projectName;
    console.log('正在拉取框架代码...');
    execSync('git clone https://github.com/xufeng123/vue-frame.git ' + this.combPath, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
    });
}).then(() => {
    let file = path.join('', this.combPath + '/package.json');
    fs.readFile(file, 'utf-8', function(err, data) {
        if (err) {
            console.error(err);
        } else {
            let frame = JSON.parse(data);
            frame.name = promptParams.projectName;
            frame.version = '1.0.0';
            frame.description = promptParams.projectDec;
            frame.author = promptParams.projectAuthor;
            let frameJson = JSON.stringify(frame, null, "\t");
            fs.writeFileSync(file, frameJson);
        }
    });
}).then(() => {
    let file = fs.readFileSync(this.combPath + '/vue.config.js', 'utf8');
    file = file.replace(new RegExp('8080', 'gm'), promptParams.projectPort);
    fs.writeFileSync(this.combPath + '/vue.config.js', file, 'utf8');
});
