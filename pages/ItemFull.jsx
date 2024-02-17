import { RecipeTable } from './RecipeTable';
import './info-table.css';
import './ItemFull.css';

export default function ItemFull({ value }) {
	const note = value.note();
	return (
		<>
			<h2>Basic Info of {value.handle}</h2>
			<table className='info-table'><tbody>
				<tr><td>Dictionary ID:</td><td>{value.id}</td></tr>
				<tr><td>Handle:</td><td>{value.handle}</td></tr>
				<tr><td>Emoji:</td><td>{value.emoji}</td></tr>
				<tr><td>Fundamental:</td><td>{value.isFundamental() ? 'Yes' : 'No'}</td></tr>
				<tr><td>Crafting Depth:</td><td>{value.dep}</td></tr>
			</tbody></table>
			{ note != null && <p className='item-note'>{value.note()}</p>}
			<h2>Known Recipes That Craft {value.handle}</h2>
			<RecipeTable pageLimit={10} recipes={value.craft_by}></RecipeTable>
			<h2>Known Recipes That Use {value.handle}</h2>
			<RecipeTable pageLimit={10} recipes={value.can_craft}></RecipeTable>
			<h2>An Example Way Of Obtaining {value.handle}</h2>
			<RecipeTable recipes={value.calcPath()} indexed='Step' emptyInfo={note ?? 'This is an fundamental element.'}></RecipeTable>
		</>
	);
}
