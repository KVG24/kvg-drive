const path = require("node:path");
const express = require("express");
const expressSession = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("./generated/prisma");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const router = require("./routes/router");
const bcrypt = require("bcryptjs");
const db = require("./db/queries");

// Initiate main express app
const app = express();

// Use EJS as views engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Static assets handling
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

// Initiate prisma session
app.use(
    expressSession({
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000, // ms
        },
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        store: new PrismaSessionStore(new PrismaClient(), {
            checkPeriod: 2 * 60 * 1000, //ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }),
    })
);

// Initiate passport
app.use(passport.session());

// Parsing json and form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Router
app.use("/", router);

// Authentication
passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await db.getUser(username);

            if (!user) {
                return done(null, false, { message: "Incorrect username" });
            }

            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return done(null, false, { message: "Incorrect password" });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.getUserById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

// Live app in localhost
app.listen(3000, (error) => {
    if (error) {
        throw error;
    }
    console.log("app listening on port 3000!");
    console.log("___________________________");
});
