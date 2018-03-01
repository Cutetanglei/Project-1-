AV.init({
    appId: "yNEf7jl2uUskO9HlnSiKjAWU-gzGzoHsz",
    appKey: "uYOq35PscfChdJ4Xv8EoqUQb"
});
$(function(){
			
    $("#cusRegisterFrom").on("submit",function(e){
        e.preventDefault();
        var nickName = $("#reg_nickName").val();
        var email = $("#reg_email").val();
        var pwd = $("#reg_pwd").val();
        var c_pwd = $("#reg_c_pwd").val();
        
        var query = new AV.Query('Customer');
        query.equalTo("email",email)
        query.find().then((results)=>{
            if(results.length>0){
                alert("邮箱重复");
                return
            }
            if(c_pwd != pwd){
                alert("两次密码输入不一致");
                return
            }
            var Customer = AV.Object.extend('Customer');
            var customer =  new Customer();
            customer.save({
                nickName:nickName,
                email:email,
                password:pwd
            }).then(function(object) {
                $('#myModal88').modal('hide');
                sessionStorage.setItem("Customer_ID",object.id)
                sessionStorage.setItem("Customer_Name",object.attributes.nickName)
            })
        });
    })

    $("#cusLoginFrom").on("submit",function(e){
        e.preventDefault();
        var email = $("#login_email").val()
        var pwd = $("#login_pwd").val()

        var q_email = new AV.Query('Customer');
        q_email.equalTo("email",email)

        var q_pwd = new AV.Query('Customer');
        q_pwd.equalTo("password",pwd)

        var query = AV.Query.and(q_email,q_pwd)
        query.find().then((res)=>{
            if(res.length > 0){
                $('#myModal88').modal('hide');
                sessionStorage.setItem("Customer_ID",res[0].id)
                sessionStorage.setItem("Customer_Name",res[0].attributes.nickName)
            }else{
                alert("用户名或密码错误");
                return
            }
        })
    })

});