if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const port = process.env.PORT || 3000
const express = require('express');
const engine = require('ejs-mate');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStategy = require('passport-local');
const AppError = require('./utils/AppError');
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/kayakstore'


const MongoStore = require('connect-mongo');




// Starting the database
main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
    console.log('mongoose connected');
}
// routing paths
app.use(express.static(path.join(__dirname, 'public')));

const launchRoutes = require('./routes/launchLocations');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const { date, func } = require('joi');

app.engine('ejs', engine);

// middleware

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("seeds/pics"));
// remove prohibited inputs from users
app.use(mongoSanitize())

const secret = process.env.SECRET || "thisisoffline"

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600, // time period in seconds
    crypto: {
        secret
    }
});

const sessionConfig = {
    store,
    name: '_sess',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
    // "https://cdn.jsdelivr.net"
}
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet({ crossOriginEmbedderPolicy: false }));

// const scriptSrcUrls = [


//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",

//     "https://res.cloudinary.com/dv5vm4sqh/"
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",

//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",

//     "https://res.cloudinary.com/dv5vm4sqh/"
// ];
// const connectSrcUrls = [
//     "https://*.tiles.mapbox.com",
//     "https://api.mapbox.com/",
//     "https://events.mapbox.com",
//     "https://res.cloudinary.com/dv5vm4sqh/"
// ];
// const fontSrcUrls = ["https://res.cloudinary.com/tigys/"];

// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/tigys/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
//                 "https://images.unsplash.com/"
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//             mediaSrc: ["https://res.cloudinary.com/dv5vm4sqh/"],
//             childSrc: ["blob:"]
//         }
//     })
// );


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    if (!['/login', '/', '/logout', '/launchLocation/:id/edit', '/launchLocation/new', '/register'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    next();
})





app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use('/launchLocations', launchRoutes)
app.use('/launchLocations/:id/reviews', reviewsRoutes)
app.use('/', userRoutes)

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/dashboard', (req, res) => {
    res.render('dash');
});

app.all('*', (req, res, next) => {
    next(new AppError('These are not the URL you are looking for.', 404))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = "Something went wrong!"
    res.status(status).render('error', { err })

})


app.listen(port, () => {
    console.log(`Listening on ${port}`);
})