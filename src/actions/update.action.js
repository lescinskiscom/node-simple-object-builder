module.exports = function() {
	return function(projection, data) {
		if(!data.key) {
			throw new Error(`Can't update! No key specified.`);
		}
		
		if(data.value.length === 0) {
			throw new Error(`Can't update ${data.key}! You need to specify a value or a function!`);
		}
			
		let params = {};
		
		if(data.value.length > 1 && typeof data.value[1] === "object") {
			params = data.value[1];
		}
		
		let fuzzy = "fuzzy" in params ? params.fuzzy : true;
		let exact = "exact" in params ? params.exact : false;

		let keys = [data.key];
		
		if(!exact || fuzzy) {
			let pattern = new RegExp(data.key);
			keys = Object.keys(projection).filter(function(key){
				return key.match(pattern);
			});
		}

		let value = data.value[0];

		if(typeof value !== "function") {
			value = function() {
				return data.value[0];
			}
		}

		return keys.reduce(function(res, key) {
			res[key] = value(res[key], key, projection);
			return res;
		}, projection);
	}
}