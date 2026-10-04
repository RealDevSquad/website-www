# How can I contribute?

- You can fix the typos (if any) in any documentation of this repo.
- You can check for any **unassigned** [issues](https://github.com/Real-Dev-Squad/website-www/issues) and **comment** on that issue that you'd like to get that assigned to you. (Remember: Do not work on issues assigned to someone else and do not work on any issue without having it assigned to you.)
- Create issue if you see any bug and then once you get approved from the admins, you can assign yourself and start working on it.

# How can you make a **Pull Request** (PR)

**Note**: Steps 1, 2 and 3 are **one-time** steps required for setup. If you have already cloned the repo and added upstream, consider following this documentation from step 4.

1. **Forking repository**

   Fork this repository using the **Fork** option at the top-right corner of this page. This will create your own copy of this repository. You'll be redirected to your forked repository. Copy the link of this repository (which will look like `https://github.com/<your-username>/website-www/`) as you'll need it in the step 2.

   ![how-to-fork](https://user-images.githubusercontent.com/53713926/212554906-0308d029-7cf6-4403-8f7b-0ca4d50de46f.png)

1. **Cloning repository and Installing packages**

   Clone your forked repository, this will download your copy of repository in your computer. To do this, open your terminal (command prompt/bash/git bash) and enter the following command, paste your link after the word **clone** without the **<>**.

   ```sh
   git clone <link which you copied in the step 1>
   ```

   Once you have cloned the repository, now you should go into the folder containing the repository. You can do that with:

   ```sh
   cd website-www
   ```

   All work is based on the `develop` branch, so switch to it before installing the required packages.

   ```sh

   git checkout develop

   ```

   If you don't have pnpm yet, install it with the standalone script (not via
   npm or Corepack); see [Installing pnpm](README.md#installing-pnpm) in the
   README. You don't need to install Node.js: pnpm downloads the project's
   pinned Node version automatically.

   Now you should install the required packages to run this project by doing:

   ```sh

   pnpm install

   ```

1. **Adding remote repository**

   Add the Real Dev Squad repository as a remote repository, so that you can anytime pull the latest changes from the Real Dev Squad repository which is being deployed. This needs to be done only for the first time.

   ```sh

   git remote add upstream https://github.com/Real-Dev-Squad/website-www/

   ```

1. **Getting the latest code from the develop branch** (Can be skipped if you've cloned the repo just now)

   If it's been quite a while after you have cloned the repo/made the last pull request, it's recommended to take a pull from the develop branch after switching to `develop` by command `git checkout develop`. Reason being, there may be some changes which could have merged after you had cloned the repo/made the last pull request.

   To do so, make sure you're in the develop branch by checking out to the **develop** branch:

   ```sh

   git checkout develop

   ```

   Once you're in the **develop** branch, it's time to take a pull:

   ```sh

   git pull upstream develop

   ```

   Now that you've made sure that you've got latest changes, we can proceed to creating our branch

1. **Creating a new branch**

   Let's create a new branch to work on. We require a different branch so that we always have a stable, working version in the default (develop) branch. We're not supposed to touch the **main** branch as it is the one getting deployed on production.

   ```sh

   git checkout -b <branch-name>

   ```

   We will try to name the branch according to the task we are going to perform in it. If it is going to be a `feature`, the branch name should begin with `feat` or `feature`. If it is going to be a `fix`, the branch name should begin with `fix` or `bugfix`. The branch name should be self-explanatory.
   For example, if I want to work on a `feature` called `login-form`, the branch name will be **feature/login-form**. If it is going to be a `fix` in `navbar`, the branch name will be `fix/navbar`.
   Command example:

   ```sh

   git checkout -b feature/login-form

   ```

1. **Just do it!**

   Perform the tasks you wanted to, can be anything, ranging from fixing simple typo to re-designing the whole page!

1. **Committing your changes**

   Now you have made the changes, though they are saved in your system, Git doesn't know what changes you've done. So you have to **commit** your changes. First step is to add the files which you want to add to the staging area, the dot after **add** in the first command tells Git to check for changes in all the files. The second step is about committing your changes. The message part is short description of your commit, like "adds a login form on homepage". Please make sure NOT to have commit messages like "fix issue#34". When we look at the commit history, we should understand what a particular commit is supposed to do based on the commit message.

   ```sh

   git add .
   git commit -m "Write message about your commit"

   ```

1. **Making sure you have the latest changes from the develop branch**

   It may so happen that since the last time you cloned the repo/took a pull from develop, some changes may be merged in the develop branch. So to be on the safer side, we should have those changes as well.

   In order to do that, we first checkout to **develop** branch by:

   ```sh

   git checkout develop

   ```

   Once we're in develop, it's time to take a pull:

   ```sh

   git pull upstream develop

   ```

   Now that our **local** develop branch is in sync with **remote** develop branch (of the Real Dev Squad Repository), we should let our branch know about the changes from the develop branch (if any). To do so we first checkout to our branch:

   ```sh

   git checkout <branch-name>

   ```

   Once we're in our branch, we **rebase** our branch on top of the current develop branch (we change the base of our branch, so that it appears as if we have worked from the time the latest changes were merged in the develop branch). To do so:

   ```sh

   git rebase develop

   ```

   You should solve the merge conflicts, if any.

1. **Pushing the code**

   Now that we have made our changes plus we have the latest changes made by other contributors, we should push our code from **local** branch to the same branch on our **GitHub fork**. We do so by:

   ```sh

   git push origin <branch-name>

   ```

   For example, if the branch name is `feat/login-form`, we enter `git push origin feat/login-form`

   The **origin** refers to your GitHub fork. You can check it by entering `git remote -v`, you should get the link to your fork against **origin**.

1. **Making a pull request**

   Your GitHub fork now has the changes, but you want those changes to be merged in the Real Dev Squad repository, right? There's a twist, you can't directly merge your code in the Real Dev Squad. Imagine you own a company whose code is open sourced, would you like if anyone could code make changes directly to the deployed branch without asking you? For the same reason, **Pull Requests** exist. You `request` the repository maintainers/admins to `pull` your code in their repository.

   To make a pull request, go to your **forked repository** and you'll see **<branch-name> had recent pushes less than a minute ago** . Right next to it will be an option to **Compare & pull request**. Make sure the base branch is **develop** while raising the pull requests.
   Click on it, submit your pull request (also known as _PR_) explaining what you've done. Again, the PR title should be self-explanatory but concise. If you want to write details, you can add it in the description. If you're making some UI (User Interface) changes, please make sure to add a short screen recording. If that's not possible, at least add some screenshots.

   ![how-to-create-pull-request](https://i.imgur.com/zYSuNY7.png)

1. **Review stage**

   Now the maintainers/admins will review your pull request. They might suggest some changes if required. You should then make the required changes in the **same branch**, commit them and push your changes to the **same branch** (follow the steps 7, 8 and 9 for the same).

1. **Congratulations on your first Pull Request in Real Dev Squad! 🎉**
