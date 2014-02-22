/**
 * Created by geir on 16/02/14.
 */

var
  csv = require('ya-csv'),
  fs = require('fs'),
  stream = require('stream'),
  helpers = require('./helpers'),
  argv = require('minimist')(process.argv.slice(2)),
  sitemapUrl = argv.url,
  report = argv.report,
  fileName = argv.filename || 'report.csv',
  reports = ['Fresh', 'Health', 'Deadlinks', 'Html', 'Wcag', 'Pagespeed', 'Meta'],
  validReport = false;

if(reports.indexOf(report) > -1) {
  validReport = true;
}

if (sitemapUrl && report && fileName && validReport) {
  helpers.getPages(sitemapUrl, function(err, pages){
    if (err) {
      console.log(err);
    } else {
      var
        writeStream = fs.createWriteStream(fileName),
        reader = stream.PassThrough(),
        writer = csv.createCsvStreamWriter(writeStream);

      reader.on('data', function(data){
        writer.writeRecord(JSON.parse(data.toString()));
      });

      console.log('Generates report type "' + report + '"');

      if(report == 'Fresh'){
        reportData = helpers.mkReportFresh(pages, reader);
      } else if(report == 'Deadlinks'){
        reportData = helpers.mkReportDeadlinks(pages, reader);
      } else if(report == 'Health'){
        reportData = helpers.mkReportHealth(pages, reader);
      } else if(report == 'Html'){
        reportData = helpers.mkReportHtml(pages, reader);
      } else if(report == 'Wcag'){
        reportData = helpers.mkReportWcag(pages, reader);
      } else if(report == 'Pagespeed'){
        reportData = helpers.mkReportPagespeed(pages, reader);
      } else if(report == 'Meta'){
        reportData = helpers.mkReportMeta(pages, reader);
      }

    }
  })
} else {
  console.log('Missing required arguments or invalid report type');
  console.log('Usage:');
  console.log('node index.js --url=url-to-parse --report=type-of-report --filename=filename-to-save');
  console.log('Valid report types: ' + reports.join(', '));
}