'use strict';

const BoardModel = require("../models/schema").Board;
const ThreadModel = require("../models/schema").Thread;
const ReplyModel = require("../models/schema").Reply;

module.exports = function (app) {
  
  app
    .route('/api/threads/:board')
    .post((req, res) => {
      const { text, delete_password } = req.body;
      let board = req.body.board;
      if (!board) {
        board = req.params.board;
      }
      console.log("post", req.body);
      const newThread = new ThreadModel({
        text: text,
        delete_password: delete_password,
        replies: [],
      });
      console.log("newThread", newThread);
      BoardModel.findOne({ name: board }, (err, Boarddata) => {
        if (!Boarddata) {
          const newBoard = new BoardModel({
            name: board,
            threads: [],
          });
          console.log("newBoard", newBoard);
          newBoard.threads.push(newThread);
          newBoard.save((err, data) => {
            console.log("newBoardData", data);
            if (err || !data) {
              console.log(err);
              res.send("There was an error saving in post");
            } else {
              res.json(newThread);
            }
          });
        } else {
          Boarddata.threads.push(newThread);
          Boarddata.save((err, data) => {
            if (err || !data) {
              res.send("There was an error saving in post");
            } else {
              res.json(newThread);
            }
          });
        }
      });
    })
    .get((req, res) => {
      const board = req.params.board;
      BoardModel.findOne({ name: board }, (err, data) => {
        if (!data) {
          console.log("No board with this name");
          res.json({ error: "No board with this name" });
        } else {
          console.log("data", data);
          const threads = data.threads.map((thread) => {
            const {
              _id,
              text,
              created_on,
              bumped_on,
              reported,
              delete_password,
              replies,
            } = thread;
            return {
              _id,
              text,
              created_on,
              bumped_on,
              reported,
              delete_password,
              replies,
              replycount: thread.replies.length,
            };
          });
          res.json(threads);
        }
      });
    })
  app.route('/api/replies/:board');

};
