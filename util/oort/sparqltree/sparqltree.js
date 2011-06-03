/*
 *  sparqltree.js
 * 
 * 
 *  Copyright (c) 2006, 2007 Niklas Lindström <lindstream@gmail.com>.
 *  Licensed under the BSD-style license.
 *  http://oort.to/LICENSE.html
 *
 *  ------------------------------------------------
 * 
 *  Sparks - sparqltree.js
 *  Copyright (c) 2011 Gregoire Burel
 * 
 *  This source code is based on sparqltree from the oort poject licensed under the BSD-style license.
 *
 */


steal.plugins("jquery/class").then(function() {
  
  
      $.Class.extend('Sparks.util.oort.SparqlTree');    
      Sparks.util.oort.SparqlTree = new function (self) { var self = this;

	    self.SEP = '__';
	    self.ONE_MARKER = '1_';

	    self.uriKey = '_uri';
	    self.bnodeKey = '_bnode';
	    self.datatypeKey = '_datatype';
	    self.valueKey = '_value';
	    self.langTag = '@';
	    self.skipNull = true;

	    /**
	    * Create an object tree from a SPARQL JSON result.
	    */
	    self.buildTree = function (data, root) {
	      var varModel = self.makeVarTreeModel(data.head.vars);
	      var root = root || {};
	      self.fillNodes(varModel, root, data.results.bindings);
	      
	      if(!root['root']){
		throw "?root must be defined at the top level of the SPARQL query."
	      }
	      
	      var root2 = root.root;
	      
	      return root2;
	    };

	    self.makeVarTreeModel = function (vars) {
	      vars.sort();
	      var varTree = {};
	      for (var i=0; i < vars.length; i++) {
		var varName = vars[i];
		if (startsWith(varName, "_"))
		  continue;
		var currTree = varTree;
		var keys = varName.split(self.SEP);
		for (var j=0; j < keys.length; j++) {
		  var key = keys[j];
		  var useOne = false;
		  if (startsWith(key, self.ONE_MARKER)) {
		    useOne = true;
		    key = key.substring(2, key.length);
		  }
		  if (currTree[key] !== undefined) {
		    currTree = currTree[key].subVarModel;
		  } else {
		    var subTree = {};
		    var modelNode = {useOne: useOne, varName: varName, subVarModel: subTree};
		    currTree[key] = modelNode;
		    currTree = subTree;
		  }
		}
	      }
	      return varTree;
	    };

	    self.fillNodes = function (varModel, parentNode, bindings) {
	      for (var key in varModel) {
		var m = varModel[key];
		var nodes = [];
		var grouped = self.groupBy(bindings, m.varName);
		for (bindingKey in grouped) {
		  if (!bindingKey) {
		      continue;
		  }
		  var group = grouped[bindingKey];
		  var node = self.makeNode(group.keyBinding);
		  nodes.push(node);
		  if (node instanceof Object && hasKeys(m.subVarModel)) {
		    self.fillNodes(m.subVarModel, node, group.groupedBindings);
		  }
		}
		var finalValue = nodes;
		if (m.useOne) {
		  finalValue = self.completeNode(self.toOne(nodes), key, parentNode);
		} else {
		  for (var i=0; i < nodes.length; i++) {
		    nodes[i] = self.completeNode(nodes[i], key, parentNode);
		  }
		}
		if (self.skipNull && finalValue === null)
		  continue;
		parentNode[key] = finalValue;
	      }
	    };

	    self.groupBy = function (items, varName) {
	      var grouped = {};
	      for (var i=0, l=items, ln=l.length; i < ln; i++) {
		var it = l[i];
		var keyBinding = it[varName];
		if (keyBinding === undefined)
		  continue;
		var key = self.makeBindingKey(keyBinding);
		if (grouped[key]) {
		  grouped[key].groupedBindings.push(it);
		} else {
		  grouped[key] = {keyBinding: keyBinding, groupedBindings: [it]};
		}
	      }
	      return grouped;
	    };

	    self.makeBindingKey = function (binding) {
	      return binding.type +":"+ binding.value +":" +
		    binding['xml:lang'] +":"+ binding.datatype;
	    };

	    self.makeNode = function (binding) {
	      var node = {};
	      var value = binding.value;
	      
	      node['value'] = value;
	      node['type'] = binding.type;
	      
	      if (binding.type != 'literal' && binding.type != 'typed-literal'){
		node['id'] = {type: binding.type, value: value};
	      }
	      /*if (binding.type === 'uri') {
		node[self.uriKey] = value;

		
		
	      } else if (binding.type === 'bnode') {
		node[self.bnodeKey] = value;
	      } else if (binding.type === 'literal') {
		var lang = binding['xml:lang'];
		if (lang != null)
		    node[self.langTag + lang] = value;
		else
		    node = value;
	      } else if (binding.type === 'typed-literal') {
		node = self.typeCast(binding.datatype, value);
	      } else {
		throw "TypeError: unknown value type for: " + repr(binding);
	      }*/
	      return node;
	    };

	    self.typeCast = function (datatype, value) {
	      if (datatype === XSD+'boolean') {
		return value == "true"? true : false;
	      } else if (numberTypes[datatype]) {
		return new Number(value);
	      } else {
		var node = {};
		node[self.valueKey] = value;
		node[self.datatypeKey] = datatype;
		return node;
	      }
	    };

	    self.toOne = function (nodes) {
	      if (nodes.length === 0) {
		return null;
	      }
	      var first = nodes[0]
	      if (self.isLangMap(first)) {
		first = {}
		for (var i=0, l=nodes, ln=l.length; i < ln; i++) {
		  var node = l[i];
		  if (!(node instanceof Object)) {
		    node = {};
		    node[self.langTag] = node;
		  }
		  if (node.length === 0) {
		    continue;
		  }
		  for (key in node) {
		    first[key] = node[key];
		    break;
		  }
		}
	      }
	      return first;
	    };

	    self.isLangMap = function (obj) {
	      if (obj instanceof Object)
		for (key in obj)
		  if (startsWith(key, self.langTag))
		    return true;
	      return false;
	    };


	    /**
	      * Override this no customize the final value of a processed node.
	      * Default is to return the node itself;
	      */
	    self.completeNode = function (node, key, parentNode) {
	      return node;
	    };


	    // helpers for result data values

	    self.isLangNode = function (obj) {
	      if (obj instanceof Object)
		for (key in obj)
		  return startsWith(key, self.langTag);
		return false;
	    };

	    self.isDatatypeNode = function (obj) {
	      var datatype = obj[self.datatypeKey];
	      return datatype !== undefined && datatype !== null;
	    };

	    self.isLiteral = function (obj) {
	      return (obj instanceof String) || isDatatypeNode(obj) || isLangNode(obj);
	    };

	    self.isResource = function (obj) {
	      return ! isLiteral(obj);
	    }


	    var XSD = "http://www.w3.org/2001/XMLSchema#";

	    var numberTypes = {};
	    (function () {
	      function addNumberType(name) {
		  numberTypes[XSD + name] = true;
	      }
	      addNumberType('decimal');
	      addNumberType('double');
	      addNumberType('float');
	      addNumberType('int');
	      addNumberType('integer');
	      addNumberType('long');
	      addNumberType('negativeInteger');
	      addNumberType('nonNegativeInteger');
	      addNumberType('nonPositiveInteger');
	      addNumberType('positiveInteger');
	      addNumberType('short');
	      addNumberType('unsignedInt');
	      addNumberType('unsignedLong');
	      addNumberType('unsignedShort');
	    })();


	    function startsWith(str, startStr) {
	      return str.substr(0, startStr.length) === startStr;
	    }

	    function hasKeys(o) {
	      for (k in o) return true;
	      return false;
	    }

	    function repr(o) {
	      var s = "{";
	      for (k in o) { s += k + ": " + o[k] + "; "; }
	      return s + "}";
	    }

	  };
});
