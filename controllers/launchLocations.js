const Launch = require('../models/launchsites')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const { cloudinary } = require('../cloudinary/index.js')
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })




module.exports.index = async (req, res, next) => {
    const locationSite = await Launch.find({});
    res.render('locations/index.ejs', { locationSite });
}

module.exports.createNew = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.locationSite.location,
        limit: 1
    }).send()
    const locationSite = new Launch(req.body.locationSite);
    locationSite.geometry = geoData.body.features[0].geometry;
    // map over array of images and return path and filename
    locationSite.image = req.files.map(f => ({ url: f.path, filename: f.filename }))
    locationSite.author = req.user._id
    await locationSite.save();
    req.flash('success', 'Successfully created a new Launch Site!')
    res.redirect(`launchLocations/${locationSite._id}`);
}

module.exports.newLaunchForm = (req, res, next) => {

    res.render('locations/new');

}

module.exports.showSite = async (req, res) => {
    const locationSite = await (await Launch.findById(req.params.id)
        .populate({ path: 'reviews', populate: { path: 'author' } })).populate('author');

    res.render('locations/show', { locationSite });
}


module.exports.editSite = async (req, res) => {
    const locationSite = await Launch.findById(req.params.id);
    res.render('locations/edit', { locationSite });
}

module.exports.editSiteSubmit = async (req, res) => {
    const locationSite = await Launch.findById(req.params.id)
    await Launch.findByIdAndUpdate(req.params.id, { ...req.body.locationSite })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    locationSite.image.push(...imgs);
    await locationSite.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }

        await locationSite.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } })
    }

    req.flash('success', 'Successfully updated Launch Site!')
    res.redirect(`/launchLocations/${locationSite._id}`);


}

module.exports.delete = async (req, res) => {
    await Launch.findById(req.params.id)
    await Launch.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted Launch Location!')
    res.redirect(`/launchLocations/`);
}
