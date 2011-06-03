//steal/js sparks/prism/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('sparks/prism/scripts/build.html',{to: 'sparks/prism'});
});
