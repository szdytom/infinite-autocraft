# Infinite Autocraft

This is a script to explore the game [Infinite Craft](https://neal.fun/infinite-craft/).

## Getting Started

Install Node.JS and SQLite3, then run:

```
git clone https://github.com/szdytom/infinite-autocraft
cd infinite-autocraft
npm i
sqlite3 craft.sqlite < init.sql
node src/index.mjs
```

That it! Find your result in the SQLite database `craft.sqlite`.

Please open a dissusion if you want to share your progress!

## Dictionary

You need to import a English Word dictionary into table `EnglishWords`. Then run

```sql
UPDATE Items SET
freq = (SELECT freq FROM EnglishWords WHERE lemma = LOWER(Items.handle) LIMIT 1)
WHERE freq IS NULL;
```