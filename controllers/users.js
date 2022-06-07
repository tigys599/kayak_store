const User = require('../models/user')

module.exports.registerForm = (req, res) => {
    res.render('users/register');
}

module.exports.registerSubmit = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Kayak4Life!');
            res.redirect('/launchLocations');
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('register')
    }

}

module.exports.loginRender = (req, res) => {
    res.render('users/login');
}

module.exports.loginSubmit = (req, res) => {
    req.flash('success', 'Welcome back!')
    const redirectUrl = req.session.returnTo || '/launchLocations'
    res.redirect(redirectUrl)
}

module.exports.goLogout = (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out.')
    res.redirect('/login')
}
