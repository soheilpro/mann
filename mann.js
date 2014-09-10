#!/usr/bin/env node

var fs = require('fs');
var spawn = require('child_process').spawn;
var colors = require('colors');
var eol = require('os').EOL;
var optimist = require('optimist')
    .alias('e', 'edit')
    .alias('a', 'add')
    .alias('l', 'list')
    .describe('e', 'Edit command\'s mann page.')
    .describe('a', 'Add line to command\'s mann page.')
    .describe('l', 'List all available mann pages.')
    .usage('Usage:' + eol + '  mann <command>' + eol + '  mann -e <command>' + eol + '  mann -a <command> <line>' + eol + '  mann -l');

fs.mkdir(getMannDir(), function() {});

if (optimist.argv.e) {
  var command = optimist.argv.e;

  if (typeof command != 'string') {
    console.log(optimist.help());
    return;
  }

  var mannFile = getMannFile(command);
  launchEditor(mannFile);
}
else if (optimist.argv.a) {
  var command = optimist.argv.a;

  if (typeof command != 'string') {
    console.log(optimist.help());
    return;
  }

  var line = optimist.argv._.join(' ');

  if (!line) {
    console.log(optimist.help());
    return;
  }

  var mann = '';
  var mannFile = getMannFile(command);

  if (fs.existsSync(mannFile))
    mann = fs.readFileSync(mannFile).toString();

  mann = mann + eol + line;
  fs.writeFileSync(mannFile, mann);
}
else if (optimist.argv.l) {
  var mdExtensionRegex = /\.md$/;

  fs.readdirSync(getMannDir()).forEach(function(file) {
    if (file.match(mdExtensionRegex)) {
      console.log(file.replace(mdExtensionRegex, ''));
    }
  })
}
else {
  if (optimist.argv._.length == 0) {
    console.log(optimist.help());
    return;
  }

  optimist.argv._.forEach(function(command) {
    var mannFile = getMannFile(command);

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

function getMannFile(command) {
  return getMannDir() + '/' + command + '.md';
}

function getMannDir() {
  return getUserHome() + '/.mann'
}

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
