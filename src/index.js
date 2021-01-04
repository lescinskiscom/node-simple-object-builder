const objectPath = require("object-path-immutable");
const ActionMemoryStorage = require("./ActionMemoryStorage");

const initSetAction = require("./actions/set.action");
const initDeleteAction = require("./actions/delete.action");
const initAppendAction = require("./actions/append.action");
const initRemoveAction = require("./actions/remove.action");
const initInsertAtAction = require("./actions/insertAt.action");
const initSetAtAction = require("./actions/setAt.action");
const initInsertBeforeAction = require("./actions/insertBefore.action");
const initInsertAfterAction = require("./actions/insertAfter.action");
const initCopyAction = require("./actions/copy.action");
const initUpdateAction = require("./actions/update.action");

// Define all actions that can be called
const ACTIONS_SET = "set";
const ACTIONS_APPEND = "append";
const ACTIONS_DELETE = "delete";
const ACTIONS_REMOVE = "remove";
const ACTIONS_INSERT_AT = "insertAt";
const ACTIONS_SET_AT = "setAt";
const ACTIONS_INSERT_BEFORE = "insertBefore";
const ACTIONS_INSERT_AFTER = "insertAfter";
const ACTIONS_COPY = "copy";
const ACTIONS_UPDATE = "update";

// Define all action handlers
// You can specify either a function or string to have an alias
const ACTION_HANDLERS = {
	[ACTIONS_SET]: initSetAction(),
	[ACTIONS_DELETE]: initDeleteAction(),
	[ACTIONS_APPEND]: initAppendAction(),
	[ACTIONS_REMOVE]: initRemoveAction(),
	[ACTIONS_INSERT_AT]: initInsertAtAction(),
	[ACTIONS_SET_AT]: initSetAtAction(),
	[ACTIONS_INSERT_BEFORE]: initInsertBeforeAction({ doesItemMatch }),
	[ACTIONS_INSERT_AFTER]: initInsertAfterAction({ doesItemMatch }),
	[ACTIONS_COPY]: initCopyAction(),
	[ACTIONS_UPDATE]: initUpdateAction()
};

// Process handlers so that each action has a corresponding handler
const ACTIONS = Object.entries(ACTION_HANDLERS).reduce(function(map, action) {
	let name = action[0];
	let handler = action[1];
	switch (typeof handler) {
		case "function": {
			return { ...map, [name]: handler };
		}
		case "string": {
			if (!(handler in ACTION_HANDLERS)) {
				throw new Error(`Unknown action handler ${handler}`);
			}
			return { ...map, [name]: ACTION_HANDLERS[handler] };
		}
		default:
			throw new Error(`Invalid action type ${typeof handler} for action ${name}`);
	}
}, {});

function doesItemMatch(item, match) {
	let values = Object.entries(match).map(function(value){
		return { key: value[0], value: value[1] }
	});
	let filteredValues = values.filter(function(value){
		let res = item[value.key];

		if(typeof value.value !== "object") {
			return res === value.value;
		}

		let [operator, comp] = Object.entries(value.value)[0];

		switch(operator) {
			case "gt":
				return +res > +comp;

			case "gte":
				return +res >= +comp;

			case "lt":
				return +res < +comp;

			case "lte":
				return +res <= +comp;

			case "eq":
				return +res == comp;
				
				case "neq":
					return +res != comp;

			case "is":
				return +res == comp;	

			case "not":
				return +res != comp;

			case "in":
				if(!Array.isArray(comp)) {
					throw new Error("Can't apply in operator. Value is not an array!")
				}
				return comp.includes(res);

			case "nin":
				if(!Array.isArray(comp)) {
					throw new Error("Can't apply in operator. Value is not an array!")
				}
				return !comp.includes(res);
				
			default:
				throw new Error(`Unknown operator "${operator}"`);
		}
	});
	return filteredValues.length === values.length;
}

function removeEmptyValuesFromObject(obj) {
	return Object.keys(obj)
		.filter(function(key) {
			return obj[key] !== null;
		})
		.reduce(function(newObj, key) {
		// If key doesn't hold an object, skip it
		if(typeof obj[key] !== "object" || Array.isArray(obj[key])) {
			return {
				...newObj,
				[key]: obj[key]
			};
		} 
		// If it's an object, check if it contains any keys
		if(Object.keys(obj[key]).length > 0) {
			return {
				...newObj,
				[key]: removeEmptyValuesFromObject(obj[key])
			}
		}
		// If there were no keys, nothing will happen
		return newObj;
	}, {});
}

