const express = require('express');
const passport = require('passport');
const path = require('path');
const session = require('express-session');
const { engine } = require('express-handlebars');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('./database');
const Handlebars = require('handlebars');
const sessionMiddleware = session({ 
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
});

const configureMiddleware = (app) => {
    app.use(express.json());
    app.engine(
        "handlebars",
        engine({
          extname: "handlebars",
          defaultLayout: false,
          layoutsDir: "public/pages"
        })
      );
      Handlebars.registerHelper('add', function(a, b) {
        return a + b;
    });
    
    app.set('view engine', 'handlebars');
    app.set('views', path.join(__dirname, '../public/pages'));
    app.use(express.static(path.join(__dirname, '../public')));

  app.use(express.urlencoded({ extended: true })); 
  
  app.use(sessionMiddleware)
  configurePassport();
  
  app.use(passport.initialize());
  app.use(passport.session());
};
const configurePassport = () => {

    passport.use(new LocalStrategy(
        async (username, password, done) => {
            try {
                console.log(`Attempting to log in user: ${username}`); 

                const users = await db.getUser(username); 
            const user = users[0]; 
            console.log(user);
                if (!user) {
                    console.log('User not found'); 
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if (user.password === "no-password") {
                    // If no password is set, the user can log in without one
                    return done(null, user);
                }

                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    console.log('Password did not match'); 
                    return done(null, false, { message: 'Incorrect password.' });
                }

                console.log(`User ${username} logged in successfully`); 
                return done(null, user);
            } catch (err) {
                console.error('Error during authentication:', err); 
                return done(err);
            }
        }
    ));
    passport.serializeUser((user, done) => {
        done(null, user.userID);
      });
      
      passport.deserializeUser(async (id, done) => {
        try {
            const users = await db.getUserFromID(id);
            const user = users[0];
            
            done(null, user);
        } catch (err) {
            done(err);
        }
      });
};

module.exports = { configureMiddleware, sessionMiddleware };