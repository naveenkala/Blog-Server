const express = require("express");
const Blog = require("../models/blog");
const blogController = require("../controllers/blogController");
const { auth, requiresAuth } = require("express-openid-connect");
const router = express.Router();

//middleware to count pages
const countPages = (req, res, next) => {
  //This gets depricated warning
  // Blog.find()
  //   .count()
  //   .then((result) => {
  //     const blogsPerPage = 5;
  //     req.blogsPerPage = blogsPerPage;
  //     const totalPages = Math.ceil(result / blogsPerPage);
  //     res.locals.totalPages = totalPages;
  //     req.totalPages = totalPages;
  //     next();
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  Blog.countDocuments({}, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      const blogsPerPage = 5;
      req.blogsPerPage = blogsPerPage;
      const totalPages = Math.ceil(result / blogsPerPage);
      res.locals.totalPages = totalPages;
      req.totalPages = totalPages;
      next();
    }
  });
};

//routes
router.get("/", (req, res) => {
  res.redirect("/blogs/page/1");
});
router.get("/create", requiresAuth(), blogController.blog_create_get);
router.get("/page/:page", countPages, blogController.blog_index);
router.post("/", blogController.blog_create_post);
router.get("/:id", blogController.blog_details);
router.get(
  "/update/:id",
  requiresAuth(),
  blogController.blog_send_for_edit
);
router.post("/update/:id", requiresAuth(), blogController.blog_update);
router.delete("/:id", requiresAuth(), blogController.blog_delete);

module.exports = router;
