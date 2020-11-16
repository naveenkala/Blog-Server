const Blog = require("../models/blog");

const blog_index = (req, res) => {
  Blog.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("index", { blogs: result, title: "All blogs" });
    })
    .catch((err) => {
      console.log(err);
    });
};

const blog_details = (req, res) => {
  const id = req.params.id;
  const author = req.oidc && req.oidc.user && req.oidc.user.email;
  Blog.findById(id)
    .then((result) => {
      if (result.creator == author) {
        result.delete = 1;
        res.render("details", {
          blog: result,
          title: "Blog Details",
        });
      } else {
        result.delete = 0;
        res.render("details", {
          blog: result,
          title: "Blog Details",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.render("404", { title: "Blog not found" });
    });
};

const blog_create_get = (req, res) => {
  res.render("create", { title: "Create a new blog" });
};

const blog_create_post = (req, res) => {
  const creator = req.oidc.user.email;
  req.body.creator = creator;
  const blog = new Blog(req.body);
  blog
    .save()
    .then((result) => {
      res.redirect("/blogs");
    })
    .catch((err) => {
      console.log(err);
    });
};

const blog_delete = (req, res) => {
  const id = req.params.id;
  const req_delete = req.oidc.user.email;

  Blog.findById(id).then((result) => {
    if (result.creator == req_delete) {
      Blog.findByIdAndDelete(id)
        .then((result) => {
          res.json({ redirect: "/blogs" });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
};

module.exports = {
  blog_index,
  blog_details,
  blog_create_get,
  blog_create_post,
  blog_delete,
};