function convertActionsToObject(actions) {
	return Object.entries(actions).reduce(function(obj, [key, value]){
		return objectPath.set(obj, key, value);
	}, {});
}

function convertObjectToActions(obj) {
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
		return actions.concat(createAction(ACTIONS_SET, key, value));
	}, []);
}

function prepareActionFilters(filters, fuzzy=false) {
	return filters.map(function(expr){
		if(!fuzzy) {
			expr = `${expr[0] === "^" ? "" : "^"}${expr}${expr.slice(-1) === "$" ? "" : "$"}`;
		}
		return new RegExp(expr);
	});
}

function applyActionFilters(actions, filters, inverse=false) {
	return actions.filter(function(action) {
		return filters.filter(function(key){
			if(!inverse) {
				return !action.data.key.match(key);
			}
			return action.data.key.match(key);
		}).length === 0;
	});
}

function filterActions(actions, include=[], exclude=[], fuzzy=false) {
	let filteredActions = actions;

	if(include.length > 0) {
		include = prepareActionFilters(include, fuzzy);
		filteredActions = applyActionFilters(filteredActions, include);
	}
	
	if(exclude.length > 0) {
		exclude = prepareActionFilters(exclude, fuzzy);
		filteredActions = applyActionFilters(filteredActions, exclude, true);
	}

	return filteredActions;
}

function processActionFilter(filter) {
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

function createAction(type, key, value) {
	if(Array.isArray(value)) {
		return { type, data: { key, value } };
	}
	return { type, data: { key, value: [value] } };
}

const initObjectBuilder = function(initActions = []) {
	const actions = ActionMemoryStorage(initActions);

	let ObjectBuilder = {};

	Object.entries(ACTIONS).forEach(function(entry) {
		ObjectBuilder[entry[0]] = function(key, ...value) {
			actions.add(createAction(entry[0], key, value));
			return this;
		};
	});

	ObjectBuilder.value = function() {
		let res = actions.get().reduce(function(projection, action) {
			return ACTIONS[action.type](projection, action.data);
		}, {});
		res = convertActionsToObject(res);
		res = removeEmptyValuesFromObject(res);
		return res;
	};

	// Clone should be able to clone only the specified keys
	// I should be able to include and exclude keys
	ObjectBuilder.clone = function(...value) {

		// If there are no actions, just clone as it is
		if(value.length === 0) {
			return initObjectBuilder([...actions.get()]);
		}
		// If there are more than 2 elements, then assume it's include-only
		if(value.length > 1) {
			let filteredActions = filterActions(actions.get(), value);
			return initObjectBuilder([...filteredActions]);
		}
		// if there is one item, then check if it is a string
		// if it is a string then treat it inclusively
		if(value.length === 1 && typeof value[0] === "string") {
			let filteredActions = filterActions(actions.get(), [value[0]]);
			return initObjectBuilder([...filteredActions]);
		}
		// if it's an array, treat it the same as when there are 2 or more items
		if(value.length === 1 && Array.isArray(value[0])) {
			let filteredActions = filterActions(actions.get(), value[0]);
			return initObjectBuilder([...filteredActions]);
		}
		// if first value is an object and it contains include and/or exclude,
		// first include process include part and then the exclude part
		if(typeof value[0] === "object" && value[0].include || value[0].exclude) {
			let include = processActionFilter(value[0].include);
			let exclude = processActionFilter(value[0].exclude);
			let fuzzy = value[0].fuzzy ? value[0].fuzzy : false;

			let filteredActions = filterActions(actions.get(), include, exclude, fuzzy);
			return initObjectBuilder([...filteredActions]);
		}
		// Shouldn't happen
		throw new Error(`Unknown action filtering condition`);
	};

	// Clears all actions
	ObjectBuilder.clear = function() {
		actions.clear();
		return this;
	};

	// Initializes builder based on the passed object
	ObjectBuilder.init = function(obj=null) {
		if(!obj) {
			throw new Error(`Object not specified to be initialized`);
		}
		actions.add(convertObjectToActions(obj));
		return this;
	}

	// This is now a thenable class
	// It means that the query builder can be used to construct the object,
	// and when done constructing, you can use .then() or await to call this function
	ObjectBuilder.then = function(resolve, _reject) {
		resolve(ObjectBuilder.value());
	};

	return ObjectBuilder;
};

module.exports = function(initActions = []) {
	return initObjectBuilder(initActions);
};
