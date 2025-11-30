// Script to retrieve books metadata from Open Library API and use it to populate the books table of our database
// Run 'npm install pg dotenv --legacy-peer-deps' and then 'node retrieve_book_metadata_script.js'
// NOTE: Don't import or call this script from the app code (is standalone)

require("dotenv").config({ path: "../.env" }); // Load .env file
const { Pool } = require("pg");

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function retrieveAndPopulateBooks() {
    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");

        const sleep = (ms) => new Promise(res => setTimeout(res, ms));

        // Response will include an array of objects, a list of books with their details
        // Details we will use are key, title, first_publish_year, cover_i, subject, author_name
        // Note: when using cover_i later in app, embed into this url: "https://covers.openlibrary.org/b/id/<cover_i>-M.jpg"
        const book_list_url = `https://openlibrary.org/search.json?q=title:*&sort=trending&limit=75&language=eng&fields=key,title,author_name,first_publish_year,cover_i,subject`;

        // Get book list with details and store in raw_book_list
        const books_res = await fetch(book_list_url);
        const books_json = await books_res.json();
        const raw_book_list = books_json.docs;

        // For each book, store the fields we need and also retrieve the book's description and genres, then insert record into database
        for (const book of raw_book_list) {
            await sleep(200); // to avoid rate limits

            const olid = (book.key).substring(7);
            const title = book.title;
            const publish_year = book.first_publish_year;
            const cover_image = book.cover_i;
            const authors = book.author_name;
            let description = "";
            let genres = [];

            //Retrieve descriptions and genres of books
            const descr_genre_url = `https://openlibrary.org/works/${olid}.json`;
            const descr_genre_res = await fetch(descr_genre_url);
            const descr_genre_json = await descr_genre_res.json();

            description = descr_genre_json?.description?.value || descr_genre_json?.description || "";

            //Need to filter subjects field since it returns a very long list of topics, themes, etc. and not just genres
            const subjects = descr_genre_json.subjects || [];
            const topLevel = ["Fiction","Nonfiction","Fantasy","Romance","Science Fiction","Mystery","Biography","History","Drama","Poetry","Classic Literature",];
            genres = subjects.filter(s => s.includes("/") || topLevel.includes(s) || /^[A-Z ]+$/.test(s));

            // Create new record in our database for the book
            const queryText = `INSERT INTO books (olid, title, description, publish_year, cover_image, genres, authors, rating_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (olid) DO NOTHING;`;
            const values = [olid, title, description, publish_year, cover_image, genres, authors, 0];
            try {
                await client.query(queryText, values);
                console.log(`Inserted: ${title}`);
            } catch (err) {
                console.error(`Failed to insert ${title}:`, err);
            }
        }
        await client.query("COMMIT");
    } catch (err) {
        if (client) {
            await client.query("ROLLBACK");
        }
        console.error("Error retrieving/populating books: ", err);
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
    }
}

// Call the above function
retrieveAndPopulateBooks();