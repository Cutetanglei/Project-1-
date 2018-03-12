AV.init({
    appId: "yNEf7jl2uUskO9HlnSiKjAWU-gzGzoHsz",
    appKey: "uYOq35PscfChdJ4Xv8EoqUQb"
});

checkLogin()

var user_id = sessionStorage.getItem("Customer_ID")

function checkLogin() {
    if (sessionStorage.getItem("Customer_Name")) {
        logined(sessionStorage.getItem("Customer_Name"))
    } else {
        window.location.href = "index.html"
    }
};

function logined(name) {
    $(".w3l_login > a").prepend(name).attr("data-target", null).on("click", function () {
        if (confirm("Login out？")) {
            logout();
        }
    })
    $(".w3l_login > a > span").removeClass("glyphicon-user").addClass("glyphicon-remove")
}
function logout() {
    sessionStorage.removeItem("Customer_ID")
    sessionStorage.removeItem("Customer_Name")
    window.location.href = "index.html"
}

function saveUserInfo(){
    var mobile = $("#mobile").val()
    var sex = $("input[name='sex']:checked").val();
    if(mobile || sex){
        var user = AV.Object.createWithoutData('Customer', user_id);
        if(mobile){
            user.set("mobile",mobile)
        }
        if(sex){
            user.set("sex",sex)
        }
        user.save()
    }
    alert("Successful")
}

Date.prototype.format = function (fmt) { //author: meizz   
    var o = {
      "M+": this.getMonth() + 1,                 //月份   
      "d+": this.getDate(),                    //日   
      "h+": this.getHours(),                   //小时   
      "m+": this.getMinutes(),                 //分   
      "s+": this.getSeconds(),                 //秒   
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
      "S": this.getMilliseconds()             //毫秒   
    };
    if (/(y+)/.test(fmt))
      fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt))
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  }


function changePwd(){
    var old = $("#oldPwd").val().trim();
    var pwd = $("#pwd").val().trim();
    var c_pwd = $("#c_pwd").val().trim();
    if(!old){
        alert("Please fill in the OriginalPassword.")
        return;
    }
    if(!pwd){
        alert("Please fill in the new password.")
        return;
    }
    if(!c_pwd){
        alert("Please fill in the confirm password.")
        return;
    }
    if(c_pwd != pwd){
        alert("passwords are inconsistent.")
        return;
    }
    var query = new AV.Query('Customer');
    query.get(user_id).then(function(user){
        if(user.get("password") != old){
            alert("Incorrect original password")
            return;
        }
        user.set("password",c_pwd)
        user.save().then(function(){
            alert("Successful")
        })
    })
}


$(function(){
   

    function loadUserInfo(){
        var query = new AV.Query('Customer');
        query.get(user_id).then(function(user){
            $("#nickName").text(user.get("nickName"))
            $("#email").text(user.get("email"))
            $("#mobile").val(user.get("mobile"))
            $("input[value='"+user.get("sex")+"']").prop("checked",true)
        })
    }
    loadUserInfo();

    


    function loadUserOrder(){
        $("#order_box").html("")
        var user = AV.Object.createWithoutData('Customer', user_id);
        var order_query = new AV.Query('Order');
        order_query.equalTo("customer",user)
        order_query.addDescending("createdAt")
        order_query.find().then(function(orders){
            orders.map(function(order){
                new Promise((resolve)=>{
                    var order_item_query = new AV.Query('Order_Item');
                    order_item_query.equalTo("order",order)
                    order_item_query.include(["sku", "sku.product"])

                    order_item_query.find().then(function(items){
                        resolve(items)
                    })
                }).then((items)=>{
                    order["createdAt"] = new Date(order.get("createdAt")).format("yyyy-MM-dd hh:mm")
                    $("#order_box").append(template("order_temp",{order,items}))
                })
            })
        })
    }
    loadUserOrder()
})