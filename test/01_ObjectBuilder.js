const { expect } = require("chai");
const ObjectBuilder = require("../src/ObjectBuilder");

describe("ObjectBuilder", function() {
	describe("Initialization", function() {
		let objectBuilder = null;

		before(function() {
			objectBuilder = new ObjectBuilder();
		});

		it("should have a function called value", function() {
			expect(typeof objectBuilder.value).to.eq("function");
		});

		it("should have a function called clone", function() {
			expect(typeof objectBuilder.clone).to.eq("function");
		});

		it("should have a function called then", function() {
			expect(typeof objectBuilder.then).to.eq("function");
		});

		it("should have a function called clear", function() {
			expect(typeof objectBuilder.clear).to.eq("function");
		});

		it("should have a function called set", function() {
			expect(typeof objectBuilder.set).to.eq("function");
		});

		it("should have a function called append", function() {
			expect(typeof objectBuilder.append).to.eq("function");
		});

		it("should have a function called delete", function() {
			expect(typeof objectBuilder.delete).to.eq("function");
		});

		it("should have a function called remove", function() {
			expect(typeof objectBuilder.remove).to.eq("function");
		});
	});

	describe("Actions", function() {
		const key = "test";
		const nestedKey = "nested";
		let objectBuilder = null;

		beforeEach(function() {
			objectBuilder = new ObjectBuilder();
		});

		it(`should contain a key ${key}`, function() {
			let res = objectBuilder.set(key, 1234).value();
			console.log(res);
			expect(res).to.have.key(key);
		});

		it(`should contain a key ${key} with generaated value`, function() {
			let number = Date.now();
			let res = objectBuilder.set(key, number).value();
			expect(res[key]).to.eq(number);
		});

		it(`should delete key ${key}`, function() {
			let res = objectBuilder
				.set(key, 1234)
				.delete(key)
				.value();
			expect(res).to.not.have.key(key);
		});

		it(`should create an array with 1 number`, function() {
			let number = Date.now();
			let res = objectBuilder.append(key, number).value();
			expect(res[key]).to.have.ordered.members([number]);
		});

		it(`should create an array with 2 numbers`, function() {
			let number = Date.now();
			let number2 = Date.now();
			let res = objectBuilder
				.append(key, number)
				.append(key, number2)
				.value();
			expect(res[key]).to.have.ordered.members([number, number2]);
		});

		it(`should create a concatenated array with 3 numbers`, function() {
			let number = Date.now();
			let number2 = Date.now();
			let number3 = Date.now();
			let res = objectBuilder
				.append(key, number)
				.append(key, [number2, number3])
				.value();
			expect(res[key]).to.have.ordered.members([number, number2, number3]);
		});

		it(`should create a concatenated array with 4 numbers`, function() {
			let number = Date.now();
			let number2 = Date.now();
			let number3 = Date.now();
			let number4 = Date.now();
			let res = objectBuilder
				.append(key, number)
				.append(key, number2, number3, number4)
				.value();
			expect(res[key]).to.have.ordered.members([number, number2, number3, number4]);
		});

		it(`should delete an item from array`, function() {
			let res = objectBuilder
				.append(key, 1, 2, 3)
				.remove(key,2)
				.value();
			expect(res[key]).to.have.ordered.members([1, 3]);
		});

		it(`should contain a nested key ${nestedKey}.${key}`, function() {
			let res = objectBuilder.set(nestedKey + "." + key, 1234).value();
			expect(res[nestedKey]).to.have.key(key);
		});

		it(`should clear all actions`, function() {
			let res = objectBuilder.set(key,1234).clear().value();
			expect(res).to.deep.eq({});
		});

		it(`should delete only second level value`, function() {
			let res = objectBuilder
				.set(nestedKey + "." + key, 5678)
				.set(key, 1234)
				.delete(nestedKey + "." + key)
				.value();
			expect(res).to.deep.eq({ [key]: 1234 });
		});

		it(`should clone objectBuilder`, function() {
			let res = objectBuilder.set("key1","value");
			let cloned = res.clone();
			expect(res.value()).to.deep.eq(cloned.value());
		});

		it(`should not effect cloned objectBuilder when changing the original`, function() {
			let res = objectBuilder.set("key","value");
			let cloned = res.clone();
			res.delete("key");
			expect(res.value()).to.not.deep.eq(cloned.value());
		});	

		it(`should clone objectBuilder only with key2 (using string)`, function() {
			let res = objectBuilder.set("key1","value").set("key2","value2").set("key3","value3");
			let cloned = res.clone("key2");
			expect(cloned.value()).to.deep.eq({ key2: "value2" });
		});

		it(`should clone objectBuilder only with key2 (using array)`, function() {
			let res = objectBuilder.set("key1","value").set("key2","value2").set("key3","value3");
			let cloned = res.clone(["key2"]);
			expect(cloned.value()).to.deep.eq({ key2: "value2" });
		});

		it(`should clone objectBuilder only with key2 (using object with include string)`, function() {
			let res = objectBuilder.set("key1","value").set("key2","value2").set("key3","value3");
			let cloned = res.clone({ include: "key2" });
			expect(cloned.value()).to.deep.eq({ key2: "value2" });
		});

		it(`should clone objectBuilder only with key2 (using object with include array)`, function() {
			let res = objectBuilder.set("key1","value").set("key2","value2").set("key3","value3");
			let cloned = res.clone({ include: ["key2"] });
			expect(cloned.value()).to.deep.eq({ key2: "value2" });
		});

		it(`should clone objectBuilder only with key2 (using object with exclude string)`, function() {
			let res = objectBuilder.set("key1","value").set("key2","value2");
			let cloned = res.clone({ exclude: ["key1"] });
			expect(cloned.value()).to.deep.eq({ key2: "value2" });
		});

		it(`should clone objectBuilder with all keys`, function() {
			let res = objectBuilder.set("key1","value").set("key2","value2");
			let cloned = res.clone({ include: ["key"], fuzzy: true });
			expect(cloned.value()).to.deep.eq({ key1: "value", key2: "value2" });
		});
		
		it(`should clone objectBuilder with no keys`, function() {
			let res = objectBuilder.set("key1","value").set("key2","value2");
			let cloned = res.clone({ exclude: ["key"], fuzzy: true });
			expect(cloned.value()).to.deep.eq({ });
		});

		it(`should clone objectBuilder with nested keys`, function() {
			let res = objectBuilder.set("test.key1","value1").set("test.key2","value2");
			let cloned = res.clone({ include: ["test"], fuzzy: true });
			expect(cloned.value()).to.deep.eq({ test: { key1: "value1", key2: "value2" }});
		});

		it(`should clone objectBuilder with nested keys from the middle`, function() {
			let res = objectBuilder.set("test.key1.subkey","value").set("test.key2.subkey","value");
			let cloned = res.clone({ include: ["\.key"], fuzzy: true });
			expect(cloned.value()).to.deep.eq({ test: { key1: { subkey: "value" }, key2: { subkey: "value" }}});
		});

		it(`should clone objectBuilder with regex`, function() {
			let res = objectBuilder.set("test.key1.subkey","value").set("test.key2.subkey","value");
			let cloned = res.clone({ include: ["test\.key\\d\.subkey"], fuzzy: true });
			expect(cloned.value()).to.deep.eq({ test: { key1: { subkey: "value" }, key2: { subkey: "value" }}});
		});

		it(`should insert an item in the array at index 1`, function() {
			let res = objectBuilder.append("test", "key1", "key3").insertAt("test", 1, "key2");
			expect(res.value()).to.deep.eq({ test: ["key1", "key2", "key3"]});
		});

		it(`should insert multiple items in the array from index 1`, function() {
			let res = objectBuilder.append("test", "key1", "key4").insertAt("test", 1, "key2", "key3");
			expect(res.value()).to.deep.eq({ test: ["key1", "key2", "key3", "key4"]});
		});

		it(`should set an item in the array at index 1"`, function() {
			let res = objectBuilder.append("test", "key1", "key3").setAt("test", 1, "key2");
			expect(res.value()).to.deep.eq({ test: ["key1", "key2"]});
		});

		it(`should set multiple items in the array from index 1"`, function() {
			let res = objectBuilder.append("test", "key1", "-", "-", "key4").setAt("test", 1, "key2", "key3");
			expect(res.value()).to.deep.eq({ test: ["key1", "key2", "key3", "key4"]});
		});

		it(`should insert an item in the array before "key3"`, function() {
			let res = objectBuilder.append("test", "key1", "key3").insertBefore("test", "key3", "key2");
			expect(res.value()).to.deep.eq({ test: ["key1", "key2", "key3"]});
		});

		it(`should insert an item in the array before item with id=2`, function() {
			let res = objectBuilder.append("test", { id: 0 }, { id: 2 }).insertBefore("test", { id: 2 }, { id: 1 });
			expect(res.value()).to.deep.eq({ test: [{ id: 0 }, { id: 1 }, { id: 2 }]});
		});

		it(`should insert multiple items in the array before item with id=3`, function() {
			let res = objectBuilder.append("test", { id: 0 }, { id: 3 }).insertBefore("test", { id: 3 }, { id: 1 }, { id: 2 });
			expect(res.value()).to.deep.eq({ test: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }]});
		});

		it(`should insert an item in the array before item with id=2 and valid=true`, function() {
			let res = objectBuilder.append("test", { id: 0 }, { id: 2, valid: true }).insertBefore("test", { id: 2, valid: true }, { id: 1 });
			expect(res.value()).to.deep.eq({ test: [{ id: 0 }, { id: 1 }, { id: 2, valid: true }]});
		});

		it(`should insert multiple items in the array before item with id=3 and valid=true`, function() {
			let res = objectBuilder.append("test", { id: 0 }, { id: 3, valid: true }).insertBefore("test", { id: 3, valid: true }, { id: 1 }, { id: 2 });
			expect(res.value()).to.deep.eq({ test: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3, valid: true }]});
		});

		it(`should fail to insert an item in the array before item with id=2 and valid=true`, function() {
			let res = objectBuilder.append("test", { id: 0 }, { id: 2 }).insertBefore("test", { id: 2, valid: true }, { id: 1 });
			expect(res.value.bind()).to.throw("Can't insert before item in array test! Item is not found!");
		});

		it(`should insert an item in the array after "key2"`, function() {
			let res = objectBuilder.append("test", "key1", "key2").insertAfter("test", "key2", "key3");
			expect(res.value()).to.deep.eq({ test: ["key1", "key2", "key3"]});
		});

		it(`should insert an item in the array after item with id=1`, function() {
			let res = objectBuilder.append("test", { id: 0 }, { id: 1 }).insertAfter("test", { id: 1 }, { id: 2 });
			expect(res.value()).to.deep.eq({ test: [{ id: 0 }, { id: 1 }, { id: 2 }]});
		});

		it(`should insert multiple items in the array after item with id=1`, function() {
			let res = objectBuilder.append("test", { id: 0 }, { id: 1 }).insertAfter("test", { id: 1 }, { id: 2 }, { id: 3 });
			expect(res.value()).to.deep.eq({ test: [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }]});
		});

		it(`should insert an item in the array after item with id=1 and valid=true`, function() {
			let res = objectBuilder.append("test", { id: 0 }, { id: 1, valid: true }).insertAfter("test", { id: 1, valid: true }, { id: 2 });
			expect(res.value()).to.deep.eq({ test: [{ id: 0 }, { id: 1, valid: true }, { id: 2 }]});
		});

		it(`should insert multiple items in the array after item with id=1 and valid=true`, function() {
			let res = objectBuilder.append("test", { id: 0 }, { id: 1, valid: true }).insertAfter("test", { id: 1, valid: true }, { id: 2 }, { id: 3 });
			expect(res.value()).to.deep.eq({ test: [{ id: 0 }, { id: 1, valid: true }, { id: 2 }, { id: 3 }]});
		});

		it(`should fail to insert an item in the array after item with id=1 and valid=true`, function() {
			let res = objectBuilder.append("test", { id: 0 }, { id: 1 }).insertAfter("test", { id: 1, valid: true }, { id: 2 });
			expect(res.value.bind()).to.throw("Can't insert before item in array test! Item is not found!");
		});	
		
		it(`should insert an item in the array after an item where id>=1`, function() {
			let res = objectBuilder.set("test", [{ id: 0 }, { id: 1 }]).insertAfter("test", { id: { gte: 1} }, { id: 2 });
			expect(res.value()).to.deep.eq({ test: [{ id: 0 }, { id: 1 }, { id: 2 }]});
		});

		it(`should insert an item in the array after an item where id>0`, function() {
			let res = objectBuilder.set("test", [{ id: 0 }, { id: 1 }]).insertAfter("test", { id: { gt: 0} }, { id: 2 });
			expect(res.value()).to.deep.eq({ test: [{ id: 0 }, { id: 1 }, { id: 2 }]});
		});

		it(`should insert an item in the array after an item where id<2`, function() {
			let res = objectBuilder.set("test", [{ id: 0 }, { id: 2 }]).insertAfter("test", { id: { lt: 2} }, { id: 1 });
			expect(res.value()).to.deep.eq({ test: [{ id: 0 }, { id: 1 }, { id: 2 }]});
		});

		it(`should insert an item in the array after an item where id<=1`, function() {
			let res = objectBuilder.set("test", [{ id: 2 }, { id: 0 }]).insertAfter("test", { id: { lte: 2 } }, { id: 1 });
			expect(res.value()).to.deep.eq({ test: [{ id: 2 }, { id: 1 }, { id: 0 }]});
		});

		it(`should insert an item in the array after an item where id==1`, function() {
			let res = objectBuilder.set("test", [{ id: 0 }, { id: 1 }]).insertAfter("test", { id: { eq: 1} }, { id: 2 });
			expect(res.value()).to.deep.eq({ test: [{ id: 0 }, { id: 1 }, { id: 2 }]});
		});

		it(`should insert an item in the array after an item where id==1 (alternative)`, function() {
			let res = objectBuilder.set("test", [{ id: 0 }, { id: 1 }]).insertAfter("test", { id: { is: 1} }, { id: 2 });
			expect(res.value()).to.deep.eq({ test: [{ id: 0 }, { id: 1 }, { id: 2 }]});
		});

		it(`should insert an item in the array after an item where id!=0`, function() {
			let res = objectBuilder.set("test", [{ id: 0 }, { id: 1 }]).insertAfter("test", { id: { neq: 0} }, { id: 2 });
			expect(res.value()).to.deep.eq({ test: [{ id: 0 }, { id: 1 }, { id: 2 }]});
		});

		it(`should insert an item in the array after an item where id!=0 (alternative)`, function() {
			let res = objectBuilder.set("test", [{ id: 0 }, { id: 1 }]).insertAfter("test", { id: { not: 0} }, { id: 2 });
			expect(res.value()).to.deep.eq({ test: [{ id: 0 }, { id: 1 }, { id: 2 }]});
		});

		it(`should insert an item in the array after an item where id in [1,2,3]`, function() {
			let res = objectBuilder.set("test", [{ id: 0 }, { id: 1 }]).insertAfter("test", { id: { in: [1,2,3]} }, { id: 2 });
			expect(res.value()).to.deep.eq({ test: [{ id: 0 }, { id: 1 }, { id: 2 }]});
		});

		it(`should insert an item in the array after an item where id not in [1,2,3]`, function() {
			let res = objectBuilder.set("test", [{ id: 0 }, { id: 2 }]).insertAfter("test", { id: { nin: [1,2,3]} }, { id: 1 });
			expect(res.value()).to.deep.eq({ test: [{ id: 0 }, { id: 1 }, { id: 2 }]});
		});

		it(`should initialize objectBuilder`, function() {
			let res = objectBuilder.init({ test: "value", nested: { test: "value"}});
			expect(res.value()).to.deep.eq({ test: "value", nested: { test: "value"} });
		});

		it(`should copy value from key1 to key2`, function() {
			let res = objectBuilder.init({ key1: "value"}).copy("key1","key2");
			expect(res.value()).to.deep.eq({ key1: "value", key2: "value" });
		});
		
		it(`should move value from key1 to key2`, function() {
			let res = objectBuilder.init({ key1: "value"}).copy("key1","key2", { deleteSource: true });
			expect(res.value()).to.deep.eq({ key2: "value" });
		});

		it(`should not copy value from key1 to key2 because key2 exists`, function() {
			let res = objectBuilder.init({ key1: "value", key2: null }).copy("key1","key2");
			expect(res.value).to.throw("Destination key already exists");
		});

		it(`should not move value from key1 to key2 because key2 exists`, function() {
			let res = objectBuilder.init({ key1: "value", key2: null }).copy("key1","key2", { deleteSource: true });
			expect(res.value).to.throw("Destination key already exists");
		});

		it(`should copy value from key1 to key2 even if key2 exists`, function() {
			let res = objectBuilder.init({ key1: "value"}).copy("key1","key2", { overwrite: true });
			expect(res.value()).to.deep.eq({ key1: "value", key2: "value" });
		});
		
		it(`should move value from key1 to key2 even if key2 exists`, function() {
			let res = objectBuilder.init({ key1: "value"}).copy("key1","key2", { deleteSource: true, overwrite: true });
			expect(res.value()).to.deep.eq({ key2: "value" });
		});

		it(`should update key1 value with a string`, function() {
			let res = objectBuilder.init({ key1: "value", key2: "value2" }).update("key1","value1");
			expect(res.value()).to.deep.eq({ key1: "value1", key2: "value2" });
		});

		it(`should update key1 value using a function`, function() {
			let res = objectBuilder.init({ key1: "value", key2: "value2" }).update("key1",function(value) {
				return "value1"
			});
			expect(res.value()).to.deep.eq({ key1: "value1", key2: "value2" });
		});		

		it(`should update key1, key2 value with a string`, function() {
			let res = objectBuilder.init({ key1: "value", key2: "value2" }).update("key","value");
			expect(res.value()).to.deep.eq({ key1: "value", key2: "value" });
		});

		it(`should update key1, key2 value using a function`, function() {
			let res = objectBuilder.init({ key1: "value", key2: "value2" }).update("key",function(value) {
				return "value"
			});
			expect(res.value()).to.deep.eq({ key1: "value", key2: "value" });
		});		

	});
});
