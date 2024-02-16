import { Buffer } from 'buffer';

/**
 * Represents the result of deserialization.
 * @class
 */
export class DeserializedResult {
	/**
	 * @constructor
	 * @param {any} value - The deserialized value.
	 * @param {number} offset - The offset after deserialization.
	 */
	constructor(value, offset) {
		this.value = value;
		this.offset = offset;
	}
}

/**
 * Base class for handling basic data types.
 * @abstract
 * @class
 */
export class BaseTypeHandler {
	/**
	 * Gets the size of the serialized value in bytes.
	 * @abstract
	 * @param {any} value - The value to be serialized.
	 * @returns {number} - The size of the serialized value in bytes.
	 */
	sizeof(value) {
		throw new Error('virtual method called');
	}

	/**
	 * Serializes the value and writes it to the DataView at the specified offset.
	 * @abstract
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {any} value - The value to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		throw new Error('virtual method called');
	}

	/**
	 * Deserializes the value from the DataView at the specified offset.
	 * @abstract
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result.
	 */
	deserialize(view, offset) {
		throw new Error('virtual method called');
	}
}

/**
 * Handles 8-bit signed integers (int8).
 * @extends {BaseTypeHandler}
 * @class
 */
export class Int8Handler extends BaseTypeHandler {
	/**
	 * Gets the size of the serialized int8 value in bytes (always 1).
	 * @param {number} _value - The int8 value.
	 * @returns {number} - The size of the serialized int8 value in bytes.
	 */
	sizeof(_value) {
		return 1;
	}

	/**
	 * Serializes the int8 value and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {number} value - The int8 value to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		view.setInt8(offset, value);
		return offset + 1;
	}

	/**
	 * Deserializes the int8 value from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the int8 value and a new offset.
	 */
	deserialize(view, offset) {
		return new DeserializedResult(view.getInt8(offset), offset + 1);
	}
}

/**
 * Handles 16-bit signed integers (int16).
 * @extends {BaseTypeHandler}
 * @class
 */
export class Int16Handler extends BaseTypeHandler {
	/**
	 * Gets the size of the serialized int16 value in bytes (always 2).
	 * @param {number} _value - The int16 value.
	 * @returns {number} - The size of the serialized int16 value in bytes.
	 */
	sizeof(_value) {
		return 2;
	}

	/**
	 * Serializes the int16 value and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {number} value - The int16 value to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		view.setInt16(offset, value, true);
		return offset + 2;
	}

	/**
	 * Deserializes the int16 value from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the int16 value and a new offset.
	 */
	deserialize(view, offset) {
		return new DeserializedResult(view.getInt16(offset, true), offset + 2);
	}
}

/**
 * Handles 32-bit signed integers (int32).
 * @extends {BaseTypeHandler}
 * @class
 */
export class Int32Handler extends BaseTypeHandler {
	/**
	 * Gets the size of the serialized int32 value in bytes (always 4).
	 * @param {number} _value - The int32 value.
	 * @returns {number} - The size of the serialized int32 value in bytes.
	 */
	sizeof(_value) {
		return 4;
	}

	/**
	 * Serializes the int32 value and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {number} value - The int32 value to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		view.setInt32(offset, value, true);
		return offset + 4;
	}

	/**
	 * Deserializes the int32 value from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the int32 value and a new offset.
	 */
	deserialize(view, offset) {
		return new DeserializedResult(view.getInt32(offset, true), offset + 4);
	}
}

/**
 * Handles 64-bit signed integers (int64).
 * @extends {BaseTypeHandler}
 * @class
 */
export class Int64Handler extends BaseTypeHandler {
	/**
	 * Gets the size of the serialized int64 value in bytes (always 8).
	 * @param {BigInt} _value - The int64 value.
	 * @returns {number} - The size of the serialized int64 value in bytes.
	 */
	sizeof(_value) {
		return 8;
	}

