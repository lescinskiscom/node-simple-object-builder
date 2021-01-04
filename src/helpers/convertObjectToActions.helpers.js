const { buildAction } = require("./actions.helper");
const { ACTIONS_SET } = require("../init/constants");

module.exports = function convertObjectToActions(obj) {
  var res = {};
  function recurse(obj, current) {
    for (var key in obj) {
      var value = obj[key];
      var newKey = (current ? current + '.' + key : key);  // joined key with dot
      if (value && typeof value === 'object' && !(value instanceof Date)) {
        recurse(value, newKey);  // it's a nested object, so do it again
			}
			 else {
        res[newKey] = value;  // it's not an object, so set the property
      }
    }
  }
  recurse(obj);
  return Object.entries(res).reduce(function(actions, [key, value]){
		return actions.concat(buildAction(ACTIONS_SET, key, value));
	}, []);
}