/**
 * Created by Administrator on 2016/12/17.
 */

$(function () {
    $('[data-toggle="tooltip"]').tooltip();  //开启tooltip功能
});
    //详细信息提交电影
$('#inputTitle').blur(function(e){

    $.ajax({
        type:'GET',
        url:'/admin/verify?title='+$(e.target).val().split('').join(' ')+'&form=1',
        dateType:'json',
        success:function(data){
            if(!data.state) {
                $('#errorTitle').css({display: 'block'});
                $('#explicit-info .btn-primary').attr({disabled:true});
            }
        }
    });
}).focus(function(e){
    $('#errorTitle').css({display:'none'});
    $('#explicit-info .btn-primary').attr({disabled:false});
});

var form=new FormData();  //承载图片数据
var flag=false;
$('#uploadPoster').change(function(e){

    var path=$(e.target).val(),
        fileType=path.slice(path.lastIndexOf('.')+1).toLowerCase();

    if(fileType!=='jpg'&&fileType!=='png') {
        alert('请上传jpg或者png格式的图片');
        return;
    };

    var reader=new FileReader();
    reader.readAsDataURL(e.target.files[0]);

    form.append('postPic',e.target.files[0]);
    flag=true;
    reader.onload=function(e){
        $('#showPoster').css({backgroundImage:'url('+e.target.result+')'});
    };
});

$('#explicit-info form:eq(1) button').click(function(e){

    if(!flag){
        alert('请上传图片');
        return false;
    }

    if(!$('#explicit-info form:eq(1)')[0].checkValidity())
        return;

    if(!$('#explicit-info [type="checkbox"]:checked')[0]) {
        alert('请选择电影类别');
        return false;
    }

        $.ajax({
            type:'POST',
            url:'/admin/movie/new',
            data:$('#explicit-info form:eq(1)').serialize(),
            success:function(data){

                $.ajax({   //先提交文本数据再提交图片数据
                    type:'POST',
                    data:form,
                    url:'/admin/movie/new',
                    contentType:false,
                    processData:false,
                    dataType:'json',
                    success:function(data){
                        location.href='/movie/'+data.state;
                    }
                });

                return false;
            }
        });

    return false;
});


    //表单切换
$('.info').click(function(e){

    $('#explicit-info').css({display:'block'});
    $('#douban-info').css({display:'none'});
    $('.douban').removeClass('selected');
    $(e.target).addClass('selected');
});

$('.douban').click(function(e){
    $('#explicit-info').css({display:'none'});
    $('#douban-info').css({display:'block'});
    $('.info').removeClass('selected');
    $(e.target).addClass('selected');
});

    //豆瓣同步提交电影
$('#douban-info .form-group:eq(0) input').blur(function(e){
    if($(e.target).val().length<7||$(e.target).val().length>9){
        $('#errorDouban').css({display:'block'});
        $('#douban-info .btn-primary').attr({disabled:true});
        return;
    }

    $.ajax({
        type:'GET',
        url:'/admin/verify?id='+$(e.target).val()+'&form=2',
        dateType:'json',
        success:function(data){

            if(!data.state) {

                $('#errorDouban').css({display: 'block'});
                $('#douban-info .btn-primary').attr({disabled:true});
            }
        }
    });
}).focus(function(e){
    $('#errorDouban').css({display:'none'});
    $('#douban-info .btn-primary').attr({disabled:false});
});

$('#douban-info .btn-primary').click(function(e){

    if(!$('#douban-info form')[0].checkValidity())
        return;

    if(!$('#douban-info [type="checkbox"]:checked')[0]) {
        alert('请选择电影类别');
        return;
    }

    $.ajax({
        type:'POST',
        data:$('#douban-info form').serialize(),
        dataType:'json',
        url:'/admin/douban',
        success:function(data){
            if(!data.state)
                alert('豆瓣没有该id');
            else
                location.href='/movie/'+data.state;
        }
    });

    return false;
});




