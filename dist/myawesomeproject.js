(function webpackUniversalModuleDefinition(root) {
	return function webpackUniversalModuleDefinitionWrapBootstrap(fn) {
		return function webpackUniversalModuleDefinitionBootstrap(modules) {
			if(typeof exports === 'object' && typeof module === 'object')
				module.exports = fn(modules);
			else if(typeof define === 'function' && define.amd)
				define(function() { return fn(modules); });
			else if(typeof exports === 'object')
				exports["MyAwesomeProject"] = fn(modules);
			else
				root["MyAwesomeProject"] = fn(modules);
		}
	}
})(this)
/******/ (function(modules) { // webpackBootstrap
/******/ 	
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/ 	
/******/ 	// The require function
/******/ 	function require(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/ 		
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/ 		
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, require);
/******/ 		
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 		
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// The bundle contains no chunks. A empty chunk loading function.
/******/ 	require.e = function requireEnsure(_, callback) {
/******/ 		callback.call(null, this);
/******/ 	};
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	require.modules = modules;
/******/ 	
/******/ 	// expose the module cache
/******/ 	require.cache = installedModules;
/******/ 	
/******/ 	// __webpack_public_path__
/******/ 	require.p = "";
/******/ 	
/******/ 	
/******/ 	// Load entry module and return exports
/******/ 	return require(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, require) {

	var SomeApp;

	SomeApp = (function() {
	  function SomeApp() {
	    return;
	  }

	  return SomeApp;

	})();

	module.exports = SomeApp;


/***/ }
/******/ ])