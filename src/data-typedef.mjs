import { BASIC_TYPES } from 'binary-struct';

export class BinaryRecipe {
	static typedef = [
		{ field: 'id',			type: BASIC_TYPES.u32 },
		{ field: 'ingrA_id',	type: BASIC_TYPES.u16 },
		{ field: 'ingrB_id',	type: BASIC_TYPES.u16 },
		{ field: 'result_id',	type: BASIC_TYPES.u16 },
	];
}

export class BinaryItem {
	static typedef = [
		{ field: 'id',			type: BASIC_TYPES.u16 },
		{ field: 'handle',		type: BASIC_TYPES.str },
		{ field: 'emoji',		type: BASIC_TYPES.str },
		{ field: '_craft_path_source',	type: BASIC_TYPES.u32 },
		{ field: 'dep',			type: BASIC_TYPES.i16 },
	];
}

export class BinaryTransferData {
	static typedef = [
		{ field: 'NOTHING_ID',	type: BASIC_TYPES.u16 },
		{ field: 'items',		type: BASIC_TYPES.array(BinaryItem) },
		{ field: 'recipes',		type: BASIC_TYPES.array(BinaryRecipe) },
	];
}
