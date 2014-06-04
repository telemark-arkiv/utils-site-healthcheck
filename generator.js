var fs = require('fs')
  , stream = require('stream')
  , validUrl = require('valid-url')
  , helpers = require('./helpers')
  , reports = require('./reports')
  , validReports = ['Fresh', 'Health', 'Links', 'Deadlinks', 'Html', 'Wcag', 'Pagespeed', 'Meta']
  ;

module.exports = function generateReport(opts, callback){

  if(!opts.url){
    return callback(new Error('Missing required param: url'), null);
  }

  if(opts.url && !validUrl.isWebUri(opts.url)){
    return callback(new Error('Invalid url'), null);
  }

  if(!opts.report){
    return callback(new Error('Missing required param: report'), null);
  }

  if(validReports.indexOf(opts.report) === -1){
    return callback(new Error('Invalid report type'), null);
  }

  if(!opts.filename){
    return callback(new Error('Missing required param: filename'), null);
  }

  helpers.getPages(opts.url, function(err, pages){
    if (err) {
      return callback(err, null);
    } else {
      var
        writeStream = fs.createWriteStream(opts.filename),
        readStream = stream.PassThrough(),
        thisReport = reports['mkReport' + opts.report];

      readStream.pipe(writeStream);

      console.log('Generates report type "' + opts.report + '"');

      thisReport(pages, readStream);

    }
  });

};