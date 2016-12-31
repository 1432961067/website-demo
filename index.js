/**
 * Created by Administrator on 2016/9/12.
 */
var express = require("express");
var path = require('path');
var favicon = require('serve-favicon');
var session=require('express-session');
var mongoStore=require('connect-mongo')(session);
var mongoose = require('mongoose');
var cookieParser=require('cookie-parser');
var logger=require('morgan');

var port = process.env.PORT || 3000;
var app = express();
var dbUrl="mongodb://127.0.0.1:27017/My";

mongoose.connect(dbUrl);

app.use(favicon(path.join(__dirname,'public','favicon.ico'))); //设置网站图标
app.use(require('body-parser').urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));//静态文件配置的目录
app.use(cookieParser());
app.use(session({
    secret:'SilentSword',
    saveUninitialized: true,
    resave:false,
    store:new mongoStore({
        url:dbUrl,
        collection:'sessions'
    })
}));

app.use(logger('dev'));

app.set('views','./app/views/pages');
app.set('view engine','pug');
app.locals.moment = require('moment');
app.listen(port);

console.log('silentSword start:'+ port);

require('./config/routes.js')(app);

