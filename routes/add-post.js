const database = require("../config/database");
const express = require("express");
const fs = require("fs");
const mkdirp = require("mkdirp");
const userModel = database.import("../models/postcomment");
const authorization = require("../config/token-verification");

const router = express.Router();

router.post("/", authorization, (req, res) => {
  const { userid, activitytype, posttitle, posttext, postimage } = req.body;
  var imagepath = "";
  if (postimage != "") {
    //check if directory exists already
    mkdirp("./pictures/postpicture/" + userid, function(err) {
      //if error, this means directory already exists, igore
      console.log("already exists");
    });

    //use current time for unique name
    var date = new Date();
    var currTime = date.getTime();
    console.log(currTime);
    imagepath = "./pictures/postpicture/" + userid + "/" + currTime + ".jpg";

    // write the image into the filepath
    let buff = new Buffer(postimage, "base64");
    fs.writeFileSync(imagepath, buff, function(err) {
      if (err) {
      }
    });
  }

  database.query('SELECT officialcertified FROM scoop.users WHERE userid = :id', 
  {replacements:{id: userid}, type: database.QueryTypes.SELECT})
  .then((result)=>{
    var feed;
    if(result[0].officialcertified=='yes'){
      feed = 'official'
    }else{
      feed = 'community'
    }
 //send the object to the postcomment table in the scoopdb database.
  //image path will be left blank ("") if no image was added to the post.
  userModel
    .create({
      userid: userid,
      activitytype: activitytype,
      posttitle: posttitle,
      posttext: posttext,
      postimagepath: imagepath,
      feed: feed,
    })
    .then(() => {
      res.send("Success");
    });
  })
 
});

module.exports = router;
