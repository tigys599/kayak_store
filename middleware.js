const Launch = require('./models/launchsites');
const AppError = require('./utils/AppError');
const { siteSchema, reviewSchema } = require('./joiSchemas.js');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {
        req.flash('error', 'You must login first!')
        return res.redirect('/login')
    }
    next();
}

module.exports.validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next()
    }
}

module.exports.validateForm = (req, res, next) => {


    const { error } = siteSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next()
    }
}

module.exports.isAuthor = async (req, res, next) => {

    const locationSite = await Launch.findById(req.params.id);
    if (!locationSite.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission for that.');
        return res.redirect('/');
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {

    const review = await Review.findById(req.params.reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission for that.');
        return res.redirect("/");
    }
    next();
}

module.exports.findSite = async (req, res, next) => {
    const locationSite = await Launch.findById(req.params.id);
    if (!locationSite) {
        req.flash('error', 'Cannot find that Launch Location!')
        return res.redirect('/launchLocations')
    }
    next();
}