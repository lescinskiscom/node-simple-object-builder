const ActionMemoryStorage = require("./storage/memory.storage");

const CONSTANTS = require("./init/constants");

// Load all action modules
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

// Load all helpers
const doesItemMatch = require("./helpers/doesItemMatch.helper");
const removeEmptyValuesFromObject = require("./helpers/removeEmptyValuesFromObject.helper");
const convertActionsToObject = require("./helpers/convertActionsToObjects.helper");
const convertObjectToActions = require("./helpers/convertObjectToActions.helpers");

const { filterActions, processActionFilter, createAction } = require("./helpers/actions.helper");

// Define all action handlers
// You can specify either a function or string to have an alias
const ACTION_HANDLERS = {
	[CONSTANTS.ACTIONS_SET]: initSetAction(),
	[CONSTANTS.ACTIONS_DELETE]: initDeleteAction(),
	[CONSTANTS.ACTIONS_APPEND]: initAppendAction(),
	[CONSTANTS.ACTIONS_REMOVE]: initRemoveAction(),
	[CONSTANTS.ACTIONS_INSERT_AT]: initInsertAtAction(),
	[CONSTANTS.ACTIONS_SET_AT]: initSetAtAction(),
	[CONSTANTS.ACTIONS_INSERT_BEFORE]: initInsertBeforeAction({ doesItemMatch }),
	[CONSTANTS.ACTIONS_INSERT_AFTER]: initInsertAfterAction({ doesItemMatch }),
	[CONSTANTS.ACTIONS_COPY]: initCopyAction(),
	[CONSTANTS.ACTIONS_UPDATE]: initUpdateAction()
};

const initObjectBuilder = function(initActions = []) {
	const actions = ActionMemoryStorage(initActions);

	let ObjectBuilder = {};

	// Switched from automatic generation to manual creation
	// Some actions can be used for different reasons
	// and can be configured during creation
	ObjectBuilder[CONSTANTS.ACTIONS_SET] = createAction(actions, CONSTANTS.ACTIONS_SET);
	ObjectBuilder[CONSTANTS.ACTIONS_APPEND] = createAction(actions, CONSTANTS.ACTIONS_APPEND);
	ObjectBuilder[CONSTANTS.ACTIONS_DELETE] = createAction(actions, CONSTANTS.ACTIONS_DELETE);
	ObjectBuilder[CONSTANTS.ACTIONS_REMOVE] = createAction(actions, CONSTANTS.ACTIONS_REMOVE);
	ObjectBuilder[CONSTANTS.ACTIONS_INSERT_AT] = createAction(actions, CONSTANTS.ACTIONS_INSERT_AT);
	ObjectBuilder[CONSTANTS.ACTIONS_SET_AT] = createAction(actions, CONSTANTS.ACTIONS_SET_AT);
	ObjectBuilder[CONSTANTS.ACTIONS_INSERT_BEFORE] = createAction(actions, CONSTANTS.ACTIONS_INSERT_BEFORE);
	ObjectBuilder[CONSTANTS.ACTIONS_INSERT_AFTER] = createAction(actions, CONSTANTS.ACTIONS_INSERT_AFTER);
	ObjectBuilder[CONSTANTS.ACTIONS_COPY] = createAction(actions, CONSTANTS.ACTIONS_COPY);
	ObjectBuilder[CONSTANTS.ACTIONS_UPDATE] = createAction(actions, CONSTANTS.ACTIONS_UPDATE);

	ObjectBuilder.value = function() {
		let res = actions.get().reduce(function(projection, action) {
			return ACTION_HANDLERS[action.type](projection, action.data);
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
