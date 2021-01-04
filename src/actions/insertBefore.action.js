module.exports = function({ doesItemMatch }) {
	return function(projection, data) {
		if(!data.key) {
			throw new Error(`Can't insert before item in array! No key specified.`);
		}

		if(!(data.key in projection)) {
			throw new Error(`Can't insert before item in array ${data.key}! Array doesn't exist`);
		}

		if (!Array.isArray(projection[data.key])) {
			throw new Error(`Can't insert before item in array ${data.key}! It's not an array`);
		}
		
		if(data.value.length < 2) {
			throw new Error(`Can't insert before item in array ${data.key}! You need to specify an item and at least one value to be inserted before the item!`);
		}

		let index = -1;

		if(typeof data.value[0] === "object") {
			index = projection[data.key].findIndex(function(item){
				return doesItemMatch(item, data.value[0]);
			});
		} else {
			index = projection[data.key].indexOf(data.value[0]);
		}

		if(index < 0) {
			throw new Error(`Can't insert before item in array ${data.key}! Item is not found!`);
		}

		projection[data.key] = [...projection[data.key].slice(0,index), ...data.value.slice(1), ...projection[data.key].slice(index)];

		return projection;
	}
}