import { BaseTypeHandler, CompoundTypeHandler } from './type-handler.mjs';

export { BASIC_TYPES } from './type-handler.mjs';

/**
 * Serializes JavaScript value to binary.
 * @param {any} value - value to serialize.
 * @param {BaseTypeHandler} type - type handler of the value.
 * @returns {ArrayBuffer} - the serialized binary buffer.
 */
export function serializeToBinary(value, type) {
	if (!(type instanceof BaseTypeHandler)) {
		type = new CompoundTypeHandler(type);
	}

	const res = new ArrayBuffer(type.sizeof(value));
	const view = new DataView(res);
	type.serialize(view, 0, value);
	return res;
}

/**
 * Deserializes binary back to JavaScript value.
 * @param {DataView} view - buffer to deserialize.
 * @param {BaseTypeHandler} type - type handler of the desired value.
 * @returns {any} - the deserialized JavaScript value.
 */
export function deserializeFromBinary(view, type) {
	if (!(type instanceof BaseTypeHandler)) {
		type = new CompoundTypeHandler(type);
	}

	const tmp = type.deserialize(view, 0);
	return tmp.value;
}
