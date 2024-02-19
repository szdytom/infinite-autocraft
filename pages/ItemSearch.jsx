import { useState } from 'react';
import { Item, Recipes } from './db';
import ItemFull from './ItemFull';
import { ItemLink } from './ItemName';
import './ItemSearch.css';
import './SearchBox.css';

function SearchResult({ keyword, onClick }) {
	if (keyword == null || keyword == '') {
		return (
			<>
				<p className='search-item-info'>Type the name of the element you are interested in the search bar, and click "Search".</p>
			</>
		);
	}

	const exact_match = Item.loadByHandle(keyword);
	if (exact_match != null) {
		return [<ItemFull key={exact_match.id} value={exact_match}></ItemFull>];
	}

	const contain_match = Item.findByHandleContains(keyword.trim());
	if (contain_match.length > 0) {
		const display_limit = 10;
		if (contain_match.length > display_limit) {
			const more = contain_match.length - display_limit;
			const displays = contain_match.slice(0, display_limit);
			return (
				<p className='search-item-info'>
					<>No exact match found, similar elements are </>
					{displays.map((x) => (
						<span key={x.id}>
							<ItemLink item={x} onClick={onClick} />
							<>, </>
						</span>
					))}
					<>...and {more} more.</>
				</p>
			);
		} else if (contain_match.length == 1) {
			return (
				<p className='search-item-info'>No exact match found, similar element is <ItemLink item={contain_match[0]} onClick={onClick} />.</p>
			);
		} else {
			return (
				<p className='search-item-info'>
					<>No exact match found, similar elements are </>
					{contain_match.map((x, i) => (
						<span key={x.id}>
							{i > 0 && ', '}
							{i == contain_match.length - 1 && 'and '}
							<ItemLink item={x} onClick={onClick} />
						</span>
					))}
					<>.</>
				</p>
			)
		}
	}
	return <p className='search-item-info'>No match found.</p>;
}

export default function ItemSearch() {
	const search_by_hash = location.hash.slice(1);
	const [searchKeyword, setSearchKeyword] = useState(search_by_hash);
	const [searchTerm, setSearchTerm] = useState(search_by_hash);

	const makeSearch = (term) => {
		setSearchKeyword(term);
		window.location.hash = '#' + term;
	};

	const handleSearch = () => {
		makeSearch(searchTerm);
	};

	const handleLucky = () => {
		const keyword = Item.getRandomHandle();
		setSearchTerm(keyword);
		makeSearch(keyword);
	};

	const handleChange = (e) => {
		setSearchTerm(e.target.value);
	};

	const handleLinkClick = (item) => {
		setSearchTerm(item.handle);
		makeSearch(item.handle);
	};

	return (
		<div>
			<h1 className='search-item-title'>Search Elements</h1>
			<p className='search-item-subtitle'>...and Their Recipes In The Largest Dictionary of The Game <a target='_blank' href='https://neal.fun/infinite-craft/'>Infinite Craft</a>.</p>
			<div className="search-box-container">
				<input
					className="search-input"
					type="text"
					placeholder="Element Name..."
					value={searchTerm}
					onChange={handleChange}
				/>
				<button className="search-button" onClick={handleSearch}>
					Search
				</button>
				<button className="lucky-button" onClick={handleLucky}>
					I'm Feeling Lucky
				</button>
			</div>
			<span className='total-number-info'>{Item.count} elements, {Recipes.count} recipes.</span>
			<div className='search-result'>
				<SearchResult keyword={searchKeyword} onClick={handleLinkClick} />
			</div>
		</div>
	);
};