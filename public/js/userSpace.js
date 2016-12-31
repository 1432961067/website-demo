/**
 * Created by Administrator on 2016/12/9.
 */

$(function () {
    $('[data-toggle="tooltip"]').tooltip();  //开启tooltip功能
});

$('.movie').addClass('selected');
var linePosition=0; //选项卡下面横线的初始位置
//moveLine

$('.userSpace-nav>a').mouseenter(function(e){
    if(e.target.nodeName==='DIV') return;
    $('.userSpace-nav .line').css({marginLeft:$('.userSpace-nav a').index(e.target)*100+15+'%'});
});

$('.userSpace-nav').mouseleave(function(){
    $('.userSpace-nav .line').css({marginLeft:linePosition*100+15+'%'});
});

//删除收藏
$('.delete').click(function(e){
    e.stopPropagation();
    $('#deleteModal').modal('show');
    var title=$(e.target).parent('.caption').find('h4').text(),
        target=$(e.target).parents('.col-md-3');
    $('#deleteModal .btn-default').click(function(e){
        $.ajax({
            type:'GET',
            url:'/user/deleteFavourite?title='+title,
            dataType:'json',
            success:function(data){
                target.remove();
            }
        });
    });
});

//切换选项卡
$('.userSpace-nav>a').click(function(e){
    var target=e.target.nodeName=='A'?$(e.target):$(e.target).parent('a');
    if(target.hasClass('selected')) return;

    var index=$('.userSpace-nav>a').index(target);
    $('.body .row').removeClass('selected');
    $('.body .row:eq('+(++index)+')').addClass('selected');
    linePosition=--index;
    $('.userSpace-nav .line').css({marginLeft:index*100+15+'%'});
});

//预览图片
var form=new FormData();  //存放图片数据
var flag=false;  
$('#postInput').change(function(e){

    var path=$(e.target).val(),
        fileType=path.slice(path.lastIndexOf('.')+1).toLowerCase();

    if(fileType!=='jpg'&&fileType!=='png') {
        alert('请上传jpg或者png格式的图片');
        return;
    };
    form.append('postPic',e.target.files[0]);
    flag=true;

    var reader=new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload=function(e){
        $('.preview').css({backgroundImage:'url('+e.target.result+')'});
    };

});

//上传图片
$('.btn-success').click(function(e){
    if(!flag) return;

    $.ajax({
        type:'POST',
        url:'/user/updateHead',
        data:form,
        contentType: false, //不可缺参数
        processData: false, //不可缺参数
        success:function(data){
            location.reload();
        }
    });
});
