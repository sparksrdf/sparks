/*
 *  Sparks - search.js
 *  Copyright (c) 2011 Gregoire Burel
 * 
 *  Licensed under the MIT license.
 *  https://github.com/evhart/sparks/LICENSE
 */
steal.plugins('jquery/dom/form_params','sparks/prism/lens').then(function($){
      
      Sparks.prism.Lens.extend('Sparks.prism.lens.Search',{
      },{
	
	//Filter action...
	filter: function(options){
	    
	     if(options.search && options.search.query){

		//Generate query:
		var query = "";
		if(options.search.query !== ""){
		    query =  "?root <http://purl.org/net/curio/ns#has_itemReview> ?root__1_container. [ <http://rdfs.org/sioc/types#content> ?root__message] <http://rdfs.org/sioc/types#hasContainer> ?root__1_container. ?root__message bif:contains '"+options.search.query+"' ";
		}
	     
		this.prism.filter(this,query);
	    }
	    
	    return this._super(options);
	},
	
	//Result of a filter action...
	filtered: function(prism, objs){
	},
	
	
	//The search lense can be triggered by a form
	'form submit': function( el, ev ){
		ev.preventDefault();
		var params = $(this.element).formParams();
	
		if(typeof params.search.query === 'undefined'){
			params.search.query = "";
		}

		if(params.search.query.match(/^\s*$/)){
			params.search.query = "";
		}else{
			params.search.query = params.search.query.replace(/"|'/g,'').replace(/\b(?!and|or\b)(\w+)(\s+)\b(?!and|or\b)(\w+)/ig,"$1 or $3");
		}
		
		this.filter(params);			
	}
	
      });

});