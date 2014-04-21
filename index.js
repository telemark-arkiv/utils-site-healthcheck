var fs = require('fs')
  , events = require('events')
  , tracker = new events.EventEmitter()
  , stream = require('stream')
  , helpers = require('./helpers')
  , reports = require('./reports')
  , headers = require('./headers')
  , argv = require('minimist')(process.argv.slice(2))
  , sitemapUrl = argv.url
  , report = argv.report
  , fileName = argv.filename || 'report.csv'
  , validReports = ['Fresh', 'Health', 'Links', 'Deadlinks', 'Html', 'Wcag', 'Pagespeed', 'Meta']
  , validReport = false;

function mkCsvRowFromArray(arr){
  var a = arr.map(function(i){
    return '"' + i + '"'
  });
  return a.join(',') + '\r\n'
}

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
        thisReport = reports['mkReport' + report],
        thisHeaders = mkCsvRowFromArray(headers[report]),
        pageCount = 0;

      readStream.pipe(writeStream);

      console.log('Generates report type "' + report + '"');

      readStream.push(thisHeaders);

      tracker.on('row', function(row){
        readStream.push(row);
        pageCount++;
        console.log(pageCount);
      });

      pages.forEach(function(item){
        thisReport(item, tracker, function(err){
          if(err){
            console.log(err);
            pageCount++;
            console.log(pageCount)
          }
        });
      });

    }
  });
} else {
  console.log('Missing required arguments or invalid report type');
  console.log('Usage:');
  console.log('node index.js --url=url-to-parse --report=type-of-report --filename=filename-to-save');
  console.log('Valid report types: ' + validReports.join(', '));
}