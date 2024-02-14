import './ItemName.css';

export function ItemName({item}) {
	return <span className='item-name'>{item.toString()}</span>
}

export function ItemLink({item, onClick}) {
	const clickHandler = () => {
		onClick(item);
	};

	return <span className='item-link' onClick={clickHandler}>{item.toString()}</span>
}
