// Required modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // mongoose to interact with database via defined schemas
const jwt = require('jsonwebtoken'); // json web tokens to handle session tokens.
const bcrypt = require('bcrypt'); // bcrypt for brute-force resistant one-way hashing.
const validator = require('validator'); // validator to check that emails are properly formatted
const mailer = require('nodemailer'); // to use for verification emails.

const saltRounds = 10; // the rounds used for generating bcrypt salt.

const user = require('./models/user'); // mongoose model for users.
const verify = require('./models/verify'); // mongoose model for verifying users.
const catalogItem = require('./models/item'); // mongoose model for catalog (menu) items.
const review = require('./models/review'); // mongoose model for customer reviews of products.

// nodemailer setup -- NOTE: you will have to include your own account details for this - GMAIL SETUP
const mailUser = ''; // GMAIL ADDRESS HERE
const mailPassword = ""; // GMAIL PASSWORD HERE

var transporter = mailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: mailUser,
        pass: mailPassword
    }
});

// app setup
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Database connection setup
const dbURL = ""; //MONGODB URL HERE
mongoose.connect(dbURL, {useNewUrlParser: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

const PORT = process.env.PORT || 8081; // Port for express to listen on.

// Set up the routes to be used on the /api subroutes.
var router = express.Router();

// Login route
router.post('/login', (req, res) => {
    // first thing we should do is authenticate the user with our database
    // Then when we have that user, we can create a Bearer token for the session.
    var username = req.body.user;
    var password = req.body.pw;

    console.log(`Signing in with credentials ${username} ${password}.`);

    // The requirements point out the 'store manager' account especially, therefore at my discretion
    // I am treated it as its own case.
    if(!validator.isEmail(username) && username != 'store manager')
    {
        res.json({message: 'Invalid Email'});
        return;
    }

    user.findOne({email: username}, (err, thisUser) => {
        if(!thisUser)
        {
            // couldn't find a match.
            res.json({message: 'No such user'});
            console.log('User not found.');

            return;
        }
        if(thisUser.authLevel == 0) // disabled account
        {
            res.json({message: 'Deactivated'});
            console.log('Deactivated account.');
            return;
        }

        if(!thisUser.verified) // user hasn't activated their account via e-mail link
        {
            res.json({message: 'Verify'});
            console.log('Unverified account');
            return;
        }

        if(thisUser && bcrypt.compareSync(password, thisUser.password)) // now we can check if the password matches.
        {
            console.log('Successful sign in.');
            // They are the same -- issue token
            var token = jwt.sign({thisUser}, 'secretkey', {expiresIn: "45m"}); // sessions last 45 minutes by default.
            res.json({message: token, auth: thisUser.authLevel, email: thisUser.email});
        } else {
            // Not the same -- return invalid login
            console.log('Invalid sign in.');
            res.json({message:'Invalid'});
        }
    })
});


// Re-send verification email
router.post('/login/resend-verification', (req, res) => {
    var username = req.body.user;
    console.log('Resending verification for ' + username);

    verify.findOne({email: username}, (err, doc) =>{
        if(err) console.log(err)
        else {
            // Use their hash to resend the verification email.
            var verifyHash = doc.code; // this is the hash for their verification URL.

            // set the mail options.
            var mailOptions = {
                from: mailUser,
                to: username,
                subject: 'Activate your Fruit Storefront account!',
                html: `<a href='localhost:${PORT}/verify/${verifyHash}'>Activate your account</a>`
            };
            console.log('Re-sending verification email.');

            // send the email.
            transporter.sendMail(mailOptions, (err, info) => {
                if(err) console.log(err);
                else
                console.log('Email sent ' + info.response);
            });
            
        }
    })
});

// Create account
router.post('/signup', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    var thisUser = new user({email:username, password, authLevel:1, wishlist:[], verified: false});

    if(!validator.isEmail(username))
    {
        res.json({message: 'Invalid email'});
        return;
    }

    user.findOne({email: username}, (err, result) => {
        if(!result)
        {
            thisUser.password = bcrypt.hashSync(thisUser.password, saltRounds);

            // user not found, can create in database.
            thisUser.save((err) => {
                if(err) console.log(err);

                // Store them in our verification database - this user needs to be verified via a link sent to their email.
                var verifyHash = bcrypt.hashSync(String(Date.now()), saltRounds);
                verifyHash = validator.blacklist(verifyHash, '%/');
                console.log('Created verify hash.');

                var toVerify = new verify({code: verifyHash, email: username});
                toVerify.save((err) => {
                    // now to email them a link to the GET activation route, with the hash string for their account.
                    var mailOptions = {
                        from: mailUser,
                        to: username,
                        subject: 'Activate your Fruit Storefront account!',
                        html: `<a href='localhost:${PORT}/verify/${verifyHash}'>Activate your account</a>`
                    };
                    console.log('About to send email.');

                    // send the email.
                    transporter.sendMail(mailOptions, (err, info) => {
                        if(err) console.log(err);
                        else
                        console.log('Email sent ' + info.response);
                    });
                });
            });
            console.log('Account created.');
            res.json({message:"Success"});
        } else {
            // user found, return that they already have an account
            console.log('Account already exists.');
            res.json({message: 'Invalid'});
        }
    });
});

// Routes handling user data - these are intended for use by store managers
router.route('/users')
    .get(verifyToken, checkIfSM, (req, res)=>{ // This is the route to get all of the users.
        
        user.find({}, 'email authLevel', (err, docs) => {
            if(err) console.log(err);
            else {
                res.json({users: docs});
            }
        });
    })
    .put(verifyToken, checkIfSM, (req, res) => {
        console.log('Updating users...');
        var updatedUser = req.body.updatedUser;

        user.findOne({email: updatedUser.email}, (err, doc) =>{
            console.log(doc.email + ' ' + doc.authLevel);
            console.log(updatedUser.email + ' ' + updatedUser.authLevel);

            doc.authLevel = updatedUser.authLevel;
            doc.save((err) => {if (err) console.log(err);});
        });
    });

// Retrieve wishlist
router.get('/wishlist', verifyToken, (req, res) => {
    console.log('Wishlist route accessed.');

    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if(err)
        {
            res.sendStatus(403); // there's an error - send forbidden
        } else {
            // get the wishlist.
            var token = jwt.decode(req.token); // decodes our payload into a user object.

            user.findOne({email: token['thisUser']['email']}, (err, foundUser) =>{
                if(err)
                {
                    res.json({message: 'Error'}); // send back an error.
                    console.log(err);
                }
                else {
                    // return the wishlist.
                    console.log('Returning wishlist for ' + token['thisUser']['email']);
                    res.json({wishlist: foundUser.wishlist});
                }
            });
            // res.json({wishlist}); // send back the wishlist in json format if the jwt is verified.
        }
    });
});

