const jwt=require("jsonwebtoken")



//middleware for protecting the login related routes
//redirect to login if the token is not verified
//else move forwrd

async function verifyJC(req, res, next) {
    try {
        const token = req.cookies.jwt;
        if (token) {
            const authData = await jwt.verify(token, process.env.SECRET_KEY);
            if (authData.role === "jc" || authData.role === "admin") {
                req.user = authData;
                return next();
            } else {
                return res.redirect(302, "/jcLogin");
            }
        } else {
            return res.redirect(302, "/jcLogin");
        }
    } catch (err) {
        console.log("Token Verify Error!", err);
        return res.redirect(302, "/jcLogin");
    }
}



async function isJCLoggedIn(req, res, next) {
    try {
        const token = req.cookies.jwt;
        if (token) {
            const decoded = await jwt.verify(token, process.env.SECRET_KEY);
            if (decoded.role === "jc" || decoded.role === "admin") {
                return res.redirect(302, '/jc');
            }
        }
        next();
    } catch (err) {
        console.log("Token Verify Error!", err);
        next();
    }
}




module.exports={verifyJC,isJCLoggedIn}