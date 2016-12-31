/**
 * Created by Administrator on 2016/11/27.
 */
var moogoose=require('mongoose');
var user=moogoose.model('User',require('../schemas/user'));
module.exports=user;