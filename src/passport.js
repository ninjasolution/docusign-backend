const passport = require('passport');
const passportJWT = require("passport-jwt");
const authConfig = require('./config/auth.config');
const db = require("./models");
const User = db.user;
const ExtractJWT = passportJWT.ExtractJwt;
const bcrypt = require("bcryptjs");
const service = require('./service');
const passportCustom = require('passport-custom');
const { SUBADMIN } = require('./config');
const CustomStrategy = passportCustom.Strategy;

const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
    function (email, password, cb) {

        //Assume there is a DB module pproviding a global UserModel
        return User.findOne({ email })
            .populate("role", "name")
            .populate({ path: "logins", options: { limit: 10 }, select: "-__v" })
            .populate({ path: "transactions", options: { limit: 10 }, select: "-__v" })
            .exec((err, user) => {
                if (!user) {
                    return cb(null, false, { message: 'Incorrect email or password.' });
                }

                const passwordIsValid = bcrypt.compareSync(
                    password,
                    user.password
                );

                if (!passwordIsValid) {
                    return cb(null, false, { message: 'Incorrect email or password.' });
                }

                return cb(null, user, {
                    message: 'Logged In Successfully'
                });
            })
            .catch(err => {
                return cb(err);
            });
    }
));

passport.use("wallet-connect", new CustomStrategy(
    async (req, callback) => {
        // Do your custom user finding logic here, or set to false based on req object
        const address = await service.recoverSignature(req.body.signature, req.body.signatureKey);
        if (req.body.address !== address) {
            return callback("invalid signature", null);

        } else {

            User.findOne({
                walletAddress: address
            })
                .exec((err, user) => {
                    if (err) {
                        return callback("DB error", null);
                    }
                    if (!user) {
                        const newUser = new User({
                            walletAddress: address,
                        });
                        Role.findOne({ name: SUBADMIN }, async (err, role) => {
                            if (err) {
                                return callback("Role doesn't exist.", null);
                            }
                            if (!role) {
                                return callback("Role doesn't exist.", null);
                            }

                            newUser.role = role._id;
                            await newUser.save();
                            return callback(null, newUser);

                        });
                    } else {

                        return callback(null, user);
                    }
                });
        }

    }
));



passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: authConfig.secret
},
    function (jwtPayload, cb) {

        //find the user in db if needed
        return User.findOne({ _id: jwtPayload.userId })
            .populate("role", "name")
            .exec((err, user) => {
                if (err) {
                    return cb(err);

                }
                return cb(null, user);
            })
    }
));