var gulp = require('gulp-help')(require('gulp'));

require('./gulp-common/all.js');
require('./gulp-common/raspberrypi-node.js').initTasks(gulp);