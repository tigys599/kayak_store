const Review = require('../models/review');
const Launch = require('../models/launchsites')

module.exports.submit = async (req, res) => {
    const locationSite = await Launch.findById(req.params.id);
    const review = new Review(req.body.review)
    locationSite.reviews.push(review)
    review.author = req.user._id
    await review.save();
    await locationSite.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/launchLocations/${locationSite._id}`);

}

module.exports.delete = async (req, res) => {
    const { id, reviewId } = req.params
    await Launch.findByIdAndUpdate(id, { $pull: { reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/launchLocations/${id}`)
}