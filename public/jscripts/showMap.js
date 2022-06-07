mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: locationSite.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
});

// add zoom and rotation controls to the map
map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(locationSite.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${locationSite.title}<h3>`
            )
    )
    .addTo(map)