// Cart routes:
// 1) Get cart for given uer
// 2) Update user's cart
router.route('/cart')
    .get(verifyToken, (req, res) => { // Get the cart for this user.
        jwt.verify(req.token, 'secretkey', (err, authData) => {
            if (err)
            {
                res.sendStatus(403); // forbidden - token has expired.
            } else {
                var token = jwt.decode(req.token);

                // Pull the user's data from the db so we can send back their cart information.
                user.findOne({email: token['thisUser']['email']}, (err, foundUser) => {
                    console.log('Returning cart for ' + token['thisUser']['email']);
                    res.json({cart: foundUser.cart});
                });
            }
        });
    })
    .put(verifyToken, (req, res) => { // This is what we'll use to update the cart.
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        var newCart = req.body.cart;
        console.log('Updating cart - verifying jwt.');

        if (err)
        {
            res.sendStatus(403); // forbidden - token has expired.
        } else {
            var token = jwt.decode(req.token);

            // Locate their record so we can update their cart.
            user.findOne({email: token['thisUser']['email']}, (err, foundUser) => {
                console.log('Updating cart for ' + token['thisUser']['email']);
                foundUser.cart = newCart;
                foundUser.save((err) => {
                    if(err) console.log(err);
                    else console.log('Updated cart.');
                });
                res.json({message: 'Success'});
            });
        }
    });
    });

