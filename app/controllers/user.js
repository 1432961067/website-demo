/**
 * Created by Administrator on 2016/11/29.
 */
var User = require('../models/user'),
    nodemailer=require('nodemailer'),
    Movie=require('../models/movie'),
    Form=require('formidable'),
    path=require('path'),
    fs=require('fs'),
    request=require('request'),
    ccap=require('ccap'),  //生成验证码
    bcrypt=require('bcryptjs'),
    SALT_WORK_FACTOR=10;

var captcha=ccap({  //设置验证码
    width:100,
    height:34,
    offset:20,
    quality:100,
    fontsize:30,
    generate:function(){
        var numbers=['1','2','3','4','5','6','7','8','9','0'],
            lowercase='abcdefghijklmnopqretuvwxyz',
            uppercase=lowercase.toUpperCase();

        var characters=numbers.concat(lowercase.split('')).concat(uppercase.split(''));
        var result=[];

        for(let i=0;i<4;i++)
            result[i]=characters[Math.floor(Math.random()*62)];

        return result.join('');
    }
});

//Users list page
exports.userList=function (req, res) {


    User.fetch(function (err, users) {
        if (err) {
            console.log(err);
        }

        res.render('userlist', {
            title: 'imooc 用户页',
            users: users
        });
    });
};


//sign up page
exports.signup=function (req, res) {
    var user = req.body.user;

    if(req.session.captcha!==req.body.user.captcha.toLowerCase()){
        res.json({state:0});
        return;
    }

    User.findOne({name:user.name}).exec(function(err,result){
        if(result) user=false;
    });

    User.findOne({email:user.email}).exec(function(err,result){
        if(result) user=false;
    });
    if(!user) return;//为了防止修改html代码强行注册

    bcrypt.genSalt(SALT_WORK_FACTOR,function(err,salt){
        err&&(console.log(err));

        bcrypt.hash(user.password,salt,function(err,hash){
            err&&(console.log(err));
            user.password=hash;

            new User(user).save(function (err, result) {

                if (err) console.log(err);
                var transporter=nodemailer.createTransport({
                    service:'QQ',
                    auth:{
                        user:'1275917839@qq.com', //你的邮箱地址
                        pass:'lsmbalavaipebada'  //你的授权码
                    }
                });
                var link=`http://localhost:3000/user/activateAccount/${result._id}`;
                var mailOptions={
                    from:'1275917839@qq.com',  //你的邮箱地址
                    to:req.body.user.email,
                    secure:true,
                    subject:'激活账户',
                    html:`<h3>欢迎尊敬的${req.body.user.name}用户注册本网站,请点击下方链接激活账户,该链接会在三天后过期</h3>
                    <a href=${link}>${link}</a>`
                };

                transporter.sendMail(mailOptions,function(err){
                    if(err) console.log(err);
                });
                req.session.signup=true;
                res.json({state:1});
            });
        });
    });


};

//sign in page
exports.signin=function (req, res) {
    var user = req.body.user;

    var {name,password,captcha}=user;

    User.findOne({name: name}, function (err, user) {
        if (err) console.log(err);
        if (!user) return res.json({state: 1});
        if(user.role===-1) return res.json({state:3});

        if(captcha.toLowerCase()!==req.session.captcha){
            res.json({state:5});
            return;
        }

        user.comparePassword(password, function (err, isMatched) {
            if (err) console.log(err);
            if (isMatched) {
                req.session.user=user;
                res.json({state:4,user:user});
            }
            else {
                res.json({state: 2});
            }
        });
    });
};


//注册验证账户和邮箱

exports.verify=function (req, res) {
    for(let data in req.query) {
        var sample={};sample[data]=req.query[data];
        User.findOne(sample, function(err, result){
            if(err) console.log(err);

        if (result) res.json({state: 0});
        else res.json({state: 1});
    });
    }
};

//退出登录状态
exports.logout=function (req, res) {
    delete req.session.user;

        res.redirect('/');

};

//拒绝访问
exports.refused=function(req,res){
    res.render('refused',{title:'SilentSword'});
};

//激活账户
exports.activateAccount=function(req,res){

    User.update({_id:req.params.id},{$set:{role:0}}).exec(function(err,result){
        if(err) console.log(err);

        User.update({_id:req.params.id},{$unset:{expiretime:''}}).exec(function(err){
            err&&(console.log(err));

            res.render('activated');
        });

    });

};

//个人空间
exports.userSpace=function(req,res){

    User.findOne({_id:req.params.id}).populate('favourites').exec(function(err,userSpace){

        if(err) console.log(err);

        var movies=userSpace.favourites;
        res.render('userSpace',{
            title:userSpace.name+'的个人空间',
            masterView:(req.session.user&&req.session.user._id)==req.params.id,  //确定查看个人空间的是游客还是用户,
            movies:movies,
            userSpace:userSpace  //用户信息
        });

    });

};

//添加收藏
exports.addFavourites=function(req,res){

    Movie.findOne({title:req.query.title}).exec(function(err,movie){
        if(err) console.log(err);

        User.findOne({_id:req.session.user._id}).exec(function(err,user){
            if(user.favourites.indexOf(movie._id)!==-1){
                res.json({state:0});
                return;
            }

            if(err) console.log(err);
            user.favourites.push(movie._id);

            user.save(function(err){
                err&&(console.log(err));

                res.json({state:1});
            });
        });
    });
};

//删除收藏
exports.deleteFavourite=function(req,res){

    Movie.findOne({title:req.query.title.split('').join(' ')}).exec(function(err,movie){
        if(err) console.log(err);

        User.findOne({_id:req.session.user._id}).exec(function(err,user){
            user.favourites.remove(movie._id);

            user.save(function(err){
                err&&(console.log(err));

                res.json({state:1});
            });
        });
    });
};

//上传图片
exports.updateHead=function(req,res){

    if(!/default/.test(req.session.user.headpath))  //如果不是default.jpg就删除
        fs.unlink('public'+req.session.user.headpath,function(err){
            console.log(err);
        });

    var form=new Form.IncomingForm();

    form.uploadDir = 'public/images/tmp';  //以当前项目根目录为初始目录

    form.parse(req,function(err,fields,file){

        var oldPath=file.postPic.path,
            type=file.postPic.name.slice(file.postPic.name.lastIndexOf('.')+1),
            target=`public/images/userHeads/${req.session.user._id}.${type}`;

        fs.rename(oldPath,target,function(err){
            if(err) console.log(err);

            User.update({_id:req.session.user._id},{$set:{headpath:target.slice(6)}}).exec(function(err){
                console.log(err);

                res.end();
            });
        });
    });
};


//权限认证
exports.authorityRequired=function (req, res,next) {
    var user=req.session.user;

    if(user&&user.role>100) next();
    else if(req.get('X-Requested-With')=='XMLHttpRequest')  res.json({state:0});
    else    res.redirect('/refused');
};

//获取验证码
exports.getCaptcha=function(req,res){

    var data=captcha.get();

    req.session.captcha=data[0].toLowerCase();

    res.json({state:'data:image/png;base64,'+data[1].toString('base64')});
};



