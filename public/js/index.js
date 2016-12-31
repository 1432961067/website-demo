/**
 * Created by Administrator on 2016/12/9.
 */

    // 收藏

$('.index-thumbnail .caption p .fa-heart').click(function(e){
    if(!sessionStorage.getItem('name')){
        $('.sign a:eq(0)').click();
        return;
    }

    var title=$(e.target).parents('.caption').find('h4').text();
    $.ajax({
        type:'GET',
        url:'/user/addFavourites?title='+title.split('').join(' '),
        dataType:'json',
        success:function(data){

                var span=$('<span/>',{text:'×'});
                var button=$('<button/>',{class:'close'}).data('dismiss','alert');
                if(data.state)
                    var div=$("<div/>",{
                        class:' alert alert-success alert-dismissible fade in',
                        text:'影片 '+title+' 已为您添加到收藏夹中'
                    });
                else
                    var div=$("<div/>",{
                        class:' alert alert-success alert-dismissible fade in',
                        text:'您已经收藏了该影片'
                    });
                button.attr('data-dismiss','alert');
                div.append(button.append(span));
                $('.container:eq(0)').before(div);

                setTimeout(function(){div.alert('close')},2000);

        }
    });
});



    // 筛选
    var groups=document.querySelectorAll('.filter-group');
    $('.filter-title').click(function(e){   //显示所有影片
        location.href='/';
    });

    $('.filter-group').mouseover(function(e){

        switch($('.filter-group').index($(e.target))){
            case 0:groups[0].childNodes[0].nodeValue='年代';break;
            case 1:groups[1].childNodes[0].nodeValue='国家';break;
            case 2:groups[2].childNodes[0].nodeValue='类型';break;
        }
    });

    $('.filter-option').mouseover(function(e){
        $(e.target).parents('.filter-group').mouseover();
    });

    $('.filter-option').mouseout(function(e){
        $(e.target).parents('.filter-group').mouseout();
    });

    $('.filter-group').mouseout(function(e){
        var text=e.target.childNodes[0].nodeValue,
            regExp=new RegExp('\\??([^=]+)=([^&]+)&?','g'),
            search=decodeURI(location.search);

        switch(text){
            case '年代':text='time';break;
            case '国家':text='country';break;
            case '类型':text='type';break;
        }

        var result=[];
        while(result=regExp.exec(search)){
            if(result[1]==text)
                result[2]!='所有'&&(e.target.childNodes[0].nodeValue=result[2]);
        };
    });





    $('.filter-option').click(function(e){
        $(e.target).parents('.filter-group').find('.filter-option').removeClass('filter-selected');  //移除选中项效果

        $(e.target).addClass('filter-selected');

        var query='';  //URL

        $('.filter-selected').each(function(){

            switch($(this).parents('.filter-group')[0].classList[3]){
                case 'time':query+=('time='+$(this).text()+'&');break;
                case 'country':query+=('country='+$(this).text()+'&');break;
                case 'type':query+=('type='+$(this).text()+'&');
            }
        });
        console.log(query);

        location.href='/?'+query.substring(0,query.length-1);
    });

    //对筛选的UI处理
    if(location.search&&!/search/.test(location.search)){
        $('.filter-option').removeClass('filter-selected');

        var href=decodeURI(location.href),
            search=href.slice(href.lastIndexOf('?')),
            regExp=new RegExp('\\??([^=]+)=([^&]+)&?','g');

        var result=[];

        while(result=regExp.exec(search)){

           document.querySelector('.'+result[1]).childNodes[0].nodeValue=result[2];

            $('.'+result[1]).find('.filter-option').each(function(){
               if($(this).text()==result[2]) {
                   $(this).addClass('filter-selected');

                   if(result[2]=='所有')
                       switch(result[1]){
                           case 'time':groups[0].childNodes[0].nodeValue='年代';break;
                           case 'country':groups[1].childNodes[0].nodeValue='国家';break;
                           case 'type':groups[2].childNodes[0].nodeValue='类型';break;
                       }
               }
           });
        }
    }

    //搜索

    $('.searchIcon').click(function(e){

        if($('#search').val()){
            location.href='/?search='+$('#search').val()
        }
    });

    $(document).keyup(function(e){  //回车搜索

        if(e.keyCode!==13) return;
        $('.searchIcon').click();

    });

    //轮播
    var interval=null;
    function carousel() {
        interval = setInterval(function () {
            $('.radio:checked + .gallery-item .next')[0].click();
        }, 2000);
    }

    $('.gallery').mouseenter(function(){
        clearInterval(interval);
    });

    $('.gallery').mouseleave(function(){
        carousel();
    });

    carousel();

//分页
var pages=Math.ceil($('.index-thumbnail>*').length/3); //得到总页数

$('.index-thumbnail>*:gt(2)').css({display:'none'});  //把第一页以外的隐藏掉
$('.page-item:eq(1)').addClass('active');  //激活第一页

$('.page-item:first-child').click(function(e){

    var order=parseInt($('.pagination .active').text());
    if(order==1) return false;

    $('.index-thumbnail>*').css({display:'none'});

    if($('.page-item').index($('.pagination .active'))==1&&pages>3) updatePaging(order-1);
    $('.pagination .active').removeClass('active');

    $('.index-thumbnail>*').slice((order-2)*3,(order-1)*3).css({display:'block'});
    $('.page-item').each(function(){
        if($(this).text()==order-1+'')
            $(this).addClass('active');
    });

    return false;
});

$('.page-item:last-child').click(function(e){


    var order=parseInt($('.pagination .active').text());
    if(order==pages) return false;

    $('.index-thumbnail>*').css({display:'none'});

    $('.pagination .active').removeClass('active');
    if(order%3==0&&pages>3) updatePaging(order+1);  //切换页码
    $('.index-thumbnail>*').slice(order*3,(order+1)*3).css({display:'block'}); //显示电影

    $('.page-item').each(function(){
        if($(this).text()==order+1+'')
            $(this).addClass('active');
    });

    return false;
});

$('.page-item').slice(1,$('.page-item').length-1).click(function(e){
    if($(e.target).hasClass('active')) return false;

    $('.index-thumbnail>*').css({display:'none'});
    var order=parseInt(e.target.childNodes[0].nodeValue);

    $('.pagination .active').removeClass('active');
    $('.index-thumbnail>*').slice((order-1)*3,order*3).css({display:'block'});
    $(e.target).parent().addClass('active');

});

function updatePaging(target){  //设置页码

    if((pages-target)>2){
        $('.page-item:eq(1) a').text(target);
        $('.page-item:eq(2) a').text(target+1);
        $('.page-item:eq(3) a').text(target+2);
    }
    else{
        $('.page-item:eq(1) a').text(pages-2);
        $('.page-item:eq(2) a').text(pages-1);
        $('.page-item:eq(3) a').text(pages);
    }
}