// Get all the catalog items -- used for populating the catalog in the frontend
router.route('/catalog')
    .get((req, res) => {
    catalogItem.find((err, docs) => {
        if(err) 
        {
            res.json({message: 'Error'});
            console.log(err);
        } else {
            console.log('Getting catalog items!');
            res.json({items: docs}); // send all of the documents pulled from the Catalog collection.
        }
    });
    })
    .post(verifyToken, checkIfSM, (req, res) => { // route to create a new catalog item
        var newItem = req.body.item;

        var toBeAdded = new catalogItem();

        // set all the params as passed via the newItem object.
        toBeAdded.name = sanitizeText(newItem.name);
        toBeAdded.price = newItem.price;
        toBeAdded.description = sanitizeText(newItem.description);
        toBeAdded.amountSold = 0;
        toBeAdded.imageUrl = sanitizeText(newItem.imageUrl);
        toBeAdded.stock = newItem.stock;

        toBeAdded.save((err) => {
            if(err)
            {
                console.log(err);
                res.json({message: 'Error'});
            } else {
                console.log('Added item!');
                res.json({message: 'Success'});
            }
        })
    })
    .put(verifyToken, checkIfSM, (req, res) => { // route to update a catalog item.
        console.log('Updating catalog!');
        var updatedItem = req.body.updatedItem;
        console.log(updatedItem);

        // Important: We're finding them by ID because the names are changeable in this scenario.
        catalogItem.findById(updatedItem._id, (err, doc) => {
            doc.name = sanitizeText(updatedItem.name);
            doc.description = sanitizeText(updatedItem.description);
            doc.price = updatedItem.price;
            doc.stock = updatedItem.stock;

            doc.save((err) => {if(err) console.log(err);});
        });
    });

// Route for reviews
router.route('/reviews')
    .post(verifyToken, (req, res) => {
        console.log('Adding a review!');
        var item = req.body.item;
        var comment = sanitizeText(req.body.comment); // sanitize the text of HTML/DOM tags
        var rating = req.body.rating;

        token = jwt.decode(req.token);

        var username = token['thisUser']['email'];

        review.findOne({username, itemName:item.name}, (err, doc) => {
            if(err) console.log(err);

            if(!doc)
            {
                // Review hasn't been posted before by this user for this item
                var newReview = new review();
                // Set all of the properties equivalent to the values we got
                newReview.username = username;
                newReview.itemName = item.name;
                newReview.comment = comment;
                newReview.rating = rating;
                newReview.hidden = false;

                // Save this document now.
                newReview.save((err) => {
                    if(err) console.log(err);
                    else {
                        res.json({message: 'Success'});
                    }
                });
            } else {
                console.log(doc); // log the old version for comparison
                // update the parameters of the document to match the new ones
                doc.comment = comment;
                doc.rating = rating;
                doc.save((err) => {
                    if(err) console.log(err);
                    else
                    {
                        res.json({message: 'Success'});
                        console.log(doc); // log the new version for comparison
                    }
                });
            }
        });
    })
    .get((req, res) => { // route to get all reviews.
        review.find({}, (err, docs) => {
            if(err) console.log(err);
            else res.json({docs}); // just pick out all the docs and send them back.
        });
    })
    .put(verifyToken, checkIfSM, (req, res) => {
        var thisReview = req.body.review; // pull the review out of the request body

        review.findById(thisReview._id, (err, doc) => {
            doc.hidden = thisReview.hidden; // toggle the hidden flag.

            console.log(doc);
            doc.save((err) => {
                if(err) console.log(err); // if there's an error, print it on the server-side
            });
        });
    });

// Route to get specific reviews
router.get('/reviews/:itemName', (req, res) => {
    console.log('Getting reviews for this item!');
    var itemName = req.params.itemName;
    review.find({itemName, hidden:false}, (err, docs) => {
        res.json({docs});
    });
});

// Route to get an item's rating
router.get('/rating/:itemName', (req, res) => {
    console.log('Getting rating.');

    var itemName = req.params.itemName;
    var sum = 0;
    review.find({itemName, hidden: false}, (err, docs) =>{
        if(!docs)
        {
            res.json({average: 'No ratings yet'});
            return;
        }

        for(var x of docs)
        {
            sum += x.rating;
        }
        res.json({average: (sum / docs.length)});
    });
});

