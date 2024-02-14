import { ItemName } from './ItemName';

export function RecipeDisplay({value}) {
	const { ingrA, ingrB, result } = value;
	return (
		<p>
			<ItemName item={ingrA}/>
			<span>+</span>
			<ItemName item={ingrB}/>
			<span>=</span>
			<ItemName item={result}/>
		</p>
	)
}
