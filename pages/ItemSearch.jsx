import { useEffect, useState } from 'react';
import { Item, Recipes } from './db';
import ItemFull from './ItemFull';
import { ItemLink } from './ItemName';
import { RecipeTable } from './RecipeTable';
import './ItemSearch.css';
import './SearchBox.css';

function RecipeSearchResult({ keyword, children }) {
	const val = keyword.split('+');
	let res = [];
	for (let i = 1; i < val.length; i += 1) {
		const Ahandle = val.slice(0, i).join('+').trim();
		const Bhandle = val.slice(i).join('+').trim();
		const A = Item.loadByHandle(Ahandle);
		if (A == null) {
			continue;
		}

		const R = A.can_craft.filter(r => (
			(r.ingrA.handle == Ahandle && r.ingrB.handle == Bhandle) ||
			(r.ingrB.handle == Ahandle && r.ingrA.handle == Bhandle)
		));
		res = res.concat(R);
	}
	if (res.length == 0) {
		return children;
	}
	return (
		<div class="search-recipe">
			<h2>Matching Recipe</h2>
			{[<RecipeTable recipes={res} />]}
		</div>
	);
}

function SearchResult({ keyword, onClick }) {
	if (keyword == null || keyword == '') {
		return (
			<>
				<p className='search-item-info'>Type the name of the element you are interested in the search bar, and click "Search".</p>
			</>
		);
	}

	if (keyword.startsWith('?=')) {
		return (
			<RecipeSearchResult keyword={keyword.slice(2)}>
				<p className='search-item-info'>No match found.</p>
			</RecipeSearchResult>
		);
	}

	const exact_match = Item.loadByHandle(keyword);
	if (exact_match != null) {
		return (
			<>
				{keyword.includes('+') && <RecipeSearchResult keyword={keyword} />}
				{[<ItemFull key={exact_match.id} value={exact_match}></ItemFull>]}
			</>
		);
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

	if (keyword.includes('+')) {
		return (
			<RecipeSearchResult keyword={keyword}>
				<p className='search-item-info'>No match found.</p>
			</RecipeSearchResult>
		);
	}

	return <p className='search-item-info'>No match found.</p>;
}

export default function ItemSearch() {
	const search_by_hash = decodeURIComponent(location.hash.slice(1));
	const [searchKeyword, setSearchKeyword] = useState(search_by_hash);
	const [searchTerm, setSearchTerm] = useState(search_by_hash);

	useEffect(() => {
		const handler = () => {
			const search_by_hash = decodeURIComponent(location.hash.slice(1));
			setSearchKeyword(search_by_hash);
			setSearchTerm(search_by_hash)
		};

		window.addEventListener('hashchange', handler);
		return () => {
			window.removeEventListener('hashchange', handler);
		}
	}, [setSearchTerm, setSearchKeyword]);

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

	const handleInputKeydown = (event) => {
		if (event.code == 'Enter') {
			handleSearch();
		}
	};

	return (
		<div>
			<h1 className='search-item-title'>Search Elements</h1>
			<p className='search-item-subtitle'>...and Their Recipes In The Largest Dictionary of The Game <a target='_blank' href='https://neal.fun/infinite-craft/'>Infinite Craft</a>.</p>
			<div className="search-box-container">
				<input
					className="search-input"
					type="text"
					placeholder="Element Name or ?=A+B..."
					value={searchTerm}
					onChange={handleChange}
					onKeyDown={handleInputKeydown}
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