var fs = require('fs')
  , stream = require('stream')
  , validUrl = require('valid-url')
  , helpers = require('./helpers')
  , reports = require('./reports')
  , argv = require('minimist')(process.argv.slice(2))
  , sitemapUrl = argv.url
  , report = argv.report
  , fileName = argv.filename || 'report.csv'
  , validReports = ['Fresh', 'Health', 'Links', 'Deadlinks', 'Html', 'Wcag', 'Pagespeed', 'Meta']
  , validReport = false;
/*
if(validReports.indexOf(report) > -1) {
  validReport = true;
}

if (sitemapUrl && report && fileName && validReport) {
  helpers.getPages(sitemapUrl, function(err, pages){
    if (err) {
      console.error(err);
    } else {
      var
        writeStream = fs.createWriteStream(fileName),
        readStream = stream.PassThrough(),
        thisReport = reports['mkReport' + report];

      readStream.pipe(writeStream);

      console.log('Generates report type "' + report + '"');

      thisReport(pages, readStream);

    }
  });
} else {
  console.log('Missing required arguments or invalid report type');
  console.log('Usage:');
  console.log('node index.js --url=url-to-parse --report=type-of-report --filename=filename-to-save');
  console.log('Valid report types: ' + validReports.join(', '));
}
*/
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

  return callback(null, {});
};