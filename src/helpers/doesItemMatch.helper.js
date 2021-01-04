module.exports = function doesItemMatch(item, match) {
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