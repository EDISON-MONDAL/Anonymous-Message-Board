const mongoose = require("mongoose");


const ReplySchema = new mongoose.Schema({
  text: { type: String },
  delete_password: { type: String },
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
});
const Reply = mongoose.model("replys", ReplySchema);

const ThreadSchema = new mongoose.Schema({
  text: { type: String },
  delete_password: { type: String },
  reported: { type: Boolean, default: false },
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  replies: { type: [ReplySchema] },
});
const Thread = mongoose.model("threads", ThreadSchema);

const BoardSchema = new mongoose.Schema({
  name: { type: String },
  threads: { type: [ThreadSchema] },
});

const Board = mongoose.model("boards", BoardSchema);

exports.Board = Board;
exports.Thread = Thread;
exports.Reply = Reply;