const jwt = require("jsonwebtoken")



//middleware to verify ADMIN routes

async function verifyAdmin(req, res, next) {

    const token = await req.cookies.jwt;

    if (token) {

        //verify the token


        await jwt.verify(token, process.env.SECRET_KEY, (err, authData) => {
            if (err) {

                console.log("ADMIN Verify Error!")
                res.redirect(302, "/admin")



            }

            else {

                console.log("ADMIN Verified!")
                console.log(authData)

                if (authData.role === "admin") {
                    //if the admin role is verified
                    req.user = authData
                    console.log(authData)
                    next();
                }
                else {
                    console.log("ADMIN Verify Error!")
                    res.redirect(302, "/admin")
                }
                // req.user=authData

                // console.log(authData)
                // next();

            }
        })

    }

    //if the token is not present
    else {

        //next();
        res.redirect(302, "/admin")
    }
}



async function isAdminLoggedIn(req, res, next) {

    //middleware to check admin is logged in
    //if logged in redirect to adminDashboard

    const token = await req.cookies.jwt;

    if (token) {
        await jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (!err && decoded.role === "admin") {
                // The token is valid, user is logged in
                return res.redirect(302, '/adminDashboard'); // Redirect to the dashboard or any other route
            }
            next(); // Continue to the next middleware
        });
    } else {
        next(); // Continue to the next middleware
    }
}







module.exports = { verifyAdmin, isAdminLoggedIn }