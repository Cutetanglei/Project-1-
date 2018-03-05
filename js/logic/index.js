AV.init({
    appId: "yNEf7jl2uUskO9HlnSiKjAWU-gzGzoHsz",
    appKey: "uYOq35PscfChdJ4Xv8EoqUQb"
});
$(function(){
    
    function loadData(){

        var phone_pro = new AV.Query('Product')
        phone_pro.equalTo("categoryName","Mobile Phones")

        var phone_sku = new AV.Query('Product_SKU');
        phone_sku.limit(3)
        // phone_sku.descending('createdAt');
        phone_sku.include(['product'])
        phone_sku.matchesQuery("product",phone_pro)
        phone_sku.find().then(function(res){
            console.log(res[0])
            var Mobile_Phones =  template("product",{data:res})
            $("#home").html(Mobile_Phones)
        })
    }
    
    loadData();
    

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
                login(object.id,object.attributes.nickName)
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
                login(res[0].id,res[0].attributes.nickName)
            }else{
                alert("用户名或密码错误");
                return
            }
        })
    })
    function checkLogin(){
        if(sessionStorage.getItem("Customer_Name")){
            logined(sessionStorage.getItem("Customer_Name"))
        }
    };
    checkLogin();

    function login(id,name){
        $('#myModal88').modal('hide');
        sessionStorage.setItem("Customer_ID",id)
        sessionStorage.setItem("Customer_Name",name)
        logined(name);
        
    }

    function logined(name){
        $(".w3l_login > a").prepend(name).attr("data-target",null).on("click",function(){
            if(confirm("退出登陆？")){
                logout();
            }
        }) 
        $(".w3l_login > a > span").removeClass("glyphicon-user").addClass("glyphicon-remove")
    }

    function logout(){
        sessionStorage.removeItem("Customer_ID")
        sessionStorage.removeItem("Customer_Name")
        window.location.reload();
    }

});