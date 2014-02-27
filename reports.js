/**
 * Created by geir on 26/02/14.
 */

var
  helpers = require('./helpers');

module.exports = {

  mkReportFresh: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = ['location', 'last_modified'];

    stream.push(JSON.stringify(headers));

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i];

      helpers.getPageDaysSinceLastUpdate(page, function(err, data){
        if(err){
          console.log(err);
        } else {
          stream.push(JSON.stringify(data));
        }
      });
    }
  },
  mkReportLinks: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = ['location', 'link'];

    stream.push(JSON.stringify(headers));

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
              link = data.links[i];

            stream.push(JSON.stringify([data.url, link]));
          }
        }
      });

    }
  },
  mkReportDeadlinks: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = ['location', 'link', 'status_code'];

    stream.push(JSON.stringify(headers));

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
      headers = ['location', 'status_code'];

    stream.push(JSON.stringify(headers));

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      helpers.checkPageStatus(location, function(err, data){
        if(err){
          console.log(err);
        } else {
          stream.push(JSON.stringify([data.url, data.statusCode]))
        }
      })
    }
  },
  mkReportHtml: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = ['location', 'status'];

    stream.push(JSON.stringify(headers));

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      helpers.validateThisPageHtml(location, function(err, data){
        if(err){
          console.log(err);
        } else {
          if(data.messages.length > 0){
            stream.push(JSON.stringify([data.url, "Errors"]));
          } else {
            stream.push(JSON.stringify([data.url, "Valid"]));
          }
        }
      });
    }
  },
  mkReportWcag: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = ['location', 'errors'];

    stream.push(JSON.stringify(headers));

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      helpers.validateThisPageWcag(location, function(err, data){
        if(err){
          console.log(err);
        } else {
          if (data.result){
            stream.push(JSON.stringify([data.url, data.result.resultset.summary[0].NumOfErrors[0]]));
          } else {
            console.log('Something is wrong: ' + data);
          }
        }
      });
    }
  },
  mkReportPagespeed: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = ['location', 'score'];

    stream.push(JSON.stringify(headers));

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      helpers.getPagespeedReport(location, function(err, data){
        if(err){
          console.log(err);
        } else {
          if (data.result){
            stream.push(JSON.stringify([data.url, data.result.score]));
          } else {
            console.log('Something is wrong: ' + data);
          }
        }
      });
    }
  },
  mkReportMeta: function(pages, stream){
    var
      pagesLength = pages.length,
      headers = ['location', 'title', 'keywords', 'description'];

    stream.push(JSON.stringify(headers));

    for(var i=0;i < pagesLength; i++){
      var
        page = pages[i],
        location = page.loc[0];

      helpers.getPageMetadata(location, function(err, data){
        if(err){
          console.log(err);
        } else {
          if (data.url){
            stream.push(JSON.stringify([data.url, data.title, data.keywords, data.description]));
          } else {
            console.log('Something is wrong: ' + data);
          }
        }

      });
    }
  }

};