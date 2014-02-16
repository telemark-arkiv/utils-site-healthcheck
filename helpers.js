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
  }
  
};