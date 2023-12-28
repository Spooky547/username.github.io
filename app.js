const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const app = express();
const port = 3000;

// Sample token information
const tokenInfo = {
    totalSupply: "1,000,000,000",
    circulatingSupply: "200,000,000",
    lockedTokens: "50,000,000"
};

// Sample user database (replace with a proper database in a real-world scenario)
const users = [];

const validApiKeys = ["your-api-key"]; // Replace with your actual API keys
const jwtSecret = "your-jwt-secret"; // Replace with a strong secret key

app.use(express.static("public"));
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(
    session({
        secret: "your-session-secret",
        resave: false,
        saveUninitialized: true
    })
);

// Middleware for API key authentication
app.use((req, res, next) => {
    const apiKey = req.header("X-API-Key");

    if (!apiKey || !validApiKeys.includes(apiKey)) {
        return res.status(401).json({ error: "Unauthorized. Invalid API key." });
    }

    next();
});

// Middleware for user authentication using JWT
const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Invalid token" });
        }
        req.user = decoded.user;
        next();
    });
};

app.post("/api/register", [
    check("username").notEmpty().trim(),
    check("password").isLength({ min: 6 }).trim()
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 10);
    users.push({ username, password: hashedPassword });

    res.json({ message: "Registration successful" });
});

app.post("/api/login", [
    check("username").notEmpty().trim(),
    check("password").notEmpty().trim()
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    const user = users.find(u => u.username === username);

    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ user: user.username }, jwtSecret, { expiresIn: "1h" });
        return res.json({ token, message: "Login successful" });
    } else {
        return res.status(401).json({ error: "Invalid credentials" });
    }
});

app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to log out" });
        }
        res.json({ message: "Logout successful" });
    });
});

app.get("/api/token-info", authenticateUser, (req, res) => {
    res.json(tokenInfo);
});

app.post("/api/report-scam", authenticateUser, (req, res) => {
    const { scamAddress } = req.body;
    console.log(`${req.user} reported a scam: ${scamAddress}`);
    res.json({ message: "Scam reported successfully." });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