	/**
	 * Serializes the int64 value and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {BigInt} value - The int64 value to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		view.setBigInt64(offset, value, true);
		return offset + 8;
	}

	/**
	 * Deserializes the int64 value from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the int64 value and a new offset.
	 */
	deserialize(view, offset) {
		return new DeserializedResult(view.getBigInt64(offset, true), offset + 8);
	}
}

/**
 * Handles 8-bit unsigned integers (uint8).
 * @extends {BaseTypeHandler}
 * @class
 */
export class Uint8Handler extends BaseTypeHandler {
	/**
	 * Gets the size of the serialized uint8 value in bytes (always 1).
	 * @param {number} _value - The uint8 value.
	 * @returns {number} - The size of the serialized uint8 value in bytes.
	 */
	sizeof(_value) {
		return 1;
	}

	/**
	 * Serializes the uint8 value and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {number} value - The uint8 value to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		view.setUint8(offset, value);
		return offset + 1;
	}

	/**
	 * Deserializes the uint8 value from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the uint8 value and a new offset.
	 */
	deserialize(view, offset) {
		return new DeserializedResult(view.getUint8(offset), offset + 1);
	}
}

/**
 * Handles 16-bit unsigned integers (uint16).
 * @extends {BaseTypeHandler}
 * @class
 */
export class Uint16Handler extends BaseTypeHandler {
	/**
	 * Gets the size of the serialized uint16 value in bytes (always 2).
	 * @param {number} _value - The uint16 value.
	 * @returns {number} - The size of the serialized uint16 value in bytes.
	 */
	sizeof(_value) {
		return 2;
	}

	/**
	 * Serializes the uint16 value and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {number} value - The uint16 value to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		view.setUint16(offset, value, true);
		return offset + 2;
	}

	/**
	 * Deserializes the uint16 value from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the uint16 value and a new offset.
	 */
	deserialize(view, offset) {
		return new DeserializedResult(view.getUint16(offset, true), offset + 2);
	}
}

/**
 * Handles 32-bit unsigned integers (uint32).
 * @extends {BaseTypeHandler}
 * @class
 */
export class Uint32Handler extends BaseTypeHandler {
	/**
	 * Gets the size of the serialized uint32 value in bytes (always 4).
	 * @param {number} _value - The uint32 value.
	 * @returns {number} - The size of the serialized uint32 value in bytes.
	 */
	sizeof(_value) {
		return 4;
	}

	/**
	 * Serializes the uint32 value and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {number} value - The uint32 value to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		view.setUint32(offset, value, true);
		return offset + 4;
	}

	/**
	 * Deserializes the uint32 value from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the uint32 value and a new offset.
	 */
	deserialize(view, offset) {
		return new DeserializedResult(view.getUint32(offset, true), offset + 4);
	}
}

/**
 * Handles 64-bit unsigned integers (uint64).
 * @extends {BaseTypeHandler}
 * @class
 */
export class Uint64Handler extends BaseTypeHandler {
	/**
	 * Gets the size of the serialized uint64 value in bytes (always 8).
	 * @param {BigInt} _value - The uint64 value.
	 * @returns {number} - The size of the serialized uint64 value in bytes.
	 */
	sizeof(_value) {
		return 8;
	}

	/**
	 * Serializes the uint64 value and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {BigInt} value - The uint64 value to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		view.setBigUint64(offset, value, true);
		return offset + 8;
	}

	/**
	 * Deserializes the uint64 value from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the uint64 value and a new offset.
	 */
	deserialize(view, offset) {
		return new DeserializedResult(view.getBigUint64(offset, true), offset + 8);
	}
}

/**
 * Handles 32-bit floating point numbers (float32).
 * @extends {BaseTypeHandler}
 * @class
 */
export class Float32Handler extends BaseTypeHandler {
	/**
	 * Gets the size of the serialized float32 value in bytes (always 4).
	 * @param {number} _value - The float32 value.
	 * @returns {number} - The size of the serialized float32 value in bytes.
	 */
	sizeof(_value) {
		return 4;
	}

