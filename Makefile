all:
	npm install -d
	cp ponzu.browserify.js ponzu-html5.js www/js/
	cordova run browser
