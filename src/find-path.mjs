import Database from 'better-sqlite3';
import { PriorityQueue } from './pq.mjs';

const db = new Database('./craft.sqlite');

db.prepare('UPDATE Items SET dep = NULL WHERE dep IS NOT NULL').run();

const NOTHING_ID = db.prepare('SELECT id FROM Items WHERE handle=?').get('Nothing').id;

const update_item_dep = db.prepare(`
UPDATE Items SET dep = $dep WHERE id = $id
`);

const get_relevant_recipe = db.prepare(`
SELECT
	R.result_id,
	MAX(A.dep, B.dep) + 1 AS new_dep
FROM Recipes AS R 
JOIN Items AS A ON A.id = R.ingrA_id
JOIN Items AS B ON B.id = R.ingrB_id
JOIN Items AS C ON C.id = R.result_id
WHERE (
	(R.ingrA_id = $x OR R.ingrB_id = $x) AND
	R.result_id IS NOT NULL AND 
	A.dep IS NOT NULL AND
	B.dep IS NOT NULL AND
	C.dep IS NULL
);
`);

async function main() {
	let q = new PriorityQueue();
	let dis = [];
	for (let i = 1; i <= 4; ++i) {
		dis[i] = 0;
		q.push(i, 0);
	}
	dis[NOTHING_ID] = 0;

	while (!q.empty()) {
		let x = q.pop()[0];
		update_item_dep.run({ dep: dis[x], id: x });

		const edges = get_relevant_recipe.all({ x: x });
		for (const edge of edges) {
			const y = edge.result_id;
			const z = edge.new_dep;
			if (dis[y] == null || dis[y] > z) {
				dis[y] = z;
				q.push(y, -z);
			}
		}
	}
}

main();

process.on('exit', () => db.close());
process.on('SIGINT', () => process.exit(1));
process.on('SIGHUP', () => process.exit(1));
process.on('SIGTERM', () => process.exit(1));
