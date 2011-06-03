/*
 *  Sparks - list.js
 *  Copyright (c) 2011 Gregoire Burel
 * 
 *  Licensed under the MIT license.
 *  https://github.com/evhart/sparks/LICENSE
 */
steal.plugins('jquery/dom/form_params','sparks/prism/lens','jquery/view/ejs').then(function($){
      
      Sparks.prism.Lens.extend('Sparks.prism.lens.List',{
	query: "?root <http://purl.org/dc/terms/title> ?root__1_title . ?root <http://www.w3.org/2004/02/skos/core#description> ?root__1_topic"
      },{
	
	init: function(el,options){
	  this._super(el,options);
	  
	  var that = this;
	  this.filter({query: options.query || Sparks.prism.lens.List.query}).done(function(list){
	    that.list(list);
	  });
	},
	//Result of a filter action...
	filtered: function(prism, objs){
	  this.list(objs);
	},
	
	
	//Display results...
	list: function(list){
	  this.element.html('//sparks/prism/lens/list/views/list', {list: list});
	}
	
      });

});
