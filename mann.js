#!/usr/bin/env node

var fs = require('fs');
var spawn = require('child_process').spawn;
var colors = require('colors');
var eol = require('os').EOL;
var optimist = require('optimist')
    .alias('e', 'edit')
    .describe('e', 'Edit command\'s mann page.')
    .usage('Usage:' + eol + '  mann <command>' + eol + '  mann -e <command>');

var mannDir = getUserHome() + '/.mann';
fs.mkdir(mannDir, function() {});

if (!optimist.argv.e) {
  if (optimist.argv._.length == 0) {
    console.log(optimist.help());
    return;
  }

  optimist.argv._.forEach(function(command) {
    var mannFile = mannDir + '/' + command + '.md';

    if (!fs.existsSync(mannFile)) {
      console.error('No mann page exists for ' + command);
      console.error('Type \'mann -e ' + command + '\' to add a mann page for it.');
      return;
    }

    var mann = fs.readFileSync(mannFile).toString();
    mann = mann.replace(/^(# *.*)$/gm, '$1'.green);
    mann = mann.replace(/^(\n|\r|\r\n)+/, '').replace(/(\n|\r|\r\n)+$/, '');

    console.log(mann);
  });
}
else {
  var command = argv.e;

  if (typeof command != 'string') {
    console.log(optimist.help());
    return;
  }

  var mannFile = mannDir + '/' + command + '.md';
  launchEditor(mannFile);
}

function launchEditor(file) {
  var editor = process.env.EDITOR;

  if (!editor) {
    console.error('No editor found. Please set the EDITOR environment variable.');
    return;
  }

  var editorArgs = editor.split(' ');
  var editorExecutable = editorArgs.shift();

  spawn(editorExecutable, editorArgs.concat([file]), {stdio: 'inherit'})
  .on('error', function() {
    console.error('Failed to launch the editor. Make sure the EDITOR environment variable is correctly set.');
  });
}

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
