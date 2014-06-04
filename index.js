#!/usr/bin/env node
'use strict';

var generator = require('./generator')
  , pkg = require('./package.json')
  , query = process.argv[2]
  , argv = require('minimist')((process.argv.slice(2)))
  , validReports = ['Fresh', 'Health', 'Links', 'Deadlinks', 'Html', 'Wcag', 'Pagespeed', 'Meta']
  , opts = {
      filename: 'report.csv'
    }
  ;

function printHelp() {
  console.log(pkg.description);
  console.log('');
  console.log('Usage:');
  console.log('  $ node index.js <url> --report=<report>');
  console.log('');
  console.log('Valid report types: ' + validReports.join(', '));
  console.log('');
  console.log('Optional: pass in filename for report (defaults to report.csv)');
  console.log('');
  console.log('  $ node index.js <url> --report=<report> --filename=<filename>');
}

if (!query || process.argv.indexOf('-h') !== -1 || process.argv.indexOf('--help') !== -1) {
  printHelp();
  return;
}

if (process.argv.indexOf('-v') !== -1 || process.argv.indexOf('--version') !== -1) {
  console.log(pkg.version);
  return;
}

if (query.indexOf('http') !== -1) {
  opts.url = argv._[0];
}

if(argv.url){
  opts.url = argv.url;
}

if(argv.report){
  opts.report = argv.report;
}

if(argv.filename){
  opts.filename = argv.filename;
}

generator(opts, function(err){
    if(err){
      throw err;
    }
});
