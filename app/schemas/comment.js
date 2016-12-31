/**
 * Created by Administrator on 2016/11/30.
 */

/**
 * Created by Administrator on 2016/9/13.
 */
var mongoose = require('mongoose'),
    ObjectId=mongoose.Schema.Types.ObjectId;

var CommentSchema = new mongoose.Schema({
    movieId:{
        type:ObjectId,
        ref:'Movie'
    },
    from:{
        type:ObjectId,
        ref:'User'
    },
    to:{
        type:ObjectId,
        ref:'Comment'
    },
    content:String,
    likes:{
        type:Number,
        default:0
    },
    createAt:{
        type:Date,
        default:Date.now()
    },
    comments:{
        type:Number,
        default:0
    },
    commented:{
        type:Boolean,
        default:false
    },
    headuri:{
        type:String,
        default:''
    } //因为从MongoDB中取出的对象不可以添加不属于schema的属性,留这个添加头像数据
});


CommentSchema.statics = {

    findById: function (id, cb) {
        return this
            .findOne({_id: id})
            .exec(cb);
    }
};


module.exports = CommentSchema;
