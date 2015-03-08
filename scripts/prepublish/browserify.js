#!/usr/bin/env node

var fs = require('fs');
var browserify = require('browserify');

var b = browserify({
  standalone: "Ponzu"
});
b.add("./ponzu.js");
b.bundle(function (err, src) {
  fs.writeFileSync("./ponzu.browserify.js", src);
  console.info("ponzu.browserify.js is updated");
});
