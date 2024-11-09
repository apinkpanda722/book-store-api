const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const join = (req, res) => {
    const { email, password } = req.body;

    let sql = 'INSERT INTO users (email, password, salt) VALUES (?,?,?)';

    const salt = crypto.randomBytes(10).toString("base64");
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString("base64");

    let values = [email, hashPassword, salt];
    conn.query(sql, values,
        (error, results) => {
        if (error) {
            console.log(error);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        if (results.affectedRows)
            return res.status(StatusCodes.CREATED).json(results);
        else
            return res.status(StatusCodes.BAD_REQUEST).end();
    });
};

const login = (req, res) => {
    const { email, password } = req.body;

    let sql = 'SELECT * FROM users WHERE email = ?';
    conn.query(sql, email,
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            const loginUser = results[0];

            const hashPassword = crypto.pbkdf2Sync(password, loginUser.salt, 10000, 10, 'sha512').toString("base64");

            if (loginUser && loginUser.password == hashPassword) {
                const token = jwt.sign({
                    id: loginUser.id,
                    email: loginUser.email
                }, process.env.PRIVATE_KEY, {
                    expiresIn: '50m',
                    issuer: "tommy"
                });

                res.cookie('token', token, {
                    httpOnly: true
                });

                return res.status(StatusCodes.OK).json({...results[0], token: token});
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).end();
            }
        })
};

const passwordResetRequest = (req, res) => {
    const { email } = req.body;

    let sql = 'SELECT * FROM users WHERE email = ?';
    conn.query(sql, email,
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            const user = results[0];
            if (user) {
                return res.status(StatusCodes.OK).json({
                    email: email
                });
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).end();
            }
        }
    )
};

const passwordReset = (req, res) => {
    const { email, password } = req.body;

    let sql = 'UPDATE users SET password = ?, salt = ? WHERE email = ?';

    const salt = crypto.randomBytes(10).toString("base64");
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString("base64");

    let values = [hashPassword, salt, email];
    conn.query(sql, values,
        (error, results) => {
            if (error) {
                console.log(error);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            if(results.affectedRows == 0)
                return res.status(StatusCodes.BAD_REQUEST).end();
            else
                return res.status(StatusCodes.OK).json(results);
        })

}

module.exports = {
    join,
    login,
    passwordResetRequest,
    passwordReset
}