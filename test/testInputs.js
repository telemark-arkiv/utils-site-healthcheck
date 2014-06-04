'use strict';

var assert = require('assert')
  , generator = require('../generator');
  ;

describe('Generator - inputs', function(){

  it('Should throw if opts.url is not specified', function(done){

    var opts = {filename:'json'};

    generator(opts, function(err, data){
      assert.throws(function(){
          if(err) throw err;
        }, function(err){
          if((err instanceof Error) && /Missing required param: url/.test(err)){
            return true
          }
        },
        "Unexpected error"
      );
      done();
    });

  });


  it('Should throw if opts.url contains invalid url', function(done){

    var opts = {format:'json', url:'pysje'};

    generator(opts, function(err, data){
      assert.throws(function(){
          if(err) throw err;
        }, function(err){
          if((err instanceof Error) && /Invalid url/.test(err)){
            return true
          }
        },
        "Unexpected error"
      );
      done();
    });

  });

  it('Should throw if opts.report is not specified', function(done){

    var opts = {url:'http://www.npmjs.org'};

    generator(opts, function(err, data){
      assert.throws(function(){
          if(err) throw err;
        }, function(err){
          if((err instanceof Error) && /Missing required param: report/.test(err)){
            return true
          }
        },
        "Unexpected error"
      );
      done();
    });

  });

  it('Should throw if opts.report is not valid type', function(done){

    var opts = {url:'http://www.npmjs.org', report:'snooker'};

    generator(opts, function(err, data){
      assert.throws(function(){
          if(err) throw err;
        }, function(err){
          if((err instanceof Error) && /Invalid report type/.test(err)){
            return true
          }
        },
        "Unexpected error"
      );
      done();
    });

  });

  it('Should throw if opts.filename is not supplied', function(done){

    var opts = {url:'http://www.npmjs.org', report:'Html'};

    generator(opts, function(err, data){
      assert.throws(function(){
          if(err) throw err;
        }, function(err){
          if((err instanceof Error) && /Missing required param: filename/.test(err)){
            return true
          }
        },
        "Unexpected error"
      );
      done();
    });

  });

});