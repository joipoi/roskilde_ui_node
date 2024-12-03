const express = require('express');
const db = require('../database');
const passport = require('passport');
const router = express.Router();

router.post('/insertSong', (req, res) => {
    let data = req.body;
    db.addSong(data.name, data.artist, data.category, 2024);
    
    return res.json({ response: "added song with name " + data.name  }); 
});

router.post('/deleteSong', (req, res) => {
    let data = req.body;
    db.deleteSong(data.songID);
    
    return res.json({ response: "deleted song with id " + data.songID  }); 
});
router.post('/registerUser', (req, res) => {
    let data = req.body;
    db.addUser(data.username, data.password);
    
    return res.json({ response: "registered user with username " + data.username  }); 
});

router.post('/login', (req, res, next) => {

    passport.authenticate('local', (err, user, info) => {
        console.log("Passport is starting authentication");
        
        if (err) {
            console.log("Error during authentication:", err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }

        if (!user) {
            console.log("Authentication failed:", info.message); 
            return res.status(401).json({ success: false, message: info.message }); 
        }

        req.logIn(user, (err) => {
            if (err) {
                console.log("Error logging in user:", err);
                return res.status(500).json({ success: false, message: 'Login failed.' });
            }

            console.log("User logged in successfully:");
            return res.json({ success: true }); 
        });
    })(req, res, next);
});

router.post('/updateVotes', (req, res) => {
    let votes = req.body.votes;
    let userID = req.user.userID;

    db.addVotes(userID, votes);
    
    return res.json({ response: "updated votes"}); 
});
router.post('/addFeedback', (req, res) => {
    let text = req.body.text;

    db.addFeedback(text);
    
    return res.json({ response: "added feedback"}); 
});
router.post('/getVotesByUserID', async (req, res) => {
    let userID = req.body.userID;
    let response;

    try {
        if (userID === "alla") {
            response = await db.getVotes();
        } else {
            response = await db.getVotesByUserID(userID);
        }
        return res.json({ response: response });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while fetching votes.' });
    }
});

module.exports = router;