var logger = exports;
  // Set default level
  logger.log = function(level, message) {
    console.log('Logger set level: ' + logger.debugLevel);
    console.log('Logger level: ' + level + ', message: ' + message);
    var levels = ['error', 'warn', 'info', 'debug'];
    if (levels.indexOf(level) <= levels.indexOf(logger.debugLevel) ) {
      if (typeof message !== 'string') {
        message = JSON.stringify(message);
      };
      // Write message
      console.log(level.toUpperCase() + ': ' + message);
    };
  }