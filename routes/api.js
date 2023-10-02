'use strict';
const mongoose = require('mongoose')

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
      const date = new Date();
      const newThread = new ThreadModel({
        text: text,
        delete_password: delete_password,
        replies: [],
        created_on: date,
        bumped_on: date
      });
      // console.log("newThread", newThread);

      BoardModel.findOne({ name: board })
      .then((Boarddata)=>{
        if (!Boarddata) {
          const newBoard = new BoardModel({
            name: board,
            threads: [],
          });
          // console.log("newBoard", newBoard);
          newBoard.threads.push(newThread);
          newBoard.save()
          .then((data)=>{
            if(data){
              // console.log("newBoardData", newThread);
              return res.redirect('/b/' + board )
            }
          })
          .catch((err)=>{
            console.log(err);
            res.send("There was an error saving in post");
          })
        } else {
          Boarddata.threads.push(newThread);
          Boarddata.save()
          .then((data)=>{
            if(data){
              // console.log("newBoardData", newThread);
              return res.redirect('/b/' + board )
            }         
          })
          .catch((err)=>{
            console.log(err);
              res.send("There was an error saving in post");
          })
        }
      })
    })
    
    .get((req, res) => {
      const board = req.params.board;
      BoardModel.findOne({ name: board })
      .then((data)=>{
        if (!data) {
          console.log("No board with this name");
          res.json({ error: "No board with this name" });
        } else {
          // console.log("data", data);


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
      })
    })
    
    .put((req, res) => {
      //console.log("put", req.body);
      const { report_id } = req.body;
      const board = req.params.board;
      //console.log('board '+ board)

      BoardModel.findOne({ name: board })
      .then((boardData)=>{
        if (!boardData) {
          res.json("error", "Board not found");
        } else {          
          let reportedThread = boardData
          
          for(let y=0; y< reportedThread.threads.length; y++){
            if(reportedThread.threads[y].id == report_id){
              reportedThread.threads[y].reported = true
              reportedThread.threads[y].bumped_on = new Date()
              break
            }
          }

          reportedThread.save()
          .then((data)=>{
            res.send("reported");
          })
        }
      })
    })
    
    .delete((req, res) => {
      // console.log("delete", req.body);
      const { thread_id, delete_password } = req.body;
      const board = req.params.board;
     
      BoardModel.findOne({ name: board })
      .then((boardData)=>{
        if (!boardData) {
          res.json("error", "Board not found");
        } else {
          let threadToDelete = boardData.threads.find(thread => thread.id === thread_id);
          
          if (threadToDelete.delete_password === delete_password) {

            let sliceArray = boardData
            for(let y=0; y< sliceArray.threads.length; y++){
              if( sliceArray.threads[y].id == thread_id){                 
                sliceArray.threads.splice(y, 1)
                break
              }
            }
                       
            sliceArray.save()
            .then((data)=>{
              res.send("success");
            })           

          } else {
            res.send("incorrect password");
            return;
          }
                         
        }
      })
    });
     
/*

  app
    .route("/api/replies/:board")
    
    .post((req, res) => {
      console.log("thread", req.body);
      const { thread_id, text, delete_password } = req.body;
      const board = req.params.board;
      const newReply = new ReplyModel({
        text: text,
        delete_password: delete_password,
      });
      BoardModel.findOne({ name: board })
      .then((boardData)=>{
        if (!boardData) {
          res.json("error", "Board not found");
        } else {          
          let threadToAddReply = boardData.threads.id(thread_id);
          threadToAddReply.bumped_on = new Date();
          threadToAddReply.replies.push(newReply);
          boardData.save()
          .then((updatedData)=>{
            res.json(updatedData);
          })
        }
      })
    })
    .get((req, res) => {
      const board = req.params.board;
      BoardModel.findOne({ name: board })
      .then((data)=>{
        if (!data) {
          console.log("No board with this name");
          res.json({ error: "No board with this name" });
        } else {
          console.log("data", data);
          const thread = data.threads.id(req.query.thread_id);
          res.json(thread);
        }
      })
    })
    .put((req, res) => {
      //       thread_id: 60898569e083081d56e290cf
      //       reply_id: 608986aee083081d56e290d0
      const { thread_id, reply_id } = req.body;
      const board = req.params.board;
      BoardModel.findOne({ name: board })
      .then((data)=>{
        if (!data) {
          console.log("No board with this name");
          res.json({ error: "No board with this name" });
        } else {
          console.log("data", data);
          let thread = data.threads.id(thread_id);
          let reply = thread.replies.id(reply_id);
          reply.reported = true;
          reply.bumped_on = new Date();
          data.save()
          .then((data)=>{
            res.send("Success");
          })
        }
      })
    })    
    .delete((req, res) => {
      const { thread_id, reply_id, delete_password } = req.body;
      console.log("delete reply body", req.body);
      const board = req.params.board;
      BoardModel.findOne({ name: board })
      .then((data)=>{
        if (!data) {
          console.log("No board with this name");
          res.json({ error: "No board with this name" });
        } else {
          console.log("data", data);
          let thread = data.threads.id(thread_id);
          let reply = thread.replies.id(reply_id);
          if (reply.delete_password === delete_password) {
            reply.remove();
          } else {
            res.send("Incorrect Password");
            return;
          }

          data.save()
          .then((data)=>{
            res.send("Success");
          })
        }
      })
    });
 */    
    
};
