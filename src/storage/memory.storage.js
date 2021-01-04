const MemoryStorage = function(actions=[]) {
	this.actions = actions.slice(0);
}

MemoryStorage.prototype.get = function() {
	return this.actions.slice(0);
}

MemoryStorage.prototype.add = function(data) {
	if(Array.isArray(data)) {
		this.actions = this.actions.concat(data);
		return;
	}
	this.actions = this.actions.concat([data]);
}

MemoryStorage.prototype.clear = function() {
	this.actions = [];
}

module.exports = function(actions=[]) {
	return new MemoryStorage(actions);
}