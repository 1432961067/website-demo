/**
 * Created by Administrator on 2016/9/13.
 */
var mongoose = require('mongoose');

var MovieSchema = new mongoose.Schema({
    director:String,
    title:{
        type:String,
        unique:true
    },
    country:String,
    summary:String,   //因为年代和国家用于分类,所以不能用豆瓣同步的数据
    address:{
        type:String,
        unique:true
    },
    poster:String,
    year:String,
    meta:{
        createAt:{
            type:Date,
            default:new Date()
        },
        updateAt:{
            type:Date,
            default:new Date()
        }
    },
    douban:{
        type:Object, //豆瓣id及后续数据承载
        default:{},
        unique:true
    },
    category:[String]  //分类
});



MovieSchema.statics = {
    fetch: function (cb) {
        return this
            .find({})
            .sort('meta.updateAt')
            .exec(cb);
    },
    findById: function (id, cb) {
        return this
            .findOne({_id: id})
            .exec(cb);
    }
};

MovieSchema.index({title:'text'});

module.exports = MovieSchema;