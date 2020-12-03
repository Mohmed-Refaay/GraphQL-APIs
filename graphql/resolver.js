const User = require("../models/user");
const Post = require("../models/post");
const bcrypt = require("bcryptjs");
const vtr = require("validator");
const jwt = require("jsonwebtoken");

const errorHandler = (message, code) => {
  const error = new Error(message);
  error.code = code;
  throw error;
};

module.exports = {
  createUser: async function ({ userInput }, req) {
    const email = userInput.email;
    const name = userInput.name;
    const password = userInput.password;
    const erros = [];
    if (!vtr.isEmail(email)) {
      erros.push({ message: "It's no an Email" });
    }

    if (vtr.isEmpty(email)) {
      erros.push({ message: "email is empty" });
    }

    if (vtr.isEmpty(password) || !vtr.isLength(password, { min: 5 })) {
      erros.push({ message: "Password is too short!" });
    }

    if (erros.length > 0) {
      errorHandler("Validation is Failed!!", 422);
    }
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      errorHandler("Email is already exist!!", 422);
    }
    const hashedPassword = await bcrypt.hash(password, 15);
    const user = new User({
      email: email,
      name: name,
      password: hashedPassword,
    });

    const createdUser = await user.save();
    return {
      ...createdUser._doc,
      _id: createdUser._id.toString(),
    };
  },

  login: async function ({ email, password }) {
    const user = await User.findOne({ email: email });
    if (!user) {
      errorHandler("Email is not found!", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      errorHandler("Wrong Password!", 401);
    }

    const token = await jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
        name: user.name,
      },
      "secretisalwaysasecret",
      { expiresIn: "1h" }
    );

    return {
      token,
      userId: user._id.toString(),
    };
  },

  createPost: async function ({ postInput }, req) {
    const title = postInput.title;
    const content = postInput.content;
    const imageUrl = postInput.imageUrl;

    if (!req.isAuth) {
      errorHandler("Not Authenticated!!", 401);
    }
    const user = await User.findById(req.userId);

    const post = new Post({
      title,
      content,
      imageUrl: "/images/walter.jpg",
      creator: user,
    });

    const createdPost = await post.save();

    user.posts.push(createdPost);
    await user.save();

    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
      userName: req.userName,
    };
  },

  getPosts: async function ({ currentPage }, req) {
    if (!req.isAuth) {
      errorHandler("Not Authenticated!!", 401);
    }

    const totalItems = await Post.find().countDocuments();

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("creator")
      .skip((currentPage - 1) * 2)
      .limit(2);

    return {
      posts: posts.map((p) => ({
        ...p._doc,
        _id: p._id.toString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      totalItems,
    };
  },

  deletePost: async function ({ postId }, req) {
    if (!req.isAuth) {
      errorHandler("Not Authenticated!!", 401);
    }
    const post = await Post.findById(postId);

    if (!post) {
      errorHandler("Post not found!!", 404);
    }

    const deletePost = await Post.findByIdAndRemove(postId);

    return {
      message: "Post Deleted",
    };
  },

  getStatus: async function (args, req) {
    if (!req.isAuth) {
      errorHandler("Not Authenticated!!", 401);
    }

    const user = await User.findById(req.userId);

    if (!user) {
      errorHandler("user not found!!", 404);
    }

    return {
      status: user.status,
    };
  },

  updateStatus: async function ({ newStatus }, req) {
    if (!req.isAuth) {
      errorHandler("Not Authenticated!!", 401);
    }

    const user = await User.findById(req.userId);

    if (!user) {
      errorHandler("user not found!!", 404);
    }

    user.status = newStatus;

    const updatedUser = await user.save();

    return {
      message: "Status Updated",
    };
  },
};
