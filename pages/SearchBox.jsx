import { useState } from 'react';
import './SearchBox.css';

export default function SearchBox({ onSearch }) {
	const [searchTerm, setSearchTerm] = useState('');

	const handleChange = (event) => {
		const { value } = event.target;
		setSearchTerm(value);
	};

	const handleSearch = () => {
		onSearch(searchTerm);
	};

	return (
		<div className="search-box-container">
			<input
				className="search-input"
				type="text"
				placeholder="Search Item..."
				value={searchTerm}
				onChange={handleChange}
			/>
			<button className="search-button" onClick={handleSearch}>
				Search
			</button>
		</div>
	);
}