commit-helper
=========

A command line interface to view your Jira tickets and checkout relevant branches.

Installation:
```bash
git clone git@github.com:cschubiner/commit-helper.git
npm install -g commit-helper
clay
```

# Features

## Checkout a new branch using JIRA

```bash
$ clay
[?] What do you want to do? Checkout a new branch using JIRA
[?] Enter JIRA ticket name (e.g. 'OKTA-39694'): OKTA-12411
[?] Enter brief description (e.g. 'adds 1000 apps to db'): does a ton of things
[?] Enter your initials (e.g. 'CS'): CS
    clay recommends you run the following command:
    git checkout -b "cs-okta-12411-does-a-ton-of-things"

[?] do you want clay to do it for you? Yes
Switched to a new branch 'cs-okta-12411-does-a-ton-of-things'

Every person has a revolution beating within his or her chest -Adam Braun

Thanks for using clay!
```

