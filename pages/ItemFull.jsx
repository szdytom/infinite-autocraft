import './info-table.css';
import { RecipeDisplay } from './RecipeDisplay';

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
			<h2>Obtaining</h2>
			<ul>
				{value.craft_by.map(x => <li><RecipeDisplay value={x}></RecipeDisplay></li>)}
			</ul>
			<h2>Usage</h2>
			<ul>
				{value.can_craft.map(x => <li><RecipeDisplay value={x}></RecipeDisplay></li>)}
			</ul>
			<h2>Possible Obtaining Path</h2>
			<ol>
				{value.calcPath().map(x => <li><RecipeDisplay value={x}></RecipeDisplay></li>)}
			</ol>
		</>
	);
}