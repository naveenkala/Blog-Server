const Blog = require("../models/blog");
const nl2br = require("nl2br");

const blog_index = (req, res) => {
  const currentPage = +req.params.page;
  const { totalPages } = req;
  if (currentPage > totalPages || currentPage < 1) {
    return res.render("404", { title: "Page not found" });
  }

  const { blogsPerPage } = req;
  const skipDocs =
    (currentPage - 1) * blogsPerPage > 0
      ? (currentPage - 1) * blogsPerPage
      : 0;
  Blog.find()
    .skip(skipDocs)
    .limit(blogsPerPage)
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("index", {
        currentPage,
        blogs: result,
        title: "All blogs",
      });
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
      result.body = nl2br(result.body);
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

const blog_send_for_edit = (req, res) => {
  const id = req.params.id;
  const author = req.oidc && req.oidc.user && req.oidc.user.email;
  Blog.findById(id)
    .then((result) => {
      if (result.creator == author) {
        res.render("update", {
          blog: result,
          URL: `/blogs/update/${result._id}`,
          title: "Blog Update",
        });
      } else {
        res.render("404", { title: "Blog not found" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.render("404", { title: "Blog not found" });
    });
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

const blog_update = (req, res) => {
  const id = req.params.id;
  const req_edit = req.oidc.user.email;

  Blog.findById(id).then((result) => {
    if (result.creator == req_edit) {
      var query = { _id: req.params.id };
      Blog.findOneAndUpdate(
        query,
        req.body,
        { upsert: true },
        function (err, doc) {
          if (err) return res.send(500, { error: err });
          return res.redirect(`/blogs/${id}`);
        }
      );
    } else {
      return res.send(500, { error: err });
    }
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
  blog_update,
  blog_send_for_edit,
};
