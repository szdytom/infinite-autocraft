import { useState } from 'react'

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
		<div>
			<input
				type="text"
				placeholder="Search Item..."
				value={searchTerm}
				onChange={handleChange}
			/>
			<button onClick={handleSearch}>Search</button>
		</div>
	);
}