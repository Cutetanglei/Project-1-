AV.init({
    appId: "yNEf7jl2uUskO9HlnSiKjAWU-gzGzoHsz",
    appKey: "uYOq35PscfChdJ4Xv8EoqUQb"
});

function checkLogin() {
    if (sessionStorage.getItem("Customer_Name")) {
        logined(sessionStorage.getItem("Customer_Name"))
    } else {
        window.location.href = "index.html"
    }
};

function logined(name) {
    $(".w3l_login > a").prepend(name).attr("data-target", null).on("click", function () {
        if (confirm("退出登陆？")) {
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


function addQuantity(dom) {
    var input = $(dom).prev()
    input.val(parseInt(input.val()) + 1)
    input.change()
}


function checkedItem(dom){
    if($(dom).attr('checked')){
        $(dom).closest("tr").addClass("act")
    }else{
        $(dom).closest("tr").removeClass("act")
    }
    
}
function chooseAll(dom){
    $("[name='cart_item_checkbox']").attr('checked',!!$(dom).attr("checked")).change();
}

function reduceQuantity(dom) {
    var input = $(dom).next()
    var input_val = parseInt(input.val())
    if (input_val > 1) {
        input.val(input_val - 1)
        input.change()
    }
}

function quantityChanged(dom, cartItemId) {
    var quantity = parseInt($(dom).val())
    var cartItem = AV.Object.createWithoutData('Shoping_Cart', cartItemId)
    cartItem.set("quantity", quantity)
    cartItem.save();

    // 更新价格
    var tr = $(dom).closest("tr")
    tr.attr("quantity", quantity)

    var discountPrice = parseFloat(tr.attr("discountPrice"))
    var subtotal = tr.find("[name='subtotal']")
    subtotal.text("$" + (discountPrice * quantity))
    tr.attr("subtotal", discountPrice * quantity)
}

function deleteCartItem(dom, cartItemId, title) {
    if (confirm("从购物车中删除" + title + "？")) {
        var cartItem = AV.Object.createWithoutData('Shoping_Cart', cartItemId)
        cartItem.destroy();
        $(dom).closest("tr").remove();
    }
}


$(function () {
    checkLogin();

    var cart_query = new AV.Query("Shoping_Cart")
    cart_query.equalTo("customer", AV.Object.createWithoutData('Customer', sessionStorage.getItem("Customer_ID")))
    cart_query.include(['sku', 'sku.product'])
    cart_query.find().then(function (res) {
        var data = [];
        for (var i = 0; i < res.length; i++) {
            data.push({
                sku: res[i].get("sku"),
                pro: res[i].get("sku").get("product"),
                cart: res[i]
            })
        }
        $("#cart_item_body").html(template("cart_item_temp", { datas: data }))
    })


})