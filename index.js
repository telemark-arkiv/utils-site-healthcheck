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
  reports = ['fresh', 'health', 'links'],
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

      if(report == 'fresh'){
        console.log('Generates report type "fresh"')
        reportData = helpers.mkReportFreshness(pages, reader);
      } else if(report == 'links'){
        reportData = helpers.mkReportLinks(pages);
      } else if(report == 'health'){
        console.log('Generates report type "health"')
        reportData = helpers.mkReportHealth(pages, reader);
      }

    }
  })
} else {
  console.log('Missing required arguments or invalid report type');
  console.log('Usage:');
  console.log('node index.js --url=url-to-parse --report=type-of-report --filename=filename-to-save');
  console.log('Valid report types: fresh, health and links');
}