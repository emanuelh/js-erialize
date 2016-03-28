/**
 * S-erialize
 *
 * Provides fast and lightweight object serialization for javascript.
 * Uses json as the wire format but, unlike JSON.stringify(), it
 * allows for cyclic data structures and function serialization.
 * 
 * 2014, Emmanuel Harguindey <emmanuel.harguindey@gmail.com>
 */

var bundle = function() {

    "use strict";
    var Bundle = function(){};

    Bundle.prototype = {};

    // **** BUILDER **** //
    Bundle.prototype.build = function(val){
        var bundle = {};
        
        var dataVal = this._valToDataVal(val);
        bundle.defs = this.dataDefs;
        bundle.data = dataVal;
        
        return bundle;
    };

    Bundle._newDataDef = function(type, dataObj) {
        var dataDef = {};
        dataDef.type = type;
        dataDef.object = dataObj;
        return dataDef;
    };

    Bundle._newRef = function(i) {
        return {index: i};
    };

    // Search for obj inside refs dictionary, returns undefined if not found
    Bundle.prototype._obtainDataRef = function(type, obj) {
        var i;
        for (i = 0; i < this.objs.length; i++) {
            if (obj === this.objs[i]) {
                return Bundle._newRef(i); 
            }
        }
    };

    Bundle.prototype._createDataRef = function(type, obj, dataObj) {
        var dataDef = Bundle._newDataDef(type, dataObj);
        var i = this.dataDefs.length;
        this.dataDefs.push(dataDef);
        this.objs.push(obj);
        return Bundle._newRef(i);
    };

    Bundle.prototype._valToDataVal = function(val) {
        var dataVal;
        var typeOfVal = typeof val;
        
        // type is either an object, function or a primitive
        if (typeOfVal == 'object' || typeOfVal == 'function') {
            if (val instanceof Array) {
                dataVal = this._arrToDataArr(val);
            } else if (val instanceof Object) {
                this.dataDefs = [];
                this.objs = [];
                dataVal = this._objToDataRef(val);
            }
        } else {
            dataVal = val;
        }
        
        return dataVal;
    };

    Bundle.prototype._arrToDataArr = function(arr) {
        var dataArr = [];
        
        // iterate through indexes
        for(var i = 0; i < arr.length; i++){        
            this._populateDataVal(dataArr, arr, i);
        }
        
        return dataArr;
    };

    Bundle.prototype._objToDataRef = function(obj) {
        var dataRef;
        var type;
        
        if (obj instanceof Function) type = 'Function';
        else type = 'Object';
        
        // if reference exists, return reference
        dataRef = this._obtainDataRef(type, obj);
        if (!dataRef) {
            if (type == 'Function') {
                dataRef = this._createDataRef('Function', obj, obj.toString());
            } else {
                var dataObj = {};
                dataRef = this._createDataRef('Object', obj, dataObj);
                // iterate through properties
                for(var prop in obj) {
                    this._populateDataVal(dataObj, obj, prop);
                }
            }
        }
        
        return dataRef;
    };

    Bundle.prototype._populateDataVal = function(dataVal, val, prop) {
        var propVal = val[prop];
        var typeOfPropVal = typeof propVal;
        
        // type is either an object, function or a primitive
        if (typeOfPropVal == 'object' || typeOfPropVal == 'function') {
            if (propVal instanceof Array) {
                dataVal[prop] = this._arrToDataArr(propVal);
            } else {    
                dataVal[prop] = this._objToDataRef(propVal);
            }
        } else {
            dataVal[prop] = propVal;
        }
    };

    // **** DEBUILDER **** //
    Bundle.prototype.debuild = function(bundle){
        this.bundle = bundle;
        this.dataVal = bundle.data;
        return this._dataValToVal(this.dataVal);
    };

    // Search for the object inside objects list, returns undefined if not found
    Bundle.prototype._getDataDef = function(dataRef) {
        var i = dataRef.index;
        return this._dataDefs[i];
    };

    // Search for the object inside objects list, returns undefined if not found
    Bundle.prototype._getObj = function(dataRef) {
        var i = dataRef.index;
        return this._objs[i];
    };

    Bundle.prototype._createObj = function(dataRef, obj) {
        var i = dataRef.index;
        this._objs[i] = obj;
    };

    Bundle.prototype._dataValToVal = function(dataVal) {
        var val;
        var typeOfDataVal = typeof dataVal;
        
        // type is either an object, function or a primitive
        if (typeOfDataVal == 'object' || typeOfDataVal == 'function') {
            if (dataVal instanceof Array) {
                val = this._dataArrToArr(dataVal);
            } else if (dataVal instanceof Object) {
                this._dataDefs = this.bundle.defs;
                this._objs = [];
                val = this._dataRefToObj(dataVal);
            }
        } else {
            val = dataVal;
        }

        return val;
    };

    Bundle.prototype._dataArrToArr = function(dataArr) {
        var arr = [];
        
        // iterate through indexes
        for(var i = 0; i < dataArr.length; i++) {
            this._populateVal(arr, dataArr, i);
        }
            
        return arr;
    };
        
    Bundle.prototype._dataRefToObj = function(dataRef) {

        var dataDef = this._getDataDef(dataRef);
            
        var dataType = dataDef.type;
        var dataObj = dataDef.object;
        
        var obj;
        // if exist in objects list, return it
        obj = this._getObj(dataRef);
        
        if(!obj) {
            if (dataType == 'Function') {
                var startBody = dataObj.indexOf('{') + 1;
                var endBody = dataObj.lastIndexOf('}');
                var startArgs = dataObj.indexOf('(') + 1;
                var endArgs = dataObj.indexOf(')');
                obj = new Function(dataObj.substring(startArgs, endArgs),
                    dataObj.substring(startBody, endBody));
                this._createObj(dataRef, obj);
            } else {
                obj = {};
                this._createObj(dataRef, obj);
                // iterate through properties
                for(var prop in dataObj) {
                    this._populateVal(obj, dataObj, prop);
                }
            }
        }
            
        return obj;
    };

    Bundle.prototype._populateVal = function(val, dataVal, prop) {
        var propVal = dataVal[prop];
        var typeOfPropVal = typeof propVal;

        // type is either an object, function or a primitive
        if (typeOfPropVal == 'object' || typeOfPropVal == 'function') {
            if (propVal instanceof Array) {
                val[prop] = this._dataArrToArr(propVal);
            } else {    
                val[prop] = this._dataRefToObj(propVal);
            }
        } else {
            val[prop] = propVal;
        }
    };

    return new Bundle();
}();

module.exports = {
    serialize: function(obj) {
	   return JSON.stringify(bundle.build(obj));
    },
    deserialize:function(str) {
        return bundle.debuild(JSON.parse(str));
    }
};
