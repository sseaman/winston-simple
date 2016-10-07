/**
 * @author Sloan Seaman 
 * @copyright 2016 and on
 * @version .1
 * @license https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 */

/** @private */
var winston = require('winston');
var _logLevels = {};

/**
 * Providers a centralized logger mechanism with per object definable logging levels using 
 * {@link https://github.com/winstonjs/winston|winston}
 *
 * The levels can be set by providing a map where the keys are the objects and the values
 * the log levels.  If no level is provided, it defaults to info
 *
 * If the map contains key 'all' then every log will be set to the level defined with the 'all' key
 *
 * If the level is set to 'none', logging is disabled
 *
 * @example
 * var Logger = require('winston-simple');
 * var log = Logger.getLogger('MyObject'); // use to actually do the logging
 *
 * Then in your code:
 * // everything set to debug
 * Logger.setLevels({'all':'debug'}); 
 *
 * // turn off all logging
 * Logger.setLevels({'all':'none'});  
 *
 * // turns on debugging for MyObject, FilterManager set to info,  all others will be turned off
 * Logger.getLevels({'MyObject' : 'debug', 'FilterManager' : 'info'}) 
 *
 * @constructor
 * @see {@link https://github.com/winstonjs/winston|winston}
 */
module.exports = {

	/**
	 * Allows for runtime setting of log levels.  Can be called at anytime to adjust log levels.
	 * 
	 * The passing in map specifies the logging level of the object to have logging enabled.
	 * @example
	 * {
	 * 	"MyObject" : "debug",
	 * 	"SomeOtherObject" : "info",
	 * 	"YAObject" : "none"
	 * }
	 *
	 * You can also pass in a object name (key) of "all" to apply a certain level to all your objects.
	 * @example
	 * {
	 * 	"all" : "debug",
	 * 	"SomeOtherObject" : "info"
	 * }
	 * This will set every object to "debug" except SomeOtherObject, which will be set to "info".  
	 * 
	 * @function
	 * @param {Map} logLevels The logging levels for any object
	 */
	setLevels : function(logLevels) {
		this._logLevels = this._merge(logLevels);

		// go through all the loggers
		for (var key in winston.loggers.loggers)  {
			var logger = winston.loggers.loggers[key];

			if (this._logLevels['all']) { 
				if (this._logLevels['all'] != 'none') { // turning on everything
					logger.transports.console.level = this._logLevels['all'];
				}
				else { // all = none so remove everything
					logger.remove(winston.transports.Console)
				}
			}
			else {
				// individual log levels were set
				var level = this._logLevels[key];
				if (level != 'none') {
					logger.transports.console.level = level;
				}
				else { // level = none, so turn it off
					logger.remove(winston.transports.Console)
				}
			}
		}
	},	

	/**
	 * Get a {@link https://github.com/winstonjs/winston|winston} logging instance that is configured
	 * based upon the set logging levels.
	 *
	 * If no logging levels have been set it will default to level 'info'
	 *
	 * Most common usage example:
	 * @example
	 * var log = require('winston-simple').getLogger('ClassNameToUseInLog');
	 * log.debug("some message");
	 *
	 * Results in a log entry of:
	 * @example
	 * 2016-10-05T03:21:20.564Z - debug: [ClassNameToUseInLog] some message
	 * 
	 * @function
	 * @param  {String} className The name of the javascript file (class) to create a logger for
	 * @return {Winston.Logger} A usable and configured instance of a Winston logger.
	 */
	getLogger : function(className) {
		// figure out the level to use
		var level;
		if (winston.loggers.loggers[className]) {
			level = winston.loggers.loggers[className].transports.console.level;
		}
		if (this._logLevels) {
			if (this._logLevels[className]) {
				level = this._logLevels[className];
			}
			else if (this._logLevels['all']) {
				level = this._logLevels['all'];
			}
		}

		// we figured it out
		if (level && level != 'none') {
			winston.loggers.add(className, {
				console : {
				    json : false,
				    timestamp : true,
				    label: className,
				    level : (winston.loggers.loggers[className]) //already set
						? winston.loggers.loggers[className].transports.console.level 
						: level 
				}
			});
		}
		else {
			winston.loggers.add(className).clear();
		}

		return winston.loggers.get(className);
	},

	/**
	 * Returns the internal instance of Winston for use by the developer to manipulate as they so choose
	 *
	 * @function
	 * @return {Winston} The internal instance of Winston
	 */
	getWinston : function() {
		return winston;
	},

	/**
	 * Merges two objects
	 * 
	 * @function
	 * @private
	 * @param {Map} obj1 The first object
	 * @param {Map} obj2 The second object
	 * @returns A new object based on obj1 and obj2
	 */
	_merge : function (obj1,obj2) {
	    var obj3 = {};
	    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
	    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
	    return obj3;
	}

}