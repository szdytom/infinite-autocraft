# Infinite Autocraft

This is a script to explore the game [Infinite Craft](https://neal.fun/infinite-craft/).

## Structure

- `bstruct/`: My library to encode/decode JavaScript values into/from binary (shared between local and web app).
- `pages/`: A react APP, the frontend of the explored result.
- `src/index.mjs`: The main explore script, does crafting and saves result into SQLite database.
- `src/pg.mjs` and `src/token-bucket.mjs`: My simple implementations of common data structures used (shared between local and web app).
- `src/export.mjs`: Generated a line of code that can override data of the original Infinite Craft frontend (copy and execute the output in console).
- `src/create-index.mjs`: Encode data for the frontend app. 
- `src/find-path.mjs`: Calculate crafting depth and ensures the database is correct.
- `src/data-typedef.mjs`: defines the structure of binary data loaded by the frontend (shared between local and web app).