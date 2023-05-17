# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Table of Contents

* [Commit guidelines](#commit-guidelines)
* [How to make a pull request](#how-to-make-a-pull-request)

## Commit guidelines

Our guidelines for committing changes to the project are as follows:

* Use the imperative, present tense form of the action. e.g. `Change` not `Changes` nor `Changed`
* Capitalize the first letter of the `subject` (see [structure](#commit-message-structure))
* No period at the end

### Commit message structure

The commit message should be in the following format:

```
<type>: <subject> <icon>
```

Where:

* `<type>` is one of the following:
    * `feat`: Relates to a feature
    * `fix`: Bug fixing
    * `docs`: Documentation changes
    * `style`: Changes that do not affect the meaning of the code (e.g. formatting)
    * `refactor`: Code change that neither fixes a bug nor impacts any feature
    * `perf`: Code change that improves performance
    * `test`: Test creation or fixing
    * `build`: Changes that affect the build system or external dependencies
    * `ci`: Changes to our continuous integration system
    * `chore`: Changes to the build process or auxiliary tools and libraries
    * `revert`: Reverts a previous commit
* `<subject>` is a short description of the change
* `<icon>` is an emoticon that represents the `<type>` of change:
    * `feat`: ✨ (`:sparkles:`)
    * `fix`: 🐛 (`:bug:`)
    * `docs`: 📚 (`:books:`)
    * `style`: 💎 (`:gem:`)
    * `refactor`: 📦 (`:package:`)
    * `perf`: 🚀 (`:rocket:`)
    * `test`: 🚨 (`:rotating_light:`)
    * `build`: 🛠 (`:hammer_and_wrench:`)
    * `ci`:⚙️ (`:gear:`)
    * `chore`: ♻️ (`:recycle:`)
    * `revert`: 🗑 (`:wastebasket:`)

## How to make a pull request

* Fork the repository.
* Clone the fork on your local machine.
* If you forked the repository long ago, you might have to pull the latest changes.
* Create a new branch from `main` and switch to it. You can use the `git checkout -b <branch-name>` command.
* Make your changes.
* Update the documentation.
* Commit your changes. Follow the [commit guidelines](#commit-guidelines).
* Push your changes on your fork. You can use the `git push origin <branch-name>` command.
* From your fork, create a pull request with `main` as the base branch and your new branch as the head branch.
* If changes are requested by reviewers, push them on your branch.
* If the pull request is accepted, the changes will be squashed into the main branch.