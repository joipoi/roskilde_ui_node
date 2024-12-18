const express = require('express');
const db = require('../database');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('login'); 
});
router.get('/login', (req, res) => {
    res.render('login'); 
});

router.get('/admin', ensureAdmin, async (req, res) => {
    try {
        const db_data = await db.getSongs();
        const data = { songs: db_data};
        res.render('admin', data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/results', ensureAdmin, async (req, res) => {
    try {
        const db_data = await db.getResultsFromYear(2024);
        const data = { results: db_data };
        res.render('results', data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
router.get('/user', async (req, res) => {
    if (!req.isAuthenticated()) { 
        return res.redirect('/login'); 
      }
    let isAdmin = req.user.userID == process.env.ADMIN_ID;
    try {
        const db_data = await db.getUserSongRatingsByYear(req.user.userID, 2024);
        const data = { songs: db_data, isAdmin: isAdmin };
        res.render('user', data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/userEditing', ensureAdmin, async (req, res) => {
    try {
        const db_data = await db.getUsers();
        const data = { users: db_data };
        res.render('userEditing', data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
router.get('/votes', ensureAdmin, async (req, res) => {
    try {
        const db_data = await db.getVotes(1,2024);
        const data = { votes: db_data };
        res.render('votes', data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
router.get('/feedback', ensureAdmin, async (req, res) => {
    try {
        const db_data = await db.getFeedback();
        const data = { feedback: db_data };
        res.render('feedback', data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//helper functions

function ensureAdmin(req, res, next) {
    if (!req.isAuthenticated()) { 
        return res.redirect('/login'); 
      }
    if (req.isAuthenticated() && req.user.userID == process.env.ADMIN_ID) {
        return next(); // User is authenticated and is the admin
    }
    res.status(403).send('Forbidden: Admin access required');
}

module.exports = router;
