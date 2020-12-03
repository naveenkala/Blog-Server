require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const blogRoutes = require("./routes/blogRoutes");
const { auth, requiresAuth } = require("express-openid-connect");

// express app
const app = express();

// connect to mongodb & listen for requests
const dbURI = process.env.DB_URI;

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => app.listen(process.env.PORT || 3000))
  .catch((err) => console.log(err));

// register view engine
app.set("view engine", "ejs");

// middleware & static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); //body parser
app.use(
  auth({
    authRequired: false,
    auth0Logout: true,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    secret: process.env.SECRET,
  })
);
app.use(morgan("dev"));

app.use((req, res, next) => {
  res.locals.path = req.path;
  res.locals.isLoggedIn = req.oidc.isAuthenticated();
  next();
});

// routes
app.get("/", (req, res) => {
  res.redirect("/blogs/page/1");
});

app.get("/page", (req, res) => {
  res.redirect("/blogs/page/1");
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

// blog routes
app.use("/blogs", blogRoutes);

// 404 page
app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});
