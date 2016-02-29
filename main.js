var
  questions = require('./lib/cli'),
  Q = require('q'),
  _ = require('underscore'),
  shell = require('shelljs'),
  quotes = require('./lib/quotes'),
  git = require('./lib/git'),
  chalk = require('chalk'),
  COPY_TO_CLIPBOARD = true,
  ASK_TO_COPY = false;

function copyToClipboard(cmd) {
  var willrun = "echo \"" + cmd + "\" |  tr -d '\\n' | pbcopy";
  // console.log(willrun);
  return shell.exec(willrun).code === 0;
}

function runCommand(cmd) {
  return shell.exec(cmd).code === 0;
}

a = console.log;
var spaces = '     ';

function logGreen(str) {
  console.log(chalk.green(str));
}

function logYellow(str) {
  console.log(chalk.yellow(str));
}

function copyOrRunCommand(cmd) {
  if (COPY_TO_CLIPBOARD) {
    logYellow(cmd);
    console.log('copied to clipboard.')
    return copyToClipboard(cmd);
  }
  else {
    return runCommand(cmd);
  }
}

function recommendCommand(cmd, cannotRun) {
  if (!cannotRun && COPY_TO_CLIPBOARD && !ASK_TO_COPY) {
    return copyOrRunCommand(cmd);
  }

  logGreen('clay recommends that you run the following command:');
  logYellow(spaces + cmd);
  a();

  if (cannotRun) {
    return;
  }

  var mainOptions = {
    PROCEED: 'Yes',
    QUIT: 'No'
  };
  var mainQuestionId = 'mainChoice';
  var mainQuestion = 'do you want clay to do it for you?';
  if (COPY_TO_CLIPBOARD) {
    mainQuestion = 'do you want clay to copy it to the clipboard for you?';
  }

  return questions.misc.arbitraryList(
    mainQuestionId,
    mainQuestion,
    _.values(mainOptions)
  ).then(function (answer) {
    switch (answer[mainQuestionId]) {
    case mainOptions.PROCEED:
      return copyOrRunCommand(cmd);
    case mainOptions.QUIT:
      break;
    }
  });
}

function gRep(str, repWhat, repWith) {
  return str.replace(new RegExp(repWhat.source, 'g'), repWith);
}

function getBranchCommand(branch) {
  var cmd = 'git checkout -b "';
  cmd += gRep(branch, /\s/, '-').toLowerCase();
  cmd += '"';
  return cmd;
}

function checkoutBranch() {
  return questions.misc.arbitraryInput('branch', 'Enter branch name: ').then(
    function (branchAns) {
      var cmd = getBranchCommand(branchAns.branch);
      return recommendCommand(cmd);
    });
}

function checkoutMaster() {
  return git.checkout('master');
}

function mainMenu() {

  return checkoutExistingBranch();
  var currentBranch = git.getCurrentBranchName();
  var mainOptions = {
    CHECKOUT: 'Checkout a new branch',
    CHECKOUT_EXISTING: 'Checkout an existing branch',
    CHECKOUT_MASTER: 'Checkout master',
    FETCH_REBASE: 'Fetch and rebase',
    PUSH_CURR: 'Push to origin/' + currentBranch,
    PUSH_MASTER: 'Push to origin/master',
    QUIT: 'Quit'
  };

  if (currentBranch === 'master') {
    delete mainOptions.PUSH_CURR;
  }

  var mainQuestionId = 'mainChoice';
  var mainQuestion = 'What do you want to do?';

  return questions.misc.arbitraryList(
    mainQuestionId,
    mainQuestion,
    _.values(mainOptions)
  ).then(function (answer) {
    switch (answer[mainQuestionId]) {
    case mainOptions.CHECKOUT:
      return checkoutBranch();
    case mainOptions.CHECKOUT_EXISTING:
      return checkoutExistingBranch();
    case mainOptions.CHECKOUT_MASTER:
      return checkoutMaster();
    case mainOptions.PUSH_CURR:
      return pushToCurrentBranch(currentBranch);
    case mainOptions.FETCH_REBASE:
      return fetchAndRebase();
    case mainOptions.PUSH_MASTER:
      return pushToMasterBranch(currentBranch);
    case mainOptions.QUIT:
      break;
    }
  });
}

function fetchAndRebase() {
  var cmd = 'git fetch && git fetch origin && git rebase ';
  var mainOptions = {
    REGULAR: 'No (git rebase ...)',
    INTERACTIVE: 'Yes (git rebase -i ...)'
  };
  var mainQuestionId = 'mainChoice';
  var mainQuestion = 'Do you want to rebase interactively?';

  return questions.misc.arbitraryList(
    mainQuestionId,
    mainQuestion,
    _.values(mainOptions)
  ).then(function (answer) {
    var cannotRun;
    switch (answer[mainQuestionId]) {
    case mainOptions.INTERACTIVE:
      cmd += '-i ';
      // cannotRun = true;
      cannotRun = false;
      break;
    case mainOptions.REGULAR:
      cannotRun = false;
      break;
    }
    cmd += 'origin/master';
    return recommendCommand(cmd, cannotRun);
  });
}

function pushToMasterBranch(currentBranch) {
  var cmd = 'git push origin ';
  cmd += currentBranch;
  cmd += ':master';
  return recommendCommand(cmd);
}

function pushToCurrentBranch(currentBranch) {
  var cmd = 'git push origin ';
  cmd += currentBranch;
  cmd += ':';
  cmd += currentBranch;

  logYellow('Your current branch is: ' + currentBranch);
  logYellow('You are about to push to origin');

  var mainOptions = {
    REGULAR: 'No',
    FORCE: 'Yes (force push)'
  };
  var mainQuestionId = 'mainChoice';
  var mainQuestion = 'do you want clay to force push?';

  return questions.misc.arbitraryList(
    mainQuestionId,
    mainQuestion,
    _.values(mainOptions)
  ).then(function (answer) {
    switch (answer[mainQuestionId]) {
    case mainOptions.FORCE:
      return recommendCommand(cmd + ' -f');
    case mainOptions.REGULAR:
      return recommendCommand(cmd);
    }
  });
}

function checkoutExistingBranch() {
  // TODO: Only list branches made by current user
  var branches = git.listBranches();

  return questions.misc.arbitraryList('branch', 'Which branch?', branches).then(function (answer) {
    var branch = git.parseBranch(answer.branch).name;
    return git.checkout(branch);
  });
}

function main() {
  return mainMenu()
    .then(function (success) {
      console.log();
      console.log(quotes.getRandomInspiration());
      console.log();
      logGreen('Thanks for using clay!');
    })
    .fail(function (error) {
      console.log('Oops! Looks like there was an error.');
      console.log(error);
    });
}

main();
