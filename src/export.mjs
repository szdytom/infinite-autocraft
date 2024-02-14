import Database from 'better-sqlite3';

const db = new Database('./craft.sqlite', { readonly: true });

const get_items = db.prepare(`
SELECT * FROM Items WHERE (mask & 1) = 0 ORDER BY dep ASC;
`);

const rows = get_items.all();
let elements = rows.map(r => {
	return {
		"text": r.handle,
		"emoji": r.emoji,
		"discovered": !!r.is_new,
	};
});

console.log(`localStorage.setItem('infinite-craft-data', ${JSON.stringify(JSON.stringify({ elements }))})`);

process.on('exit', () => db.close());
process.on('SIGINT', () => process.exit(1));
process.on('SIGHUP', () => process.exit(1));
process.on('SIGTERM', () => process.exit(1));
