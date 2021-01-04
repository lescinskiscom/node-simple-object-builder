exports.prepareActionFilters = function (filters, fuzzy=false) {
	return filters.map(function(expr){
		if(!fuzzy) {
			expr = `${expr[0] === "^" ? "" : "^"}${expr}${expr.slice(-1) === "$" ? "" : "$"}`;
		}
		return new RegExp(expr);
	});
}

exports.applyActionFilters = function (actions, filters, inverse=false) {
	return actions.filter(function(action) {
		return filters.filter(function(key){
			if(!inverse) {
				return !action.data.key.match(key);
			}
			return action.data.key.match(key);
		}).length === 0;
	});
}

exports.filterActions = function(actions, include=[], exclude=[], fuzzy=false) {
	let filteredActions = actions;

	if(include.length > 0) {
		include = exports.prepareActionFilters(include, fuzzy);
		filteredActions = exports.applyActionFilters(filteredActions, include);
	}
	
	if(exclude.length > 0) {
		exclude = exports.prepareActionFilters(exclude, fuzzy);
		filteredActions = exports.applyActionFilters(filteredActions, exclude, true);
	}

	return filteredActions;
}

exports.processActionFilter = function(filter) {
	if(!filter) {
		return [];
	}
	if(typeof filter === "string") {
		return [filter];
	}
	if(Array.isArray(filter)) {
		return filter;
	}
	return [filter.toString()];
}

exports.buildAction = function(type, key, value) {
	if(Array.isArray(value)) {
		return { type, data: { key, value } };
	}
	return { type, data: { key, value: [value] } };
}