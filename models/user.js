const mongoose = require("mongoose");
const Scheme = mongoose.Schema;

const userScheme = new Scheme({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "I'm New HERE!!!",
  },
  posts: [
    {
      type: Scheme.Types.ObjectId,
      ref: "Post",
    },
  ],
});

module.exports = mongoose.model("User", userScheme);
