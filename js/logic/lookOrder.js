AV.init({
    appId: "yNEf7jl2uUskO9HlnSiKjAWU-gzGzoHsz",
    appKey: "uYOq35PscfChdJ4Xv8EoqUQb"
});

var order;
var orderId = GetRequest()["orderId"]

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

function GetRequest() {
    var url = location.search; //获取url中"?"符后的字串  
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

function settlement() {
    var region = $("#select-region").val()
    var add_desc = $("#address_desc").val().trim()
    var contactName = $("#contactName").val().trim()
    var contactPhone = $("#contactPhone").val().trim()
    var payment = $("[name='payment']:checked").val()

    
    if (!region) {
        alert("请选择地区.")
        return
    }
    if (!add_desc) {
        alert("请填写地址.")
        return
    }
    if (!contactName) {
        alert("请填写联系人.")
        return
    }
    if (!contactPhone) {
        alert("请填写电话.")
        return
    }

    order.set("address", region + " " + add_desc)
    order.set("contactName", contactName)
    order.set("contactPhone", contactPhone)
    order.set("payment",payment)
    order.set("state","Paied")
    order.save().then(function(){
        window.location.href = "paymentresult.html"
    })
}

$(function () {
    checkLogin()

    // load order
    order = AV.Object.createWithoutData('Order', orderId)
    order.fetch().then(function (data) {
        order = data
        $("#totalPrice").text("$" + data.get("totalPrice"))
    })

})