	/**
	 * Serializes the float32 value and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {number} value - The float32 value to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		view.setFloat32(offset, value);
		return offset + 4;
	}

	/**
	 * Deserializes the float32 value from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the float32 value and a new offset.
	 */
	deserialize(view, offset) {
		return new DeserializedResult(view.getFloat32(offset), offset + 4);
	}
}

/**
 * Handles 64-bit floating point numbers (float64).
 * @extends {BaseTypeHandler}
 * @class
 */
export class Float64Handler extends BaseTypeHandler {
	/**
	 * Gets the size of the serialized float64 value in bytes (always 8).
	 * @param {number} _value - The float64 value.
	 * @returns {number} - The size of the serialized float64 value in bytes.
	 */
	sizeof(_value) {
		return 8;
	}

	/**
	 * Serializes the float64 value and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {number} value - The float64 value to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		view.setFloat64(offset, value);
		return offset + 8;
	}

	/**
	 * Deserializes the float64 value from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the float64 value and a new offset.
	 */
	deserialize(view, offset) {
		return new DeserializedResult(view.getFloat64(offset), offset + 8);
	}
}

/**
 * Handles boolean values (bool).
 * @extends {BaseTypeHandler}
 * @class
 */
export class BoolHandler extends BaseTypeHandler {
	/**
	 * Gets the size of the serialized bool value in bytes (always 1).
	 * @param {boolean} _value - The bool value.
	 * @returns {number} - The size of the serialized bool value in bytes.
	 */
	sizeof(_value) {
		return 1;
	}

	/**
	 * Serializes the bool value and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {boolean} value - The bool value to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		view.setUint8(offset, value ? 1 : 0);
		return offset + 1;
	}

	/**
	 * Deserializes the bool value from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the bool value and a new offset.
	 */
	deserialize(view, offset) {
		return new DeserializedResult(view.getUint8(offset) !== 0, offset + 1);
	}
}

/**
 * Handles boolean values (bool).
 * @extends {BaseTypeHandler}
 * @class
 */
export class DateHandler extends BaseTypeHandler {
	/**
	 * Gets the size of the serialized Date value in bytes (always 8).
	 * @param {Date} _value - The bool value.
	 * @returns {number} - The size of the serialized bool value in bytes.
	 */
	sizeof(_value) {
		return 8;
	}

	/**
	 * Serializes the Date value and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {Date} value - The Date value to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		view.setBigUint64(offset, BigInt(Math.floor(value.getTime() / 1000)), true);
		return offset + 8;
	}

	/**
	 * Deserializes the Date value from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the Date value and a new offset.
	 */
	deserialize(view, offset) {
		const timestamp = parseInt(view.getBigUint64(offset, true));
		return new DeserializedResult(new Date(timestamp * 1000), offset + 8);
	}
}

/**
 * Handles void values (void).
 * @extends {BaseTypeHandler}
 * @class
 */
export class VoidHandler extends BaseTypeHandler {
	/**
	 * Gets the size of the serialized void value in bytes (always 0).
	 * @param {*} _value - The void value.
	 * @returns {number} - The size of the serialized void value in bytes (always 0).
	 */
	sizeof(_value) {
		return 0;
	}

	/**
	 * Serializes the void value (does nothing).
	 * @param {DataView} _view - The DataView to write to (not used).
	 * @param {number} offset - The offset to start writing at (not used).
	 * @param {*} _value - The void value (not used).
	 * @returns {number} - The offset unchanged.
	 */
	serialize(_view, offset, _value) {
		return offset;
	}

	/**
	 * Deserializes the void value (does nothing).
	 * @param {DataView} _view - The DataView to read from (not used).
	 * @param {number} offset - The offset to start reading from (not used).
	 * @returns {DeserializedResult} - The offset unchanged and undefined as the value.
	 */
	deserialize(_view, offset) {
		return new DeserializedResult(undefined, offset);
	}
}

function getHandlerObject(type) {
	if (type instanceof BaseTypeHandler) {
		return type;
	}
	return new CompoundTypeHandler(type);
}

