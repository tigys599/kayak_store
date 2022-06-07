const Campground = require('../models/campground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const { cloudinary } = require('../cloudinary/index.js')
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('locations/index.ejs', { campgrounds });
}

module.exports.createNew = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    // map over array of images and return path and filename
    campground.image = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id
    await campground.save();
    req.flash('success', 'Successfully created a new ...!')
    res.redirect(`launchLocations/${campground._id}`);
}

module.exports.newCampForm = (req, res, next) => {

    res.render('launchLocations/new');

}

module.exports.showCamp = async (req, res) => {
    const campground = await (await Campground.findById(req.params.id)
        .populate({ path: 'reviews', populate: { path: 'author' } })).populate('author');

    res.render('launchLocations/show', { campground });
}


module.exports.editCamp = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('launchLocations/edit', { campground });
}

module.exports.editCampSubmit = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.image.push(...imgs);
    await campground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }

        await campground.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } })
    }

    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/launchLocations/${campground._id}`);


}

module.exports.delete = async (req, res) => {
    await Campground.findById(req.params.id)
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted Launch Location!')
    res.redirect(`/launchLocations/`);
}
