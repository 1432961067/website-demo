/**
 * Created by Administrator on 2016/11/29.
 */
var index = require('../app/controllers/index');
var movie = require('../app/controllers/movie');
var user = require('../app/controllers/user');
var comment = require('../app/controllers/comment');
var User=require('../app/models/user.js');
var fs=require('fs');
var moment=require('moment');

//pre handle
module.exports=function(app) {
    app.locals.moment=moment;
    app.use(function (req, res, next) {  //预处理

        if(req.session.user)

            User.findOne({_id:req.session.user._id}).exec(function (err, result) {
                req.session.user = result;
                app.locals.user = req.session.user;
                next();
            });
         else {
            next();
            app.locals.user=null;
        }

    });

//index page
    app.get('/', index.index);

//Moviedetail page
    app.get('/movie/:id', movie.movieDetail);
//Movies list page
    app.get('/admin/list', movie.movieList);
//admin page
    app.get('/admin/movie',user.authorityRequired,movie.addMovie);
//admin post movie
    app.post('/admin/movie/new', movie.addMovieP);
//delete
    app.get('/admin/list/delete', user.authorityRequired,movie.deleteMovie);
//验证豆瓣id和电影名称
    app.get('/admin/verify',movie.verify);
//接收豆瓣电影数据
    app.post('/admin/douban',movie.douban);

//userList
    app.get('/admin/userlist',user.authorityRequired,user.userList);
//sign up page
    app.post('/user/signup', user.signup);
//sign in page
    app.post('/user/signin', user.signin);
//注册验证账户
    app.get('/verify', user.verify);
//退出登录状态
    app.get('/logout', user.logout);
//拒绝访问
    app.get('/refused',user.refused);
//激活账户
    app.get('/user/activateAccount/:id',user.activateAccount);
//添加收藏
    app.get('/user/addFavourites',user.addFavourites);
//删除收藏
    app.get('/user/deleteFavourite',user.deleteFavourite);
//上传预览图片
    app.post('/user/updateHead',user.updateHead);
//获取验证码
    app.get('/user/captcha',user.getCaptcha);
//个人空间
    app.get('/user/:id',user.userSpace);


    //comment.js
    app.post('/comment/save',comment.addComment);
    //Likes
    app.get('/comment/like',comment.like);
    //postSubComment
    app.get('/comment/subcommentsave',comment.addSubComment);
    //getSubComments
    app.get('/comment/getSubComments',comment.getSubComments);
    //获取头像
    app.get('/comment/getHead',comment.getHead)
};


