var inquirer = require("inquirer");
var q = require('q');

var Questions = module.exports = {};

Questions.jira = {};
Questions.jira.list = function () {
  var d = q.defer();
  inquirer.prompt([{
    type: "list",
    name: "jira-choose",
    message: "What do you want to do?",
    choices: [
      "List my Jiras",
      "List recently viewed Jiras"
    ]
  }], function (answers) {
    d.resolve(answers);
  });
  return d.promise;
};

Questions.git = {};
Questions.git.branch = function () {
  var d = q.defer();
  inquirer.prompt([{
    type: "list",
    name: "git-branch",
    message: "What do you want to do?",
    choices: [
      "Checkout new branch",
      "Checkout existing branch"
    ]
  }], function (answers) {
    d.resolve(answers);
  });
  return d.promise;
};

Questions.misc = {};
Questions.misc.arbitraryList = function (name, message, choices) {
  var d = q.defer();
  inquirer.prompt([{
    type: "list",
    name: name,
    message: message,
    choices: choices
  }], function (answers) {
    d.resolve(answers);
  });
  return d.promise;
};

function denyNoInput(userInput) {
  return userInput.length && userInput.length > 0;
}

Questions.misc.arbitraryInput = function (name, message) {
  var d = q.defer();
  inquirer.prompt([{
    type: "input",
    name: name,
    message: message,
    validate: denyNoInput
  }], function (answers) {
    d.resolve(answers);
  });
  return d.promise;
};

Questions.misc.arbitraryPassword = function (name, message) {
  var d = q.defer();
  inquirer.prompt([{
    type: "password",
    name: name,
    message: message
  }], function (answers) {
    d.resolve(answers);
  });
  return d.promise;
};
