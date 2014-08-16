var shell = require('shelljs');
var inquirer = require("inquirer");
var _ = require('underscore');
var q = require('q');

var git = module.exports = {};

git.chooseBranch = function (branches) {
  var d = q.defer();
  inquirer.prompt([{
    type: "list",
    name: "branches",
    message: "Which branch?",
    choices: branches
  }], function (answers) {
    d.resolve(answers);
  });
  return d.promise;
};

git.isBranch = function (line) {
  return line.length > 3;
};

git.parseBranch = function (line) {
  var name = line.substring(2);
  var current = line[0] === '*';
  return {
    name: name,
    current: current
  };
};

git.stringifyBranch = function (branch) {
  var prefix = branch.current ? '* ' : '  ';
  return prefix + branch.name;
};

git.listBranches = function () {
  var output = shell.exec('git branch', {
    silent: true
  }).output;
  var lines = output.split('\n');
  return _.filter(lines, git.isBranch);
};

// Returns true on success, otherwise false.
git.checkout = function (name) {
  return shell.exec('git checkout ' + name).code === 0;
};

// Returns true on success, otherwise false.
git.checkoutNew = function (name) {
  return shell.exec('git checkout -b ' + name).code === 0;
};

git.getCurrentBranchName = function () {
  return shell.exec('git rev-parse --abbrev-ref HEAD', {
    silent: true
  }).output.trim();
};