/**
 * Handles array of a fixed length with elements of the same type.
 * @extends {BaseTypeHandler}
 * @class
 */
export class FixedArrayHandler extends BaseTypeHandler {
	/**
	 * Constructor for FixedArrayHandler.
	 * @param {number} n - The fixed length of the array.
	 * @param {BaseTypeHandler} element_handler - The handler for individual elements of the array.
	 */
	constructor(n, element_handler) {
		super();
		this.n = n;
		this.element_handler = getHandlerObject(element_handler);
	}

	/**
	 * Gets the size of the serialized fixed-length array in bytes.
	 * @param {Array} value - The array to calculate the size for.
	 * @returns {number} - The size of the serialized fixed-length array in bytes.
	 */
	sizeof(value) {
		let res = 0;
		for (let i = 0; i < this.n; i += 1) {
			res += this.element_handler.sizeof(value[i]);
		}
		return res;
	}

	/**
	 * Serializes the fixed-length array and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {Array} value - The fixed-length array to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		for (let i = 0; i < this.n; i += 1) {
			offset = this.element_handler.serialize(view, offset, value[i]);
		}
		return offset;
	}

	/**
	 * Deserializes the fixed-length array from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the fixed-length array and a new offset.
	 */
	deserialize(view, offset) {
		let res = new Array(this.n);
		for (let i = 0; i < this.n; i += 1) {
			const tmp = this.element_handler.deserialize(view, offset);
			res[i] = tmp.value;
			offset = tmp.offset;
		}
		return new DeserializedResult(res, offset);
	}
}

/**
 * Handles raw binary buffer of a fixed length.
 * @extends {BaseTypeHandler}
 * @class
 */
export class RawBufferHandler extends BaseTypeHandler {
	/**
	 * Constructor for RawBufferHandler.
	 * @param {number} n - The fixed length of the buffer.
	 */
	constructor(n) {
		super();
		this.n = n;
	}

	/**
	 * Gets the size of the serialized fixed-length buffer in bytes.
	 * @param {Buffer} value - The array to calculate the size for.
	 * @returns {number} - The size of the serialized fixed-length array in bytes.
	 */
	sizeof(value) {
		return value.byteLength;
	}

	/**
	 * Serializes the fixed-length buffer and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {Buffer} value - The fixed-length buffer to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		for (let i = 0; i < this.n; i += 1) {
			view.setUint8(offset + i, value.readUInt8(offset + i));
		}
		return offset + this.n;
	}

	/**
	 * Deserializes the fixed-length array from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the fixed-length array and a new offset.
	 */
	deserialize(view, offset) {
		const res = Buffer.from(view.buffer, offset, this.n);
		return new DeserializedResult(res, offset + this.n);
	}
}

/**
 * Handles dynamic arrays with elements of the same type.
 * @extends {BaseTypeHandler}
 * @class
 */
export class DynamicArrayHandler extends BaseTypeHandler {
	/**
	 * Constructor for DynamicArrayHandler.
	 * @param {BaseTypeHandler} element_handler - The handler for individual elements of the array.
	 */
	constructor(element_handler) {
		super();
		this.element_handler = getHandlerObject(element_handler);
	}

	/**
	 * Gets the size of the serialized dynamic array in bytes.
	 * @param {Array} value - The array to calculate the size for.
	 * @returns {number} - The size of the serialized dynamic array in bytes.
	 */
	sizeof(value) {
		let size = 4; // For storing the length of the array
		for (const element of value) {
			size += this.element_handler.sizeof(element);
		}
		return size;
	}

	/**
	 * Serializes the dynamic array and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {Array} value - The dynamic array to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		view.setUint32(offset, value.length, true);
		offset += 4;
		for (const element of value) {
			offset = this.element_handler.serialize(view, offset, element);
		}
		return offset;
	}

	/**
	 * Deserializes the dynamic array from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the dynamic array and a new offset.
	 */
	deserialize(view, offset) {
		const length = view.getUint32(offset, true);
		offset += 4;
		const res = new Array(length);
		for (let i = 0; i < length; i++) {
			const tmp = this.element_handler.deserialize(view, offset);
			res[i] = tmp.value;
			offset = tmp.offset;
		}
		return new DeserializedResult(res, offset);
	}
}

