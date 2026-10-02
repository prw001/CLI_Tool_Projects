A simple task-tracking CLI tool that allows you to add, update, and delete tasks.
Each task is given an auto-generated id and stores its creation date and last-updated date.

---------------------------------------------------------------------------------------
**OPTIONS:**
-a, --add <args...>                     | Add a *new task* to the list
-u, --update-with-id <args...>          | Update a task *id* with *description*
-U, --update-at-index <args...>         | Update a task at *index* with *description*
-d, --delete-with-id <Id>               | Delete a task with *Id*
-D, --delete-at-index <Idx>             | Delete a task at *Index*
-i, --mark-in-progress-with-id <Id>     | Mark a task with *Id* as 'in-progress'
-I, --mark-in-progress-at-index <Idx>   | Mark a task at *Index* as 'in-progress'
-f, --mark-done-with-id <Id>            | Mark a task with *Id* as 'completed'
-F, --mark-done-at-index <Idx>          | Mark a task at *Index* as 'completed'
-l, --list-tasks                        | Show the list of all tasks
-p, --list-in-progress                  | Show a list of all in-progress tasks
-c, --list-completed-tasks              | Show a list of all completed tasks

---------------------------------------------------------------------------------------

Created in response to the following project idea:
https://roadmap.sh/projects/task-tracker
