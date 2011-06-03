/*
 *  Sparks - sparqlmodel.js
 *  Copyright (c) 2011 Gregoire Burel
 * 
 *  Licensed under the MIT license.
 *  https://github.com/evhart/sparks/LICENSE
 */
steal.plugins('jquery/model','sparks/util/oort/sparqltree').then(function($){

    //By default, the model will map the query automatically
    $.Model.extend('Sparks.prism.lens.SparqlModel',{
    
	//Focus given the  parameters:
	//Retrun a promise with the result of the focus operation (i.e a list of model instances)
      	focus: function(prism,query){
	  throw "Focus Method is not supported";
	},
	
	
	//Generate a model object from the result of a sparql query...
	//called in init, do not call directly.
	map: function(results){
	  
	  //binding names...
	  //- the identifier should be caled 'id'...
	  var vars = results.head.vars;
	  
	  //Generate tree...
	  var tree = Sparks.util.oort.SparqlTree.buildTree(results);
	  var ret = [];
	  
	  for(var i in tree){  
	    var t = tree[i];
	    t['prism'] = results.prism;
	    ret.push(t);    
	  }
	  
	  if(ret.length == 1){
	    return ret[0];
	  }
	  return ret;
	}
	
    },{
	init: function(result){
	  if(result.header){
	    Sparks.prism.lens.SparqlModel.map(result);
	    return;
	  }
	    return result;
	}
    });
});