/**
 * Created by geir on 16/02/14.
 */

var
  helpers = require('./helpers'),
  argv = require('minimist')(process.argv.slice(2)),
  sitemapUrl = argv.url,
  report = argv.report,
  fileName = argv.filename || 'report.csv';

if (sitemapUrl && report && fileName) {
  helpers.getPages(sitemapUrl, function(err, pages){
    if (err) {
      console.log(err);
    } else {
      var
        validReport = false,
        reportData;

      if(report == 'fresh'){
        reportData = helpers.mkReportFreshness(pages);
        validReport = true;
      } else if(report == 'links'){
        reportData = helpers.mkReportLinks(pages);
      } else if(report == 'health'){
        reportData = helpers.mkReportHealth(pages);
      }

      if (validReport === true){
        helpers.writeReport(reportData, fileName);
      } else {
        console.log('No valid inputs for --report found. Please try again.')
      }

    }
  })
} else {
  console.log('Missing required arguments');
  console.log('Usage:');
  console.log('node index.js --url=url-to-parse --report=type-of-report --filename=filename-to-save');
}