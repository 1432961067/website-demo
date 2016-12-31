/**
 * Created by Administrator on 2016/11/29.
 */
var Movie = require('../models/movie');
var Category=require('../models/category');
var _ =require('underscore');
var request=require('request');
var fs=require('fs');


//index page
exports.index=function (req, res) {


    if(req.session.signup) {
        var prompt=true;
        delete req.session.signup;
    }

    if(req.query.search){

        Movie.find({$text:{$search:req.query.search.split('').join(' ')}},{score: {$meta: "textScore"}}).sort({score: {$meta: "textScore"}}).exec(function(err,result){

                    res.render('index',{
                        title: 'SilentSword 首页',
                        movies: result,
                        promptToActivateAccount:prompt
                    });
        });

        return;
    }

    req.query.time=='所有'&&(delete req.query.time);
    req.query.country=='所有'&&(delete req.query.country);
    req.query.type=='所有'&&(delete req.query.type);

    if(req.query.time||req.query.country||req.query.type){

        var moviesGroup=[],  //初步结果集合
            middle=[],      //保险
            moviesId=null,  //最终结果的Id
            movies=[],   //最终结果
            syncGroupOne=[],     //获取各个分类的数据
            syncGroupTwo=[];     //获取整体数据


        for(let item in req.query)
            syncGroupOne.push(new Promise(function(resolve,reject) {   //得到每一类的电影id
                Category.findOne({name: req.query[item]}).exec(function (err, result) {

                    err && (console.log(err));

                    result.movies.forEach(function(ele,index){
                        result.movies[index]=ele.toString();  //将objectId转为字符串
                    });

                    middle=middle.concat(result.movies);
                    moviesGroup.push(result.movies);

                    resolve();
                });
            }));

        Promise.all(syncGroupOne)    //将js的异步操作转为同步
            .then(function(){
                return new Promise(function(resolve,reject){

                    moviesId= _.intersection(moviesGroup[0],moviesGroup[1]||middle,moviesGroup[2]||middle);  //取得交集

                    for(let item of moviesId){
                        syncGroupTwo.push(new Promise(function(resolve,reject){
                            Movie.findOne({_id:item}).exec(function(err,result){
                                err&&(console.log(err));

                                movies.push(result);
                                resolve();
                            });
                        }));
                    }
                    resolve();
                });
            })
            .then(function(){
                return Promise.all(syncGroupTwo);    //得到整体数据
            })
            .then(function(){
                console.log(movies);
                res.render('index',{
                    title: 'SilentSword 首页',
                    movies: movies,
                    promptToActivateAccount:prompt
                });
            });
    }
    else
        Movie.fetch(function (err, movies) {
            err&&(console.log(err));
            res.render('index', {
                title: 'SilentSword 首页',
                movies: movies,
                promptToActivateAccount:prompt
            });
        });

};



