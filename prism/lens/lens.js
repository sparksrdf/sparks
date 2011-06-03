/*
 *  Sparks - lens.js
 *  Copyright (c) 2011 Gregoire Burel
 * 
 *  Licensed under the MIT license.
 *  https://github.com/evhart/sparks/LICENSE
 */
steal.plugins('jquery/class','jquery/controller').then(function($){
      
      $.Controller.extend('Sparks.prism.Lens',{
	query: ""
      },{
	init: function(el,options){
	  
	  //http://note19.com/2007/05/27/javascript-guid-generator/
	  var guid =function() {
		var S4 = function() {
			 //return (((1+Math.random())*0x10000)|0).toString(16).substring(1); //Pluginify does not like it :(
			 return (((1+Math.random())*10000));
		 };
		 return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	  };
	  
	  this.id = guid();
	  this.prism = options.prism;
	  
	  if(typeof options.query !== 'undefined'){
	    this.query = options.query;
	  }else{
	     this.query = Sparks.prism.Lens.query;
	  }

	  this.filter({query: this.query});
	  
	},
	
	//Filter action...
	filter: function(options){
	    if(typeof options === "string"){
	      return this.prism.filter(this, options);
	    }
	    if(options.query){
	      return this.prism.filter(this, options.query);
	    }
	},
	
	//Result of a filter action...
	filtered: function(prism, objs){
	}
	
      });
  
  
      //Helper function for creating lenses from their name: 
      /*$.Controller.extend('Sparks.prism.Lens',{
      },{
      });*/
});