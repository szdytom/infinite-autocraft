import { useState } from 'react';
import SearchBox from './SearchBox';
import { Item } from './db';
import ItemFull from './ItemFull';

export default function ItemSearch() {
	const [searchResult, setSearchResult] = useState(null);

	const handleSearch = (x) => {
		setSearchResult(Item.loadByHandle(x));
	};

	return (
		<div>
			<h1>Search Items</h1>
			<SearchBox onSearch={handleSearch} />
			<div className='search-result'>
				{searchResult == null ? null : <ItemFull value={searchResult}></ItemFull>}
			</div>
		</div>
	);
};