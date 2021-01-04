module.exports = function removeEmptyValuesFromObject(obj) {
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