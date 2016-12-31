var Movie = require('../models/movie');
var Comment=require('../models/comment');
var Category=require('../models/category');
var User=require('../models/user');
var request=require('request');
var Form=require('formidable');
var fs=require('fs');


function classify(result){   //根据保存到movie中的电影数据进行分类
    for(let item of result.category)
        Category.findOne({name:item}).exec(function(err,category){
            category.movies.push(result._id);
            category.save(function(err){
                err&&(console.log(err));
            });
        })

    Category.findOne({name:result.country}).exec(function(err,category){
        category.movies.push(result._id);
        category.save(function(err){
            err&&(console.log(err));
        });
    });

    Category.findOne({name:result.year}).exec(function(err,category){
        category.movies.push(result._id);
        category.save(function(err){
            err&&(console.log(err));
        });
    });
}


//Moviedetail page
exports.movieDetail=function (req, res) {
    var id = req.params.id;
    Movie.findById(id, function (err, movie) {

        err&&(console.log(err));

        var liked=[];  //获取用户点赞id
        if(req.session.user)
            new Promise(function(resolve,reject){  //如果用户已登录,则同步执行获取点赞id
                User.findOne({_id:req.session.user._id}).exec(function(err,result){
                    err&&(console.log(err));
                    liked=result.liked;
                    resolve();
                });
            });

        Comment.find({movieId:id}).populate('from').sort({likes:-1}).exec(function(err,comments){
            err&&(console.log(err));

            comments.forEach(function(ele,index){
                if(ele.to)
                    comments.splice(index,1);
            });

            if(liked.length!==0)
                comments.forEach(function(ele,index){

                    for(let item of liked)
                        if(ele._id.toString()==item.toString()){
                            comments[index].commented=true;
                            return;
                        }
                });

            res.render('detail', {
                title: 'SilentSword '+movie.title.replace(/\s/g,''),
                movie: movie,
                comments:comments
            });


        });
    })
};

//Movies list page
exports.movieList=function (req, res) {


    Movie.fetch(function (err, movies) {
        err&&(console.log(err));

        res.render('list', {
            title: 'imooc 列表页',
            movies: movies
        });
    });
};


//admin page
exports.addMovie=function (req, res) {
    res.render('admin', {
        title: 'SilentSword 后台录入页'
    })
};


//admin post movie
exports.addMovieP=function (req, res) {

    if(req.body.movie){

        var movie=req.body.movie;
        new Movie({
            title:movie.title.split('').join(' '),
            director:movie.director,
            country:movie.country,
            summary:movie.summary,
            address:movie.address,
            year:movie.year,
            category:movie.category
        }).save(function(err,result){

            req.session.data=result._id;//id用于设置图片名

            res.end();
            classify(result);

        });
    }
    else{
        var id=req.session.data;
        delete req.session.data;

        var form=new Form.IncomingForm();
        form.uploadDir='public/images/tmp';

        form.parse(req,function(err,fields,file){
            var oldPath=file.postPic.path,
                type=file.postPic.name.slice(file.postPic.name.lastIndexOf('.')+1),
                target=`public/images/movieCovers/${id}.${type}`;

            fs.rename(oldPath,target,function(err){
                if(err) console.log(err);

                Movie.update({_id:id},{$set:{poster:target.slice(7)}}).exec(function(err){
                    err&&(console.log(err));

                    res.json({state:id});
                });
            });
        });
    }
};

//delete
exports.deleteMovie=function (req, res) {
    var id = req.query.id;
    Movie.findOne({_id:id}).exec(function(err,movie){
        Movie.remove({_id: id}, function(err){

            res.json({state: 1});

            for(let item of movie.category)  //从category删除对应的分类id
                Category.findOne({name:item}).exec(function(err,result){
                    result.movies.remove(id);
                    result.save(function(err){
                        err&&(console.log(err));
                    });
                });

            Category.findOne({name:movie.year}).exec(function(err,result){  //删除年份分类

                result.movies.remove(id);
                result.save(function(err){
                    err&&(console.log(err));
                });
            });

            Category.findOne({name:movie.country}).exec(function(err,result){  //删除国家分类
                result.movies.remove(id);
                result.save(function(err){
                    err&&(console.log(err));
                });
            });

            Comment.find({movieId:id}).exec(function(err,comments){


                err&&(console.log(err));
                var commentIdGroup=[];   //收集所有被删除的评论id用于删除相关用户对评论点赞

                for(let item of comments)
                    commentIdGroup.push(item._id);

                User.find({}).exec(function(err,users){
                    for(let itemU of users) {
                        for (let itemC of commentIdGroup)
                            if (itemU.liked.indexOf(itemC) !== -1)
                                itemU.liked.splice(itemU.liked.indexOf(itemC), 1);

                        new Promise(function (resolve, reject) {
                            itemU.save(function(){
                                resolve();
                            })
                        });
                    }

                });

                Comment.remove({movieId:id}).exec(function(){});
            });
        });
    });
};

//验证id或者title
exports.verify=function(req,res){
   if(req.query.form=='2'){
       Movie.findOne({douban:{id:req.query.id}}).exec(function(err,result){
           err&&(console.log(err));

           if(result) res.json({state:0});
           else res.json({state:1});
       });
   }
   else
       Movie.findOne({title:req.query.title}).exec(function(err,result){
           err&&(console.log(err));

           if(result) res.json({state:0});
           else res.json({state:1});
       });
};

//获取以豆瓣提交的数据
exports.douban=function(req,res){

    var Res=res;
    request(`https://api.douban.com/v2/movie/subject/${req.body.movie.douban}`, function (error, res, body) {

        if(res.statusCode=='404') {
            Res.json({state: 0});
            return;
        }

        var data=JSON.parse(body);

        new Movie({
            title:data.title.split('').join(' '),//将字符拆开便于全文索引
            director:data.directors[0].name,
            address:req.body.movie.address,
            country:req.body.movie.country,
            poster:data.images.large,
            summary:data.summary,
            year:parseInt(data.year)<2003?'更早':data.year,
            category:req.body.movie.category,
            douban:{id:req.body.movie.douban}

        }).save(function(err,result){
            err&&(console.log(err));

            Res.json({state:result._id});
            classify(result);
        });
    });
};


