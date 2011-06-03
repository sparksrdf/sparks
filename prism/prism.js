/*
 *  Sparks - prism.js
 *  Copyright (c) 2011 Gregoire Burel
 * 
 *  Licensed under the MIT license.
 *  https://github.com/evhart/sparks/LICENSE
 */

steal.plugins('jquery/class','sparks/prism/lens','sparks/prism/lens/sparqlmodel','sparks/prism/lens/search','sparks/prism/lens/list','sparks/prism/lens/tags').then(function($){

  /*  
 * @class Sparks.Prism 
 * @parent prism 
 * @constructor
 * Creates a new prism enpoint.
 * @param {String} endpoint The SPARQL enpoint.
 * @param {String} query The SPARQL simplified filter query.
 */
  $.Class.extend('Sparks.Prism',
	{
	},
	{
	  init: function(endpoint,query){
	    this.endpoint = endpoint;
	    this.query = query || ""; // Filter Query
	    
	    this.lenses = []; //Execution order
	    this.queries = {}; 
	  },
	  
	  /** Register a filter if it is not registerd and apply the query **/
	  /** Returns a defered**/
	  filter: function(lens, query){
	      var defer = $.Deferred(); 

	      if($.inArray(lens.id, this.lenses) == -1){
		this.lenses.push(lens.id);
	      }
	      
	      this.queries[lens.id] = {query: query, lens: lens};
	    
	      //Create query and execute it:
	      var fullquery = "";
	      for(var i in this.lenses){
		if(this.queries[this.lenses[i]].query.trim() !== ""){
		    fullquery = fullquery + this.queries[this.lenses[i]].query + " . ";
		}
	      }
	      
	      var that = this;
	      this.select(fullquery).done(function(ret){
		  var models = Sparks.prism.lens.SparqlModel.map(ret);
		  
		  if(!models.length){
		    if(models.length > 0){
		      models = [models];
		    }else{
		      models = [];
		    }
		  }
		  
		  //FIXME implement sandboxing (import code from wki codebase)
		  //Distribute query results:
		      defer.resolve(models);
		      for(var i in that.lenses){
			//do not return for self (avoiding loops...):
			if(that.lenses[i] !== lens.id){
			  that.queries[that.lenses[i]].lens.filtered(that,models);
			}
		      }
		       
	      });	      
	      
	      return defer.promise();
	  },
	  
	  /** Return a defered object*/
	  /** Create a sparql select query on the filter **/
	  // TODO Queries on the filtered data without registering a filter
	  select: function(query){
	    
	       query = this.query+" . "+query;
	    
	       if(query.toLowerCase().indexOf("select") == -1){
		 query = "SELECT * WHERE { "+query+" }";
	       }
	       //query += " LIMIT 100";
	    
	       var ret = $.Deferred();
	       var defer = $.ajax({
		 url: this.endpoint,
		 //accepts: "application/javascript",
		 context: {prism: this, defered: ret},
		 dataType: "jsonp",
		 data: {
			//format: "application/sparql-results+json",  
			query: query,
			output: "json",
			accept: "application/sparql-results+json"
		   } 
	       });
	       
	       /** Everything went well **/
	       defer.done(function(sparql){
		    sparql['prism'] = this.prism; 
		    this.defered.resolve(sparql);
	        });

	       	/** not so well **/
	       defer.fail(function(sparql){
		  this.defered.reject();
	       });
	       
	       return ret.promise();
	  }
	});
});