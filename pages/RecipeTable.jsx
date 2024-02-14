import { ItemName } from './ItemName';
import './RecipeTable.css';

export function RecipeTable({recipes, indexed = false, emptyInfo = 'No recipes are known.'}) {
	if (recipes.length == 0) {
		return <p className='recipe-empty'>{emptyInfo}</p>;
	}

	return (
		<table className='recipe-table full-width'>
			<thead>
				<tr>
					{ indexed && <th>{indexed}</th>}
					<th>First Ingredient</th>
					<th>Second Ingredient</th>
					<th>Craft Result</th>
				</tr>
			</thead>
			<tbody>{recipes.map(({ id, ingrA, ingrB, result }, index) => (
				<tr key={id}>
					{ indexed && <td className='recipe-table-idx'>{index + 1}.</td> }
					<td className='recipe-table-ingr'><ItemName item={ingrA}></ItemName></td>
					<td className='recipe-table-ingr'><ItemName item={ingrB}></ItemName></td>
					<td className='recipe-table-res'><ItemName item={result}></ItemName></td>
				</tr>
			))}</tbody>
		</table>
	)
}
