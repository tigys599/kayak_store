const Review = require('../models/review');
const Campground = require('../models/campground')

module.exports.submit = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    review.author = req.user._id
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/launchLocations/${campground._id}`);

}

module.exports.delete = async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/launchLocations/${id}`)
}