// Route to get details of a single catalog item
router.route('/catalog/:itemName')
    .get((req, res) => {
    catalogItem.findOne({name: req.params.itemName}, (err, doc) => {
        if(!doc)
        {
            res.json({message: 'Error'}); // could not find the item
        } else {
            // found the item, now return it.
            console.log('Retrieved one item: ' + req.params.itemName);
            res.json({item: doc});
        }
    });
    })
    .put((req, res) => {    // Update a single catalog item.
        console.log('User is updating an item.');
        var dbItem = req.body.catalogItem;
        catalogItem.findOne({name: dbItem.name}, (err, doc) => {
            if(err) console.log(err);
            else {
                doc.stock = dbItem.stock;
                doc.amountSold = dbItem.amountSold;
                doc.save((err) =>{
                    if(err) console.log(err);
                    else console.log('Updated a catalog item!');
                });
                res.json({message:'Success'});
            }
        });
    })
    .delete(verifyToken, checkIfSM, (req, res) =>{
        var itemName = req.params.itemName;
        catalogItem.findOneAndDelete({name: itemName}, (err, res) => {
            if(err) console.log(err);
            else {
                console.log('Deleted item ' + itemName);
            }
        });
    });

// Verify token function -- we'll use this in 2 situations:
// 1: the client wants to access a route that pulls information from the database or is otherwise user-specific
// 2: the client needs to verify its current token before proceeding to one of its own routes.
// NOTE: When a token is verified, this function will attach that token to the request body in req.token
// so that the next function can access the token.
function verifyToken(req, res, next)
{
    console.log('verifyToken middleware running.');
    // Get auth header value -- our token will be sent in the header of a request as the authorization value
    const bearerHeader = req.headers['authorization']; // gets the token from the header.
    // Check if bearer is undefined.
    if(typeof(bearerHeader) !== 'undefined')
    {
        // can continue
        // split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Token is now in request for further routes to access to verify the user.
        next();
    } else {
        console.log('No bearer token is attached to the request.');
        res.sendStatus(403); // send forbidden status.
        // returns one line: Forbidden
    }
}

// Middleware function to ensure that the JWT represents a store manager
// only to be run after verifyToken
function checkIfSM(req, res, next)
{
    console.log('Making sure this token belongs to a store manager.');
    jwt.verify(req.token, 'secretkey', (err, authData) => {
        if (err)
        {
            res.sendStatus(403); // forbidden - token has expired.
        } else {
            var token = jwt.decode(req.token);

            if(token['thisUser']['authLevel'] === 2)
            {
                // this is a store manager
                next();
            } else {
                res.sendStatus(403);
            }
        }
    });
}

// Function to sanitize inputs
function sanitizeText(text)
{
    var temp = text;
    temp = validator.blacklist(temp, '<>'); // this should remove tag interpretation from strings.
    return temp;
}

// Route to simply verify that a token is valid -- this will be used to continue the session if someone refreshes the page
router.post('/verifytoken', (req, res) => {
    const bearerHeader = req.headers['authorization'];

    if(typeof(bearerHeader) !== 'undefined')
    {
        const token = bearerHeader.split(' ')[1];
        jwt.verify(token, 'secretkey', (err, decoded) => {
            if(!err)
            {
                var decoded = jwt.decode(token);

                // token is valid
                res.json({message: 'Success', email:decoded['thisUser']['email'], authLevel:decoded['thisUser']['authLevel']});
            } else {
                res.json({message: 'Invalid'});
            }
        });
    } else {
        res.json({message: 'Invalid'});
    }
})

// route to activate accounts.
app.get('/verify/:verifyHash', (req, res) => {
    var toVerify = req.params.verifyHash; // save the hash in a variable

    // need to look up the hash in the verification database to find the corresponding account email.
    verify.findOneAndDelete({code: toVerify}, (err, doc) => {
        if(err) console.log(err);

        if(!doc)
        {
            res.send('Invalid activation link - contact store manager.');
        } else {
            var email = doc.email; // got the account email - let's verify them.

            user.findOne({email}, (err, account) => {
                if(err) console.log(err);

                account.verified = true;
                account.save((err) => {
                    if(err) console.log(err);
                    console.log('Account verified!');
                });

                res.send('Account activated! Go to the Fruit Storefront website to log in!');
            });
        }
    });
});

app.use('/api', router); // use our router on the /api subroutes.

app.listen(PORT, () => {
    console.log("Server now running on port " + PORT);

});