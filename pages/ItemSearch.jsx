import { useState } from 'react';
import { Item } from './db';
import ItemFull from './ItemFull';
import { ItemLink } from './ItemName';
import './ItemSearch.css';
import './SearchBox.css';

function SearchResult({ keyword, onClick }) {
	if (keyword == null || keyword == '') {
		return null;
	}

	const exact_match = Item.loadByHandle(keyword);
	if (exact_match != null) {
		return <ItemFull value={exact_match}></ItemFull>;
	}

	const contain_match = Item.findByHandleContains(keyword);
	if (contain_match.length > 0) {
		const display_limit = 10;
		if (contain_match.length > display_limit) {
			const more = contain_match.length - display_limit;
			const displays = contain_match.slice(0, display_limit);
			return (
				<p className='search-item-info'>
					<>No exact match found, similiar elements are </>
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
				<p className='search-item-info'>No exact match found, similiar elements is <ItemLink item={contain_match[0]} onClick={onClick} />.</p>
			);
		} else {
			return (
				<p className='search-item-info'>
					<>No exact match found, similiar elements are </>
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
	const [searchKeyword, setSearchKeyword] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');

	const handleSearch = () => {
		setSearchKeyword(searchTerm);
	};

	const handleLucky = () => {
		const keyword = Item.getRandomHandle();
		setSearchTerm(keyword);
		setSearchKeyword(keyword);
	};

	const handleChange = (e) => {
		setSearchTerm(e.target.value);
	};

	const handleLinkClick = (item) => {
		setSearchTerm(item.handle);
		setSearchKeyword(item.handle);
	};

	const db_size = Item.count;

	return (
		<div>
			<h1 className='search-item-title'>Search Elements</h1>
			<p className='search-item-subtitle'>...And Their Recipes In The Largest Dictionary of The Game <a href='https://neal.fun/infinite-craft/'>Infinite Craft</a> With {db_size} Entries.</p>
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
			<div className='search-result'>
				<SearchResult keyword={searchKeyword} onClick={handleLinkClick} />
			</div>
		</div>
	);
};