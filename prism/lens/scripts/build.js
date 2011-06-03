//steal/js sparks/prism/lens/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('sparks/prism/lens/scripts/build.html',{to: 'sparks/prism/lens'});
});
