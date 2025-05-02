const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = mysql.createPool({
  host: '127.0.0.1',        
  user: process.env.DB_USER,              
  password: process.env.DB_PASS, 
  database: 'thorsten_music',
  charset: 'utf8mb4'
});

async function getConnection() {
    return await pool.getConnection();
  }


async function query(sql, params) {
    const connection = await getConnection();
    try {
      const [results] = await connection.execute(sql, params);
      return results;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
  //song queries
  async function getSongs() {
    const results = await query('SELECT * from song');
    return results;
  }

  async function getSongByYear(year) {
    const results = await query('SELECT * FROM song WHERE year = ?', [year]);
    return results;
  }
  async function getUserSongRatingsByYear(userID, year) {
    const results = await query('SELECT s.name, s.artist, s.category, s.songID, v.rating FROM song s LEFT JOIN vote v ON s.songID = v.songID AND v.userID = ? WHERE s.year = ?;', [userID, year]);
    return results;
  }

  

  async function deleteSong(id) {
    const results = await query('DELETE FROM song WHERE songID = ?', [id]);
    return results;
  }

async function addSong(name, artist, category, year, user) {
    try {
        const results = await query('INSERT INTO song (`name`, `artist`, `category`, `year`, `user`) VALUES (?, ?, ?, ?, ?);', [name, artist, category, year, user]);
        return results;
    } catch (error) {
        console.error('Database error during song insertion:', error);
        return null
    }
}


  async function updateSong(name, artist, category, year, user, id ) {
    const results = await query('UPDATE song SET name = ?, artist = ?, category = ?, year = ?, user = ? WHERE songID = ?;', [name, artist, category, year, user, id]);
    return results;
  }

  //user queries
  async function getUsers() {
    const results = await query('SELECT * from user');
    return results;
  }
  async function getUser(username) {
    const results = await query('SELECT * from user where username = ?', [username]);
    return results;
  }
  async function getUserFromID(id) {
    const results = await query('SELECT * from user where userID = ?', [id]);
    return results;
  }
  async function addUser(username, password) {
    let hashedPassword;
    if(password === '') {
      hashedPassword = "no-password";
    }else{
      hashedPassword = await hashPassword(password);
    }
    
    const results = await query('INSERT INTO user ( `username`, `password`) VALUES (?, ?);', [username, hashedPassword]);
    return results;
  }

  //vote queries
  async function addVotes(userID, votes) {
    const queries = votes.map(vote => {
      const rating = (vote.rating === '' || vote.rating === null) ? null : vote.rating;
        return query(
            `INSERT INTO vote (songID, userID, rating) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE rating = ?;`,
            [vote.songID, userID, rating, rating]
        );
    });

    const results = await Promise.all(queries);
    return results;
}
async function getVotes() {
  const results = await query(
      `SELECT vote.rating, user.username, song.name 
       FROM vote 
       JOIN song ON vote.songID = song.songID 
       JOIN user ON vote.userID = user.userID 
       WHERE vote.rating IS NOT NULL`
  );
  return results;
}
  async function getVotesByUserID(userID) {
    const results = await query("SELECT  vote.rating, user.username, song.name FROM vote JOIN song ON vote.songID = song.songID JOIN user ON vote.userID = user.userID where user.userID = ? AND vote.rating IS NOT NULL",
      [userID]
    );
    return results;
  }

  async function getResultsFromYear(year) {
    const results = await query("SELECT s.songID, s.name, s.artist, s.category, s.year, SUM(v.rating) AS total_rating\n" +
                "FROM song s\n" +
                "JOIN vote v ON s.songID = v.songID\n" +
                "WHERE s.year = ?\n" +
                "GROUP BY s.songID, s.name, s.artist, s.category, s.year\n" +
                "ORDER BY total_rating DESC;", [year]);
    return results;
  }
//feedback queries

async function getFeedback() {
  const results = await query("SELECT  * from feedback");
  return results;
}

async function addFeedback(text) {
  const results = await query('INSERT INTO feedback ( `text`) VALUES (?);', [text]);
  return results;
}

async function removeFeedback() {
  const results = await query('DELETE FROM feedback');
  return results;
}

//category queries
async function getCategory() {
  const results = await query("SELECT  * from category");
  return results;
}



//helper functions

async function hashPassword(password) {
  const saltRounds = 10; // Cost factor for hashing
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}




  module.exports = {
    getSongs,
    getSongByYear,
    deleteSong,
    addSong,
    updateSong,
    getUserSongRatingsByYear,
    getVotes,
    getUsers,
    getResultsFromYear,
    getUser,
    addUser,
    getUserFromID,
    addVotes,
    getFeedback,
    addFeedback,
    getVotesByUserID,
    removeFeedback,
    getCategory
  };
