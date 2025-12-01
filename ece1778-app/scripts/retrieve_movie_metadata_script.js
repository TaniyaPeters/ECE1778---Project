// Script to retrieve movies metadata from TMDB and use it to populate the movies table of our database
// Run 'npm install pg dotenv --legacy-peer-deps' and then 'node retrieve_movie_metadata_script.js'
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

const TMDB_READ_TOKEN = process.env.TMDB_API_READ_ACCESS_TOKEN;

// Options for get request to TMDB, return a json and pass the read access token
const options_get = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_READ_TOKEN}`
  }
};

async function retrieveAndPopulateMovies() {
  try {
    // For getting the list of genres and their mappings to their ids
    // Need this since genres in above details are provided as ids
    const genres_url = 'https://api.themoviedb.org/3/genre/movie/list?language=en';

    // Get genre mappings of ids to genre names and create a Map
    const genres_res = await fetch(genres_url, options_get);
    const genres_json = await genres_res.json();
    const genreMap = new Map(genres_json.genres.map(genre => [genre.id, genre.name]));

    // Get pages 1-5 pages of movies (100 movies in total)
    for (let page = 1; page <= 5; page++) {
      console.log(`Processing page ${page}...`);

      // Response will include an array of objects, a list of movies with their details
      // Details we will use are id, title, overview, release_date, poster_path, genre_ids
      // Note: when using poster_path later in app, embed into this url: "https://image.tmdb.org/t/p/w500/<poster_path>"
      const movie_list_url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc`;

      // Get movie list with details and store in raw_movie_list
      const movies_res = await fetch(movie_list_url, options_get);
      const movies_json = await movies_res.json();
      const raw_movie_list = movies_json.results;

      // For each movie, keep the fields we need, replace genre ids with genres, and also retrieve the movie's cast
      for (const movie of raw_movie_list) {
        const tmdb_id = movie.id;
        const title = movie.title;
        const description = movie.overview;
        const release_date = movie.release_date;
        const poster_path = movie.poster_path;
        const genres_updated = (movie.genre_ids || []).map(genreId => genreMap.get(genreId));
        let cast = [];

        // For getting the cast for a given movie id
        const cast_url = `https://api.themoviedb.org/3/movie/${tmdb_id}/credits?language=en-US`;
        const cast_res = await fetch(cast_url, options_get);
        const cast_json = await cast_res.json();
        const credits = cast_json.cast || [];
        for (let i = 0; i < credits.length && i < 4; i++) {
          cast.push(credits[i].name);
        }

        // Create new record in our database for the movie
        const queryText = `INSERT INTO movies (tmdb_id, title, description, release_date, poster_path, genres, cast_members, rating_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (tmdb_id) DO NOTHING;`;
        const values = [tmdb_id, title, description, release_date, poster_path, genres_updated, cast, 0];
        try {
          await pool.query(queryText, values);
          console.log(`Inserted: ${title}`);
        } catch (err) {
          console.error(`Failed to insert ${title}:`, err);
        }
      }
    }
  } catch (err) {
    console.error("Error retrieving/populating movies: ", err);
  } finally {
    await pool.end();
  }
}

// Call the above function
retrieveAndPopulateMovies();