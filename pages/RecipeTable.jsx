import { useState } from 'react';
import { ItemName } from './ItemName';
import './RecipeTable.css';

export function RecipeTable({recipes, pageLimit = Infinity, indexed = false, emptyInfo = 'No recipes are known.'}) {
	if (recipes.length == 0) {
		return <p className='recipe-empty'>{emptyInfo}</p>;
	}

	const [displayLimit, setDisplayLimit] = useState(pageLimit);

	const handleShowMore = () => {
		setDisplayLimit(displayLimit + pageLimit);
	};

	const handleShowLess = () => {
		setDisplayLimit(pageLimit);
	};

	const handleShowAll = () => {
		setDisplayLimit(recipes.length);
	};


	return (
		<table className='recipe-table full-width'>
			<thead>
				<tr>
					{ indexed && <th scope='col' className='recipe-table-idx'>{indexed}</th>}
					<th scope='col'>First Ingredient</th>
					<th scope='col'>Second Ingredient</th>
					<th scope='col'>Craft Result</th>
				</tr>
			</thead>
			<tbody>{recipes.slice(0, displayLimit).map(({ id, ingrA, ingrB, result }, index) => (
				<tr key={id}>
					{ indexed && <td className='recipe-table-idx'>{index + 1}.</td> }
					<td className='recipe-table-ingr'><ItemName item={ingrA}></ItemName></td>
					<td className='recipe-table-ingr'><ItemName item={ingrB}></ItemName></td>
					<td className='recipe-table-res'><ItemName item={result}></ItemName></td>
				</tr>
			))}</tbody>
			{pageLimit < recipes.length && (
				<tfoot><tr>
					<td colSpan={indexed ? 4 : 3}>
						{displayLimit < recipes.length && <span className='recipe-table-info'>...{recipes.length - displayLimit} rows omitted.</span>}
						{displayLimit + pageLimit < recipes.length && <a className='a-button' onClick={handleShowMore}>Show More</a>}
						{displayLimit < recipes.length && <a className='a-button' onClick={handleShowAll}>Show All{recipes.length > 1000 && '(Slow)'}</a>}
						{displayLimit > pageLimit && <a className='a-button' onClick={handleShowLess}>Show Less</a>}
					</td>
				</tr></tfoot>
			)}
		</table>
	)
}
