/**
 * Created by Administrator on 2016/11/30.
 */

var Comment=require('../models/comment');
var User=require('../models/user');
var fs=require('fs');

exports.getHead=function(req,res){
  fs.readFile('public'+req.session.user.headpath,function(err,data){
      if(err) console.log(err);

      res.json({datauri:'data:image/png;base64,'+data.toString('base64')});
  });
};

exports.addComment=function (req, res) {

    var commentObj=req.body.comment;
    var comment = new Comment(commentObj);

    comment.save((err) => {
        if(err) console.log(err);

        res.json({state:1,id:comment._id});
    });

};

exports.like=function(req,res){

    if(req.query.interpolation=='取消赞')
        Comment.update({_id:req.query.id},{$inc:{likes:1}}).exec(function(err){
            err&&(console.log(err));

            User.findOne({_id:req.session.user.id}).exec(function(err,user){
                err&&(console.log(err));

                user.liked.push(req.query.id);
                user.save(function(err){
                    err&&(console.log(err));
                    res.json({state:1});
                });

            });

        });
    else
        Comment.update({_id:req.query.id},{$inc:{likes:-1}}).exec(function(err){
            err&&(console.log(err));

            User.findOne({_id:req.session.user.id}).exec(function(err,user){
                err&&(console.log(err));

                user.liked.remove(req.query.id);
                user.save(function(err){
                    err&&(console.log(err));
                    res.json({state:1});
                });
            });
        });
};

exports.addSubComment=function(req,res){

    var content=req.query.content,
        commentId=req.query.commentId,
        movieId=req.query.movieId;

    Comment.update({_id:commentId},{$inc:{comments:1}}).exec(function(err){});
    new Comment({content:content,to:commentId,from:req.session.user._id,movieId:movieId}).save(function(err,instance){
        if(err) console.log(err);
        res.json({state:instance._id});

    });

};

exports.getSubComments=function(req,res){

    Comment.find({to:req.query.commentId}).populate('from').sort({likes:-1}).exec(function(err,comments){
        comments.forEach(function(ele,index,group){
            if(req.session.user)
                for(let item of req.session.user.liked)
                    ele._id.toString()==item&&(group[index].commented=true);

            var data=fs.readFileSync('public'+ele.from.headpath);
            comments[index].headuri='data:image/png;base64,' + data.toString('base64');
        });

        if(err) cosnole.log(err);

        res.json(JSON.stringify(comments));
    });
};