//js sparks/prism/scripts/doc.js

load('steal/rhino/steal.js');
steal.plugins("documentjs").then(function(){
	DocumentJS('sparks/prism/prism.html');
});