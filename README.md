# Github Browser
Browse github orderly.

### Features
- Gives you **only 1 page** (no tabs, no clutter. just focus). If you really, really must see a link in another window you can use "Preview" feature (cmd+click or right-click on a link/image)
- Minimalist & functional design
- Dock **badge** shows the number of new notifications
- Tweaked github css to make it responsive and hide unimportant blocks (headers, footers)
- Has 4 main sections:
  - notifications - see what's going on, and dismiss merged PRs without leaving the page
  - bookmarks - stash any page. Issue/PR pages are grouped by repository name. PR bookmarks will show build job progress (tested only with jenkins for now)
  - my issues - work in progress
  - projects - a view of all projects for a default repository
- **Auto updater** (like chrome - updates the app in the background)
- Works with **Github Enterprise**
- **TouchBar** Support


### Download
Check the [Releases](https://github.com/tborychowski/github-browser/releases) for the latest version.


### Screenshots

![Notifications](screens/1-notifications.png)
![Bookmarks](screens/2-bookmarks.png)
![My Issues](screens/3-myissues.png)
![Projects](screens/4-projects.png)
![Settings](screens/5-settings.png)


### Dev install
```sh
git clone https://github.com/tborychowski/github-browser.git
cd github-browser
npm i
npm start
```


### License
*MIT*
