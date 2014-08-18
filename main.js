var
  questions = require('./lib/cli'),
  Q = require('q'),
  _ = require('underscore'),
  shell = require('shelljs'),
  quotes = require('./lib/quotes'),
  git = require('./lib/git'),
  chalk = require('chalk');

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

function recommendCommand(cmd) {
  logGreen('clay recommends that you run the following command:');
  logYellow(spaces + cmd);
  a();

  var mainOptions = {
    PROCEED: 'Yes',
    QUIT: 'No'
  };
  var mainQuestionId = 'mainChoice';
  var mainQuestion = 'do you want clay to do it for you?';

  return questions.misc.arbitraryList(
    mainQuestionId,
    mainQuestion,
    _.values(mainOptions)
  ).then(function (answer) {
    switch (answer[mainQuestionId]) {
    case mainOptions.PROCEED:
      return runCommand(cmd);
    case mainOptions.QUIT:
      break;
    }
  });
}

function gRep(str, repWhat, repWith) {
  return str.replace(new RegExp(repWhat.source, 'g'), repWith);
}

function getBranchCommand(branch, desc, initials) {
  var cmd = 'git checkout -b "';
  cmd += gRep(initials, /\s/, '-').toLowerCase();
  cmd += '-';
  cmd += gRep(branch, /\s/, '-').toLowerCase();
  cmd += '-';
  cmd += gRep(desc, /\s/, '-');
  cmd += '"';
  return cmd;
}

function checkoutBranch() {
  return questions.misc.arbitraryInput('branch', 'Enter JIRA ticket name (e.g. \'OKTA-39694\'): ').then(
    function (branchAns) {
      return questions.misc.arbitraryInput('desc',
        'Enter brief description (e.g. \'adds 1000 apps to db\'): ').then(
        function (descAns) {
          return questions.misc.arbitraryInput('initials',
            'Enter your initials (e.g. \'CS\'): ').then(
            function (initialsAns) {
              var cmd = getBranchCommand(branchAns.branch, descAns.desc, initialsAns.initials);
              return recommendCommand(cmd);
            });
        });
    });

}

function mainMenu() {

  var currentBranch = git.getCurrentBranchName();
  var mainOptions = {
    CHECKOUT: 'Checkout a new branch using JIRA',
    CHECKOUT_EXISTING: 'Checkout an existing branch',
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
    switch (answer[mainQuestionId]) {
    case mainOptions.INTERACTIVE:
      cmd += '-i ';
      break;
    case mainOptions.REGULAR:
      break;
    }
    cmd += 'origin/master';
    return recommendCommand(cmd);
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
