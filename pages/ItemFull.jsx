import './info-table.css';
import { RecipeTable } from './RecipeTable';

export default function ItemFull({ value }) {
	return (
		<>
			<h2>Basic Info of {value.handle}</h2>
			<table className='info-table'><tbody>
				<tr><td>Handle:</td><td>{value.handle}</td></tr>
				<tr><td>Emoji:</td><td>{value.emoji}</td></tr>
				<tr><td>Fundamental:</td><td>{value.isFundamental() ? 'Yes' : 'No'}</td></tr>
				<tr><td>Carfting Depth:</td><td>{value.dep}</td></tr>
			</tbody></table>
			<h2>Known Recipes That Crafts {value.handle}</h2>
			<RecipeTable recipes={value.craft_by}></RecipeTable>
			<h2>Known Recipes That Uses {value.handle}</h2>
			<RecipeTable recipes={value.can_craft}></RecipeTable>
			<h2>An Example Way Of Obtaining {value.handle}</h2>
			<RecipeTable recipes={value.calcPath()} indexed='Step' emptyInfo='This is an fundamental element.'></RecipeTable>
		</>
	);
}