const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };
const LaunchLocationSchema = new Schema({
    title: String,
    image: [{
        url: String,
        filename: String
    }],
    price: Number,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },

    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

LaunchLocationSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/launchLocations/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 69)}...</p>`
});



// this mongoose middleware will remove all reviews if a launch location is deleted
LaunchLocationSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Launch', LaunchLocationSchema);



