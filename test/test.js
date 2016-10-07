var Logger = require('../index.js').setLevels(
	{'all' : 'debug'}
);

var log = Logger.getLogger('testClass');
// This should work since all loggers default to info
log.info("This is an info");
// Though we set level, the logger wasn't registered at the time, so this fails. Which is wrong.
log.debug("This is a debug");