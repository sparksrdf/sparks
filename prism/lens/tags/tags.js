/*
 *  Sparks - tags.js
 *  Copyright (c) 2011 Gregoire Burel
 * 
 *  Licensed under the MIT license.
 *  https://github.com/evhart/sparks/LICENSE
 */
steal.plugins('jquery/dom/form_params','sparks/prism/lens','jquery/view/ejs').then(function($){
      
      Sparks.prism.Lens.extend('Sparks.prism.lens.Tags',{
	query: "?root <http://commontag.org/ns#tagged> [ <http://commontag.org/ns#label> ?root__label ]"
      },{
	
	init: function(el,options){
	  this._super(el,options);
	  
	  var that = this;
	  this.filter({query: options.query || Sparks.prism.lens.Tags.query}).done(function(tags){
	    that.list(tags);
	  });
	},
	//Result of a filter action...
	filtered: function(prism, objs){
	  //this.list(objs); //Togle for synchronising the tags
	},
	
	//Filter action...
	filter: function(options){
	    
	     if(options.tags && options.tags.labels){

		//Generate query:
		var query = "?root <http://commontag.org/ns#tagged> [ <http://commontag.org/ns#label> ?root__label ]";
		if(options.tags.labels.length >= 1){
		  
		    var filter = [];
		    for(var i in options.tags.labels){
			filter.push('?root__label = "'+options.tags.labels[i].trim()+'"');
		    }
		    
		    query = query + " FILTER( "+filter.join(" || ")+" )";
		}
	     
		this.prism.filter(this,query);
	    }
	    
	    return this._super(options);
	},
	
	//Display results...
	list: function(tags){

	    //Create flat labels:
	    var flatTags = {};
	    for(var i = 0; i < tags.length ; i++){
	      for(var j = 0; j < tags[i].label.length ; j++){
		  if(typeof flatTags[tags[i].label[j].value] !== 'undefined'){
		      flatTags[tags[i].label[j].value] = flatTags[tags[i].label[j].value] + 1;
		  }else{
		      flatTags[tags[i].label[j].value] = 1;
		  }
	      }
	    }
	  this.element.html('//sparks/prism/lens/tags/views/list', {flatTags: flatTags});
	},
	
	'ul > li click': function( el, ev){
		
		// /!\ li must have the filtered class before init
		var filteredSizePrev = el.parent().find('.filtered').length;
		el.toggleClass('filtered');			
	
		var listSize = el.parent().children().length;
		var filteredSizeNew = el.parent().find('.filtered').length;
		
		
		//Hide tag:
		if( filteredSizePrev == 1 && filteredSizeNew == 0 ){
			
			el.css('opacity','1').toggleClass('filtered',true);
			el.siblings().css('opacity','1').toggleClass('filtered');
			
		}else{
			if(filteredSizeNew == listSize - 1 && filteredSizePrev == listSize ){
				el.toggleClass('filtered',true);
				el.siblings().css('opacity','0.5').toggleClass('filtered');
			}else{
				if(el.css('opacity') != 0.5){
					el.css('opacity','0.5');
				}else{
					el.css('opacity','1');
				}		
			}
		}

		
		//Perform the focus:
		//We just send the visible tags to the model so it can perform the filtering:
		// - focus() -> No filtering
		// - focus([]) -> Nothing selected
		// - focus( ['a','b']) -> filter on A and B.
		var selection = [];
		el.parent().find('.filtered').each(function(){
			selection.push($(this).find('.sparks.prism.lens.tags.item.label').text());
		});
		
		if(selection.length == listSize){
			selection = [];
		}
		
		//After the Success, the controller will be notified of the update via the filter notification...
		this.filter({tags: {labels: selection}});		
	}
	
      });

});
