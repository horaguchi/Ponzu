call npm install -d
call npm test -d
copy ponzu.browserify.js www\js\ponzu.browserify.js
copy ponzu-html5.js      www\js\ponzu-html5.js
cordova run browser
pause
