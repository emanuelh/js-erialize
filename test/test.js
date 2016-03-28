var assert = require('chai').assert;
var ser = require('../dist/s-erialize.min.js')

// Serializes different javascript types
describe('serialization', function() {

    // number serialization
    var number = 12345;
    describe('on a number value', function() {
        it('serializes and deserializes back the number: ' + number,
            function() {
                assert.equal(number, ser.deserialize(ser.serialize(number)));
            });
    });

    // string serialization
    var string = 'Serialize me';
    describe('on a string value', function() {
        it('serializes and deserializes back the string: "' + string +'"',
            function() {
                assert.equal(string, ser.deserialize(ser.serialize(string)));
            });
    });

    // boolean serialization
    var bool = true;
    describe('on a boolean value', function() {
        it('serializes and deserializes back the boolean: ' + bool,
            function() {
                assert.equal(bool, ser.deserialize(ser.serialize(bool)));
            });
    });

    // function serialization
    var func = function() {var sum = 2 + 2; return sum;};
    describe('on a function value', function() {
        it('serializes and deserializes back the function: ' + func,
            function() {
                assert.equal(func(), ser.deserialize(ser.serialize(func))());
            });
    });

    // undefined serialization
    var undef;
    describe('on an undefined value', function() {
        it('serializes and deserializes back the undefined',
            function() {
                assert.equal(undef, ser.deserialize(ser.serialize(undef)));
            });
    });

    // object serialization
    var object1 = {
        prop1: 'true',
        prop2: 'I am a string',
    };
    var object2 = {
        prop1: 'I am another string',
        prop2: 5,
        prop3: true,
        prop4: ['uno', 'dos', 'tres', 'cuatro'],
        prop5: [1, 2, 3, 4]
    };
    var object3 = {
        prop1: 'and yet another string',
        prop2: 6,
    };
    object1.object = object2;
    object2.object = object3;
    object3.object = object1;
    
    var object = object1;
    describe('on an object value', function() {
        it('serializes and deserializes back an object with cyclic references', function() {
            assert.deepEqual(object, ser.deserialize(ser.serialize(object)));
        });
    });
});