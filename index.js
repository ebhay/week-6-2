const express = require("express");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "kirat123123";

const app = express();
app.use(express.json());

const users = [];

function logger(req, res, next) {
    console.log(req.method + " request came");
    next();
}

// localhost:3000
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/public/index.html");
})

app.post("/signup", logger, function(req, res) {
    const username = req.body.username
    const password = req.body.password
    
    // Check if user already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({
            message: "Username already exists"
        });
    }

    users.push({
        username: username,
        password: password
    })

    res.json({
        message: "Successfully signed up"
    })
})

app.post("/signin", logger, function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    const foundUser = users.find(user => 
        user.username === username && user.password === password
    );

    if (!foundUser) {
        return res.status(401).json({
            message: "Credentials incorrect"
        });
    }

    const token = jwt.sign({
        username: foundUser.username
    }, JWT_SECRET);
    
    res.header("jwt", token);
    res.json({
        token: token
    });
})

function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: "No token provided. Format should be: Bearer <token>"
        });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.username = decoded.username;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

app.get("/me", logger, auth, function(req, res) {
    const currentUser = req.username;
    let foundUser = null;

    foundUser = users.find(user => user.username === currentUser);
    
    if (!foundUser) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.json({
        username: foundUser.username,
        password: foundUser.password
    });
})

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Something went wrong!"
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


// Add at the top with other requires
const cors = require('cors');

// Add before your routes
app.use(cors());