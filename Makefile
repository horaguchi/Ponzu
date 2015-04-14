all:
	npm install -d
	cp ponzu-html5-drawImage.js www/js/ponzu-html5.js
	cp ponzu.browserify.js www/js/
	cordova run browser
