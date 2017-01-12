var shell = require('shelljs');
var inquirer = require("inquirer");
var _ = require('underscore');
var q = require('q');
var exec = require('child_process').exec;

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
  var output = shell.exec("git branch --sort=-committerdate", {
    silent: true
  }).output;
  var lines = output.split('\n').slice(0, 20);
  lines = _.map(lines, function(l) {
    return "* " + l;
  });
  return _.filter(lines, function(l) {
    return (
      git.isBranch &&
      l != '*   master'
    );
  });
};

// Returns true on success, otherwise false.
git.checkout = function (name) {
  console.log('ACLCLA');
  console.log(name);
  console.log('git checkout ' + name + '!');
  // console.log(shell.exec('git checkout ' + name).code);

  var cmd = 'git checkout "$(echo ' + name + " | rev | cut -c 3- | rev" + ")\"";
  console.log(cmd);
  return cmd;

  exec(cmd, function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });

  return shell.exec(cmd).code === 0;
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
