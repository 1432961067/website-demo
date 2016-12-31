/**
 * Created by Administrator on 2016/11/26.
 */
$(function(){
    $('.del').on('click',function(e){
        var id=$(e.target).data('id');
        var tr=$(`.item-id-${id}`);

        $.ajax({
            type:'GET',
            url:'/admin/list/delete?id='+id,
            dataType:'json',
            success:(data)=>{

                if(data.state==1&&tr.length>0)
                    tr.remove();
                else location.href='/refused';
        }
    });
    });
});