var fs = require('fs')
  , stream = require('stream')
  , helpers = require('./helpers')
  , reports = require('./reports')
  , argv = require('minimist')(process.argv.slice(2))
  , sitemapUrl = argv.url
  , report = argv.report
  , fileName = argv.filename || 'report.csv'
  , validReports = ['Fresh', 'Health', 'Links', 'Deadlinks', 'Html', 'Wcag', 'Pagespeed', 'Meta']
  , validReport = false;

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
  })
} else {
  console.log('Missing required arguments or invalid report type');
  console.log('Usage:');
  console.log('node index.js --url=url-to-parse --report=type-of-report --filename=filename-to-save');
  console.log('Valid report types: ' + validReports.join(', '));
}