/**
 * Handles map with keys and values are of the same type.
 * @extends {BaseTypeHandler}
 * @class
 */
export class MapHandler extends BaseTypeHandler {
	/**
	 * Constructor for MapHandler.
	 * @param {BaseTypeHandler} key_handler - The handler for keys of the map.
	 * @param {BaseTypeHandler} value_handler - The handler for values of the map.
	 */
	constructor(key_handler, value_handler) {
		super();
		this.key_handler = getHandlerObject(key_handler);
		this.value_handler = getHandlerObject(value_handler);
	}

	/**
	 * Gets the size of the serialized map in bytes.
	 * @param {Map} value - The map to calculate the size for.
	 * @returns {number} - The size of the serialized map in bytes.
	 */
	sizeof(value) {
		let res = 4;
		for (const [k, v] of value) {
			res += this.key_handler.sizeof(k);
			res += this.value_handler.sizeof(v);
		}
		return res;
	}

	/**
	 * Serializes the map and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {Map} value - The map to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		view.setUint32(offset, value.size, true);
		offset += 4;
		for (const [k, v] of value) {
			offset = this.key_handler.serialize(view, offset, k);
			offset = this.value_handler.serialize(view, offset, v);
		}
		return offset;
	}

	/**
	 * Deserializes the map from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the map and a new offset.
	 */
	deserialize(view, offset) {
		const size = view.getUint32(offset, true);
		offset += 4;
		const res = new Map();
		for (let i = 0; i < size; i += 1) {
			const resk = this.key_handler.deserialize(view, offset);
			const resv = this.value_handler.deserialize(view, resk.offset);
			offset = resv.offset;
			res.set(resk.value, resv.value);
		}
		return new DeserializedResult(res, offset);
	}
}

/**
 * Handles storage and serialization of strings.
 * @extends {BaseTypeHandler}
 * @class
 */
export class StringHandler extends BaseTypeHandler {
	/**
	 * Gets the size of the serialized string in bytes.
	 * @param {string} value - The string to calculate the size for.
	 * @returns {number} - The size of the serialized string in bytes.
	 */
	sizeof(value) {
		// Convert the string to UTF-8 encoding and calculate its byte length
		const encoder = new TextEncoder();
		const encodedString = encoder.encode(value);

		// Calculate the size of the string (length of UTF-8 encoding) plus 4 bytes for storing the length
		return encodedString.byteLength + 4;
	}

	/**
	 * Serializes the string and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {string} value - The string to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		// Convert the string to UTF-8 encoding
		const encoder = new TextEncoder();
		const encoded_string = encoder.encode(value);

		// Write the length of the string as a uint32 at the specified offset
		view.setUint32(offset, encoded_string.length, true);
		offset += 4;

		// Write the UTF-8 encoded string to the DataView starting at offset + 4 (after the length)
		for (let i = 0; i < encoded_string.length; i++) {
			view.setUint8(offset + i, encoded_string[i]);
		}

		// Return the new offset after serialization
		return offset + encoded_string.length;
	}

	/**
	 * Deserializes the string from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the string and a new offset.
	 */
	deserialize(view, offset) {
		// Read the length of the string as a uint32 at the specified offset
		const length = view.getUint32(offset, true);
		offset += 4;

		// Read the UTF-8 encoded string from the DataView starting at offset + 4 (after the length)
		const encoded_string = new Uint8Array(view.buffer, offset, length);

		// Convert the UTF-8 encoded string to a JavaScript string
		const decoder = new TextDecoder();
		const decodedString = decoder.decode(encoded_string);

		// Return the deserialized string and the new offset
		return new DeserializedResult(decodedString, offset + length);
	}
}

