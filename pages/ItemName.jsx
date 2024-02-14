import './ItemName.css';

export function ItemName({item}) {
	return <span className='item-name'>{item.toString()}</span>
}
