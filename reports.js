/**
 * Created by geir on 26/02/14.
 */

var
  helpers = require('./helpers');

function mkCsvRowFromArray(arr){
  var
    a = arr.map(function(i){
      return '"' + i + '"'
    });
  return a.join(',') + '\r\n'
}

module.exports = {

  mkReportFresh: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = mkCsvRowFromArray(['location', 'last_modified']);

    stream.push(headers);

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i];

      helpers.getPageDaysSinceLastUpdate(page, function(err, data){
        if(err){
          console.log(err);
        } else {
          stream.push(data);
        }
      });
    }
  },
  mkReportLinks: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = mkCsvRowFromArray(['location', 'link']);

    stream.push(headers);

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      helpers.getPageLinks(location, function(err, data){
        if(err){
          console.log(err);
        } else {

          var
            linksLength = data.links.length;

          for(var i=0;i < linksLength; i++){
            var
              link = data.links[i],
              ret = mkCsvRowFromArray([data.url, link]);

            stream.push(ret);
          }
        }
      });

    }
  },
  mkReportDeadlinks: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = mkCsvRowFromArray(['location', 'link', 'status_code']);

    stream.push(headers);

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      helpers.getPageLinks(location, function(err, data){
        if(err){
          console.log(err);
        } else {
          helpers.checkPageLinks(data.url, stream, data.links);
        }
      });
    }
  },
  mkReportHealth: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = mkCsvRowFromArray(['location', 'status_code']);

    stream.push(headers);

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      helpers.checkPageStatus(location, function(err, data){
        if(err){
          console.log(err);
        } else {
          stream.push(data);
        }
      })
    }
  },
  mkReportHtml: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = mkCsvRowFromArray(['location', 'status']);

    stream.push(headers);

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      helpers.validateThisPageHtml(location, function(err, data){
        if(err){
          console.log(err);
        } else {
          stream.push(data);
        }
      });
    }
  },
  mkReportWcag: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = mkCsvRowFromArray(['location', 'errors']);

    stream.push(headers);

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      helpers.validateThisPageWcag(location, function(err, data){
        if(err){
          console.log(err);
        } else {
            stream.push(data);
        }
      });
    }
  },
  mkReportPagespeed: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = mkCsvRowFromArray(['location', 'score']);

    stream.push(headers);

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      helpers.getPagespeedReport(location, function(err, data){
        if(err){
          console.log(err);
        } else {
          stream.push(data);
        }
      });
    }
  },
  mkReportMeta: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = mkCsvRowFromArray(['location', 'title', 'keywords', 'description']);

    stream.push(headers);

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      helpers.getPageMetadata(location, function(err, data){
        if(err){
          console.log(err);
        } else {
          stream.push(data);
        }
      });
    }
  }

};