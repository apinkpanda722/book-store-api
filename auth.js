const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const decodeJwt = (req, res) => {
    try {
        let token = req.headers["authorization"];
        let decodedJwt = jwt.verify(token, process.env.PRIVATE_KEY);
        return decodedJwt;
    } catch (err) {
        console.log(err.name);
        console.log(err.message);
        return err;
    }
}

module.exports = decodeJwt;