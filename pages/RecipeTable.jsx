import { ItemName } from './ItemName';
import './RecipeTable.css';

export function RecipeTable({recipes, indexed = false}) {
	return (
		<table className='recipe-table full-width'>
			<thead>
				<tr>
					{ indexed && <th>{indexed}</th>}
					<th>First Ingridiant</th>
					<th>Second Ingridiant</th>
					<th>Craft Result</th>
				</tr>
			</thead>
			<tbody>{recipes.map(({ ingrA, ingrB, result }, index) => (
				<tr>
					{ indexed && <td className='recipe-table-idx'>{index + 1}.</td> }
					<td className='recipe-table-ingr'><ItemName item={ingrA}></ItemName></td>
					<td className='recipe-table-ingr'><ItemName item={ingrB}></ItemName></td>
					<td className='recipe-table-res'><ItemName item={result}></ItemName></td>
				</tr>
			))}</tbody>
		</table>
	)
}
