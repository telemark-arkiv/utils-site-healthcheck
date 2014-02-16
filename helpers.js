/**
 * Created by geir on 16/02/14.
 */

var
  fs = require('fs'),
  json2csv = require('json2csv');

module.exports = {

  writeReport: function(reportdata, fileName) {
    json2csv({data: reportdata[0], fields: reportdata[1]}, function(err, csv) {
      if (err) console.log(err);
      fs.writeFile(fileName, csv, function(err) {
        if (err) throw err;
        console.log('file saved');
      });
    });
  },
  mkReportFreshness: function(pages){
    var
      today = new Date(),
      pagesLength = pages.length,
      report = [];

    function daysBetween(date1, date2){
      return Math.floor((date1 - date2)/(1000 * 60 * 60 * 24));
    }

    for(var i=0;i < pagesLength; i++){
      var
        rep = {},
        page = pages[i],
        pageModified = new Date(page.lastmod[0]);

      rep.location = page.loc[0];
      rep.last_modified = daysBetween(today, pageModified);
      report.push(rep)
    }

    return [report, ['location', 'last_modified']];

  }

};