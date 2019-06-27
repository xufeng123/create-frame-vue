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
        default: '8080'
    }
];
// 复制文件夹以及文件
const copy = function (src,dst) {
    let paths = fs.readdirSync(src); //同步读取当前目录
    paths.forEach(function(path){
        var _src=src+'/'+path;
        var _dst=dst+'/'+path;
        fs.stat(_src,function(err,stats){  //stats  该对象 包含文件属性
            if(err)throw err;
            if(stats.isFile()){ //如果是个文件则拷贝
                let  readable=fs.createReadStream(_src);//创建读取流
                let  writable=fs.createWriteStream(_dst);//创建写入流
                readable.pipe(writable);
            }else if(stats.isDirectory()){ //是目录则 递归
                checkDirectory(_src,_dst,copy);
            }
        });
    });
}
const checkDirectory=function(src,dst,callback){
    if (dst.indexOf('.') > -1) {
        let  readable=fs.createReadStream(src);//创建读取流
        let  writable=fs.createWriteStream(dst);//创建写入流
        readable.pipe(writable);
    } else {
        fs.access(dst, fs.constants.F_OK, (err) => {
            if(err){
                fs.mkdirSync(dst);
                callback(src,dst);
            }else{
                callback(src,dst);
            }
        });
    }
};
// 删除

const _deleteFolder = function (path) { // 删除文件夹及文件
    if (!path) return;
    var files = [];
    files = fs.readdirSync(path);
    files.forEach((file,index) => {
        var curPath = path + '/' + file;
        if (fs.statSync(curPath).isDirectory()) { // recurse
            _deleteFolder(curPath);
        } else { // delete file
            fs.unlinkSync(curPath);
        }
    });
    fs.rmdirSync(path);
}

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
}).then(() => {
    _deleteFolder(this.combPath + '/.git');
    console.log('end');
});
