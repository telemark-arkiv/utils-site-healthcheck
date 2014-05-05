var helpers = require('./helpers')
  , validateHtml = require('html-validator')
  , validateWcag = require('wcag-validator')
  , pagespeed = require('gpagespeed')
  , xml2js = require('xml2js')
  , parser = new xml2js.Parser()
  , acheckerID = 'insert-your-achecker-webserviceID-here'
  , pagespeedAPIKey = 'insert-your-google-APIkey-here'
  ;

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
  mkReportLinks: function(element, tracker, callback){
    helpers.getPageLinks(element.loc[0], function(err, data){
      if(err){
        return callback(err, null);
      } else {

        var linksLength = data.links.length;

        for(var i=0;i < linksLength; i++){
          var link = data.links[i]
            , ret = [data.url, link];

          tracker.emit('row', ret);
        }
      }
    });
  },
  mkReportDeadlinks: function(element, tracker, callback){
    helpers.getPageLinks(element.loc[0], function(err, data){
      if(err){
        return callback(err, null);
      } else {
        helpers.checkPageLinks(data.url, tracker, data.links);
      }
    });
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
          , data = [result.url, res];
        tracker.emit('row', data);
      }
    });
  },
  mkReportWcag: function(element, tracker, callback){
    var opts = {uri: element.loc[0], id: acheckerID, output: 'rest'};

    validateWcag(opts, function(error, body){
      if(error){
        return callback(error, null);
      } else {
        parser.parseString(body.toString(), function (err, result) {
          if (err) {
            return callback(err, null);
          } else {
            if (result){
              var data = [opts.uri, result.resultset.summary[0].NumOfErrors[0]];
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
    var opts = {url : element.loc[0], key : pagespeedAPIKey};

    pagespeed(opts, function(err, data){
      if(err){
        return callback(err);
      } else {
        var result = JSON.parse(data);
        if(result.score){
          var ret = [opts.url, result.score];
          tracker.emit('row', ret);
        } else {
          return callback(new Error('Something is wrong: ' + result));
        }
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