const jwt = require("jsonwebtoken")




//middleware for protecting the login related routes
//redirect to login if the token is not verified
//else move forwrd

async function verifyUser(req, res, next) {
    //middleware to verify identity of logged in user for protected routes

    const token = await req.cookies.jwt;

    if (token) {

        //verify the token


        await jwt.verify(token, process.env.SECRET_KEY, (err, authData) => {
            if (err) {

                console.log("Token Verify Error!")
                res.redirect(302, "/login")



            }

            else {

                console.log("Token Verified!")

                req.user = authData
                console.log(authData)
                next();

            }
        })

    }

    //if the token is not present
    else {

        //next();
        res.redirect(302, "/login")
    }
}



//middleware to check if user is logged in 
// if logged in redirect to register dashboard

async function isUserLoggedIn(req, res, next) {
    const token = await req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (!err) {
                // The token is valid, user is logged in
                return res.redirect(302, '/register'); // Redirect to the dashboard or any other route
            }
            next(); // Continue to the next middleware
        });
    } else {
        next(); // Continue to the next middleware
    }
}



module.exports = {
    verifyUser, isUserLoggedIn

}