/**
 * Handles the serialization and deserialization of a compound type composed of various fields.
 * @extends {BaseTypeHandler}
 * @class
 */
export class CompoundTypeHandler extends BaseTypeHandler {
	/**
	 * Constructs a CompoundTypeHandler object for the specified type.
	 * @param {Function} type - The class representing the compound type.
	 * @example
	 * // Define a class Point
	 * class Point {
	 * 	constructor(x, y) {
	 * 		this.x = x;
	 * 		this.y = y;
	 * 	}
	 * }
	 * 
	 * // Define the type definition for Point
	 * Point.typedef = [
	 * 	{field: 'x', type: BASIC_TYPES.f32},
	 * 	{field: 'y', type: BASIC_TYPES.f32}
	 * ];
	 * 
	 * // Create a CompoundTypeHandler for Point
	 * const pointHandler = new CompoundTypeHandler(Point);
	 */
	constructor(type) {
		super();
		/**
		 * The class representing the compound type.
		 * @type {Function}
		 * @private
		 */
		this.type = type;
		/**
		 * The type definition specifying the fields and their handlers.
		 * @type {Array<{field: string, type: BaseTypeHandler}>}
		 * @private
		 */
		this.typedef = type.typedef;
	}

	/**
	 * Gets the size of the serialized compound type in bytes.
	 * @param {Object} value - The instance of the compound type to calculate the size for.
	 * @returns {number} - The size of the serialized compound type in bytes.
	 */
	sizeof(value) {
		let res = 0;
		for (let i = 0; i < this.typedef.length; i += 1) {
			const field_name = this.typedef[i].field;
			const field_handler = getHandlerObject(this.typedef[i].type);
			res += field_handler.sizeof(value[field_name]);
		}
		return res;
	}

	/**
	 * Serializes the compound type and writes it to the DataView at the specified offset.
	 * @param {DataView} view - The DataView to write to.
	 * @param {number} offset - The offset to start writing at.
	 * @param {Object} value - The instance of the compound type to be serialized.
	 * @returns {number} - The new offset after serialization.
	 */
	serialize(view, offset, value) {
		for (let i = 0; i < this.typedef.length; i += 1) {
			const field_name = this.typedef[i].field;
			const field_handler = getHandlerObject(this.typedef[i].type);
			offset = field_handler.serialize(view, offset, value[field_name]);
		}
		return offset;
	}

	/**
	 * Deserializes the compound type from the DataView at the specified offset.
	 * @param {DataView} view - The DataView to read from.
	 * @param {number} offset - The offset to start reading from.
	 * @returns {DeserializedResult} - The deserialized result containing the compound type and a new offset.
	 */
	deserialize(view, offset) {
		let res = new this.type();
		for (let i = 0; i < this.typedef.length; i += 1) {
			const field_name = this.typedef[i].field;
			const field_handler = getHandlerObject(this.typedef[i].type);
			const tmp = field_handler.deserialize(view, offset);
			res[field_name] = tmp.value;
			offset = tmp.offset;
		}
		return new DeserializedResult(res, offset);
	}
}

export const BASIC_TYPES = {
	i8: new Int8Handler(),
	i16: new Int16Handler(),
	i32: new Int32Handler(),
	i64: new Int64Handler(),

	u8: new Uint8Handler(),
	u16: new Uint16Handler(),
	u32: new Uint32Handler(),
	u64: new Uint64Handler(),

	f32: new Float64Handler(),
	f64: new Float64Handler(),

	bool: new BoolHandler(),
	void: new VoidHandler(),
	str: new StringHandler(),
	DateTime: new DateHandler(),

	array: (type) => new DynamicArrayHandler(type),
	FixedArray: (n, type) => new FixedArrayHandler(n, type),
	raw: (n) => new RawBufferHandler(n),
	map: (k, v) => new MapHandler(k, v),
	StringMap: new MapHandler(new StringHandler(), new StringHandler()),
};
