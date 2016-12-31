'use strict';
var datauri=null;

    if(sessionStorage.getItem('name'))
        $.ajax({  //进入页面就获取头像信息,避免评论时重复获取
            type:'GET',
            url:'/comment/getHead',
            dataType:'json',
            success:function(data){
                datauri=data.datauri;
            }
        });

$('.like').click(function(e){   //点赞
    if(!sessionStorage.getItem('name')){
        $('#signinModal').modal('show');
        return false;
    }
    var username=sessionStorage.getItem('name'),
        text=$(e.target).text();

    if(username==$(e.target).parents('.subComment').find('.card-title a').text()||
    username==$(e.target).parents('.card').find('.card-title a').text()){
        alert('不允许给自己点赞');
        return false;
    }

    var interpolation=null,number=null;
    var id=$(e.target).next().text();
    if(text[0]=='赞') {
        number = parseInt($(e.target).text().slice(2));
        ++number;
        interpolation = '取消赞';
    }
    else {
        number = parseInt($(e.target).text().slice(4));
        --number;
        interpolation = '赞';
    }
    $.ajax({
        type:'GET',
        url:'/comment/like?id='+id+'&interpolation='+interpolation,
        success:function(data){
            if(data.state)
                $(e.target).text(interpolation+'('+number+')');
        }
    });
});


$('.fa-comment').click(function(e){  //打开子评论
    var text=$(e.target).text(),
        subComments=$(e.target).parents('.card').find('.subComments'),
        angleUp=$(e.target).parents('.card').find('.fa-angle-up');

    if(text[0]==='评') {

        subComments.css({display:'block'});
        subComments.css({border:'1px solid rgb(221,221,221)',borderRadius:'3px'});
        subComments.find('.form').css({paddingLeft:'10%'});
        $(e.target).text('收起评论');
        angleUp.css({display:'block'});

        $.ajax({
            type:'GET',
            url:'/comment/getSubComments?commentId='+$(e.target).parents('.card').find('.commentId').text(),
            dataType:'json',
            success:function(data){
                data=JSON.parse(data);
                for(var item=0;item<data.length;item++){

                    var subSample=$('.subComment-sample').clone(true,true).removeClass('subComment-sample').addClass('subComment');
                    subSample.find('.card-title a').text(data[item].from.name).attr({href:'/user/'+data[item].from._id,target:'_blank'});
                    subSample.find('.card-text').text(data[item].content);
                    subSample.find('.commentDate').text(data[item].createAt.substring(0,10)+' '+(parseInt(data[item].createAt.substring(11,13))+8)+data[item].createAt.substring(13,19));
                    if(data[item].commented)
                        subSample.find('.fa-thumbs-up').text('取消赞('+data[item].likes+')');
                    else
                        subSample.find('.fa-thumbs-up').text('赞('+data[item].likes+')');
                    subSample.find('.commentId').text(data[item]._id);
                    subSample.find('.userCommentHead').css({backgroundImage:'url('+data[item].headuri+')'}).attr({href:'/user/'+data[item].from._id,target:'_blank'});
                    subComments.find('.form').before(subSample);
                    subComments.find('.form').before($('<hr>'));
                }
            }

        });
    }

    else if(text=='添加评论'){
        subComments.css({display:'block'});
        $(e.target).text('收起评论');
    }
    else{
        subComments.css({display:'none'});
        var length=subComments.find('.subComment').length-1;
        angleUp.css({display:'none'});

        if(length) $(e.target).text('评论('+length+')');
        else $(e.target).text('添加评论');
    }
});

$('.subComment-submit').click(function(e){  //提交子评论

    if(!sessionStorage.getItem('name')){
        $('#signinModal').modal('show');
        $(e.target).parents('form').find('input').val(null);
        return false;
    }

    var text=$(e.target).parents('.subComment').find('.form-control').val();
    if(text=='')
        $(e.target).parents('.subComment').find('.form-control').val('请填写该字段');
    else{
       $.ajax({
           type:'GET',
           url:'/comment/subcommentsave?content='+text+'&commentId='+$(e.target).parents('.card').children('.card-block').find('.commentId').text()+'&movieId='+location.pathname.slice(7),
           dataType:'json',
           success:function(data){    //修改DOM,不刷新页面显示子评论

               var subComments=$(e.target).parents('.card').find('.subComments'),
                   date=new Date();

               subComments.css({border:'1px solid rgb(221,221,221)'});

               var subSample=$('.subComment-sample').clone(true,true).css({display:'block'}).removeClass('subComment-sample').addClass('subComment');
               subSample.find('.card-title a').text($('.navbar-text span:eq(0)').text().slice(8));
               subSample.find('.card-text').text(text);
               subSample.find('.commentDate').text(date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds());
               subSample.find('.commentId').text(data.state);
               subSample.find('.userCommentHead').css({backgroundImage:'url('+datauri+')'}).attr({href:'/user/'+sessionStorage.getItem('id'),target:'_blank'});
               subComments.find('.form').before(subSample);
               subComments.find('.form').before($('<hr>'));
               subComments.find('.form').css({paddingLeft:'10%'});
               $(e.target).parents('.card').find('.fa-angle-up').css({display:'block'});
               $(e.target).parents('form').find('input').val(null);
           }
       });
    }

    return false;
});

$('.submitComment').click(function(e){
    var sample=$('.sample').clone(true,true);
    if($('textarea').val().length<5){
        alert('评论字符数不得小于5');
        return false;
    }

    $.ajax({
        type:'POST',
        url:'/comment/save',
        data:$(e.target).parents('form').serialize(),
        dataType:'json',
        success:function(data){

                var date=new Date();sample.removeClass('sample');
               sample.find('.card-title a').text($('.navbar-text span:eq(0)').text().slice(8)).attr({href:'/user/'+sessionStorage.getItem('id'),target:'_blank'});
               sample.find('.card-text').text($(e.target).parents('form').find('textarea').val());
               sample.find('.card-block .commentDate').text(date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds());
               sample.find('.commentId').text(data.id);
               sample.find('.userCommentHead').css({backgroundImage:'url('+datauri+')'}).attr({href:'/user/'+sessionStorage.getItem('id'),target:'_blank'});
                $('.sample').after(sample);

               $('textarea').val('');
           }

    });

    return false;
});







