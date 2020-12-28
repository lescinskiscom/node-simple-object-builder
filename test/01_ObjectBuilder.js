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

	});
});
