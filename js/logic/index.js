AV.init({
    appId: "yNEf7jl2uUskO9HlnSiKjAWU-gzGzoHsz",
    appKey: "uYOq35PscfChdJ4Xv8EoqUQb"
});

function addToCart(id,dom){
    var Cid = sessionStorage.getItem("Customer_ID")
    if(!Cid){
        alert("Please Login First！")
        $('#myModal88').modal('show');
        return
    }
    var customer = AV.Object.createWithoutData('Customer', Cid)
    var sku = AV.Object.createWithoutData('Product_SKU', id)

    var cart_query = new AV.Query("Shoping_Cart")
    cart_query.equalTo("customer",customer)
    cart_query.equalTo("sku",sku)
    cart_query.first().then(function(res){
        if(res){
            res.set("quantity",res.get("quantity")+1)
            res.save();
        }else{
            var cart = new AV.Object("Shoping_Cart")
            cart.set("quantity",1);
            cart.set("customer",customer)
            cart.set("sku",sku)
            cart.save();
        }
        $(dom).text("Already added to the shopping cart")
        setTimeout(function(){
            $(dom).text("Add to cart")
        },1000)
    })  
}
$(function(){
    
    function loadData(){
        // 加载手机数据
        var phone_pro = new AV.Query('Product')
        phone_pro.equalTo("categoryName","Mobile Phone")

        var phone_sku = new AV.Query('Product_SKU');
        phone_sku.limit(3)
        phone_sku.descending('createdAt');
        phone_sku.include(['product'])
        phone_sku.matchesQuery("product",phone_pro)
        phone_sku.find().then(function(res){
            $("#home > .agile_ecommerce_tabs").html(template("product",{data:res}))
        })


        // 加载配件信息
        var accessories_pro = new AV.Query('Product')
        accessories_pro.equalTo("categoryName","Accessory")

        var accessories_sku = new AV.Query('Product_SKU');
        accessories_sku.limit(3)
        accessories_sku.descending('createdAt');
        accessories_sku.include(['product'])
        accessories_sku.matchesQuery("product",accessories_pro)
        accessories_sku.find().then(function(res){
            $("#audio > .agile_ecommerce_tabs").html(template("product",{data:res}))
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
                alert("repeated emails");
                return
            }
            if(c_pwd != pwd){
                alert("passwords are inconsistent");
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
                alert("Incorrect Username or Password");
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
            if(confirm("Login out？")){
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