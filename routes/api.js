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
      //console.log("post", req.body);
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
              return res.redirect('/b/' + board + '/' )
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
              return res.redirect('/b/' + board + '/' )
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
                  
          data.threads.sort((a, b) => {
            const dateA = new Date(a.bumped_on);
            const dateB = new Date(b.bumped_on);
            return dateB - dateA;
          });

          // console.log("data", data.threads);
          
          const threads = data.threads.map((thread) => {
            
            const allReply = thread.replies.map((perReply)=>{
              const {_id, text, created_on, bumped_on } = perReply
              return {_id, text, created_on, bumped_on }
            })

            allReply.sort((a, b) => {
              const dateA = new Date(a.bumped_on);
              const dateB = new Date(b.bumped_on);
              return dateB - dateA;
            });
            //console.log('allReply ' + allReply)

            const threeReplies = []

            for(let n=3; n >= 1; n--){
              const arrValue = allReply[allReply.length - n]
              if( arrValue != undefined ){
                threeReplies.push( arrValue )
              }             
            }

            //console.log("threeReplies", threeReplies[0]);

            return {
              _id: thread._id,
              text: thread.text,
              created_on: thread.created_on,
              bumped_on: thread.bumped_on,
              replies: threeReplies,
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
     


  app
    .route("/api/replies/:board")
    
    .post((req, res) => {
      //console.log("thread", req.body);
      const { thread_id, text, delete_password } = req.body;
      const board = req.params.board;
      //console.log('board '+ board)
      
      const date = new Date();
      const newReply = new ReplyModel({
        text: text,
        delete_password: delete_password,
        created_on: date,
        bumped_on: date
      });


      BoardModel.findOne({ name: board })
      .then((boardData)=>{
        if (!boardData) {
          res.json("error", "Board not found");
        } else {          
          let threadToAddReply = boardData
          for(let y=0; y < threadToAddReply.threads.length; y++){
            if( threadToAddReply.threads[y].id == thread_id){
              threadToAddReply.threads[y].bumped_on = date
              threadToAddReply.threads[y].replies.push(newReply)
            }
          }
          
          threadToAddReply.save()
          .then((updatedData)=>{
            //res.json(updatedData);
            return res.redirect('/b/' + board + '/' + thread_id )
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
      const { thread_id, reply_id } = req.body;
      const board = req.params.board;

      BoardModel.findOne({ name: board })
      .then((data)=>{
        if (!data) {
          console.log("No board with this name");
          res.json({ error: "No board with this name" });
        } else {
          console.log("data", data);

          for(let y=0; y < data.threads.length; y++){
            if( data.threads[y].id == thread_id ){

              for(let k=0; k < data.threads[y].replies.length; k++){
                if( data.threads[y].replies[k].id == reply_id ){
                  data.threads[y].replies[k].reported = true
                  data.threads[y].replies[k].bumped_on = new Date()

                  break
                }
              }
            }
          }
          
          data.save()
          .then((data)=>{
            res.send("reported");
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

          for(let y=0; y < data.threads.length; y++){
            if( data.threads[y].id == thread_id ){

              for(let k=0; k < data.threads[y].replies.length; k++){
                if( data.threads[y].replies[k].id == reply_id ){
                  
                  if ( data.threads[y].replies[k].delete_password == delete_password) {
                    data.threads[y].replies[k].text = '[deleted]'
                    break
                  } else {
                    res.send("incorrect password");
                    return;
                  }
                }
              }
            }
          }          

          data.save()
          .then((data)=>{
            res.send("success");
          })
          
        }
      })
    });   
    
};
