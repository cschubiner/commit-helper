commit-helper
=========

A command line interface to view your Jira tickets and checkout relevant branches.

### Installation
```bash
git clone https://github.com/cschubiner/commit-helper.git
npm install -g commit-helper
cd commit-helper
npm i
chmod 777 ~/commit-helper/bin/clay
clay
```

### Running commit-helper

Simple type in the command `clay` on the command line and press enter!

# Features

## Checkout a new branch using JIRA

```bash
$ clay
[?] What do you want to do? Checkout a new branch using JIRA
[?] Enter JIRA ticket name: OKTA-12411
[?] Enter brief description: does a ton of things
[?] Enter your initials: CS
clay recommends you run the following command:
    git checkout -b "cs-okta-12411-does-a-ton-of-things"

[?] do you want clay to do it for you? Yes
Switched to a new branch 'cs-okta-12411-does-a-ton-of-things'

Every person has a revolution beating within his or her chest -Adam Braun

Thanks for using clay!
```


##Other features

Other features include:

 - Checking out an existing branch
 - Pushing to current branch
 - Pushing to master
