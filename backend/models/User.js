const mongoose = require("mongoose");

// Each bookmark is a saved news article, embedded directly on the user
// document. This keeps reads simple: one query gets the user's whole
// bookmark list, which is exactly what the "My Bookmarks" view needs.
const bookmarkSchema = new mongoose.Schema(
  {
    articleId: { type: String, required: true }, // link used as a stable unique id
    title: String,
    imageUrl: String,
    sourceId: String,
    link: String,
    savedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true }, // stored as a bcrypt hash
    bookmarks: [bookmarkSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
