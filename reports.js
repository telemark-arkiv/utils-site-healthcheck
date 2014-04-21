var helpers = require('./helpers')
  , validateHtml = require('html-validator')
  , validateWcag = require('wcag-validator')
  , xml2js = require('xml2js')
  , parser = new xml2js.Parser()
  , acheckerID = 'insert-your-achecker-webserviceID-here';

function mkCsvRowFromArray(arr){
  var a = arr.map(function(i){
        return '"' + i + '"'
      });
  return a.join(',') + '\r\n'
}

module.exports = {

  mkReportFresh: function(element, tracker, callback){
    helpers.getPageDaysSinceLastUpdate(element, function(err, data){
      if(err){
        return callback(err, null)
      } else {
        tracker.emit('row', data);
      }
    });
  },
  mkReportLinks: function(pages, stream){
    var pagesLength = pages.length
      , headers = mkCsvRowFromArray(['location', 'link']);

    stream.push(headers);

    for(var i=0;i < pagesLength; i++){
      var page = pages[i]
        , location = page.loc[0];

      helpers.getPageLinks(location, function(err, data){
        if(err){
          console.error(err);
        } else {

          var linksLength = data.links.length;

          for(var i=0;i < linksLength; i++){
            var link = data.links[i]
              , ret = mkCsvRowFromArray([data.url, link]);

            stream.push(ret);
          }
        }
      });

    }
  },
  mkReportDeadlinks: function(pages, stream){
    var pagesLength = pages.length
      , headers = mkCsvRowFromArray(['location', 'link', 'status_code']);

    stream.push(headers);

    for(var i=0;i < pagesLength; i++){
      var page = pages[i]
        , location = page.loc[0];

      helpers.getPageLinks(location, function(err, data){
        if(err){
          console.error(err);
        } else {
          helpers.checkPageLinks(data.url, stream, data.links);
        }
      });
    }
  },
  mkReportHealth: function(element, tracker, callback){
    helpers.checkPageStatus(element.loc[0], function(err, data){
      if(err){
        return callback(err, null);
      } else {
        tracker.emit('row', data);
      }
    })
  },
  mkReportHtml: function(element, tracker, callback){
    validateHtml({url:element.loc[0], format:'json'}, function(err, result){
      if(err){
        return callback(err, null);
      } else {
        var res = result.messages.length > 0 ? "Errors" : "Valid"
          , data = mkCsvRowFromArray([result.url, res]);
        tracker.emit('row', data);
      }
    });
  },
  mkReportWcag: function(element, tracker, callback){
    var opts = {
          uri : element.loc[0],
          id : acheckerID,
          output : 'rest'
        }
      ;

    validateWcag(opts, function(error, body){
      if(error){
        return callback(error, null);
      } else {
        parser.parseString(body.toString(), function (err, result) {
          if (err) {
            return callback(err, null);
          } else {
            if (result){
              var data = mkCsvRowFromArray([opts.uri, result.resultset.summary[0].NumOfErrors[0]]);
              tracker.emit('row', data);
            } else {
              return callback(new Error('Something is wrong: ' + result), null);
            }
          }
        });
      }
    });
  },
  mkReportPagespeed: function(element, tracker, callback){
    helpers.getPagespeedReport(element.loc[0], function(err, data){
      if(err){
        return callback(err, null);
      } else {
        tracker.emit('row', data);
      }
    });
  },
  mkReportMeta: function(element, tracker, callback) {
    helpers.getPageMetadata(element.loc[0], function (err, data) {
      if (err) {
        return callback(err, null);
      } else {
        tracker.emit('row', data);
      }
    });
  }
};