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

function clearSelected(){
    var selected = $("#cart_item_table tr.act")
    for (var i = 0; i < selected.length; i++) {
        var cart_id =  $(selected[i]).attr("cartItemId")
        var cart_item = AV.Object.createWithoutData('Shoping_Cart', cart_id)
        cart_item.destroy().then(function(item){
            $("tr[cartItemId="+item.id+"]").remove();
        })
    }
}


function checkOut(){
    $("#go_to_order").text("Submitting....")
    var Cid = sessionStorage.getItem("Customer_ID")
    var customer = AV.Object.createWithoutData('Customer', Cid)

    var order_total_price = 0
    var order = new AV.Object("Order")
    order.set("customer",customer)
    order.save().then(function(o){
        var selected = $("#cart_item_table tr.act")
        for (var i = 0; i < selected.length; i++) {
            var cart_id =  $(selected[i]).attr("cartItemId")
            var cart_item = AV.Object.createWithoutData('Shoping_Cart', cart_id)
            cart_item.fetch({ include: ['sku','customer'] }).then(function (item) {
                var order_item = new AV.Object("Order_Item")
                order_item.set("sku",item.get("sku"))
                order_item.set("quantity",item.get("quantity"))
                order_item.set("order",o)
                 
                var subtotal = parseInt(item.get("sku").get("discountPrice")) * parseInt(item.get("quantity"))
                order_item.set("subtotal",subtotal)
                order_total_price += subtotal
                order_item.save();
                cart_item.destroy();
            });
        }
       
        setTimeout(function(){
            var order =  AV.Object.createWithoutData('Order', o.id)
            order.set("totalPrice",order_total_price)
            order.save().then(function(){
                window.location.href = "lookOrder.html?orderId="+o.id
            },function(){
                alert("System error")
            });
            
        },1500)
    });
}



function combined() {
    var selected = $("#cart_item_table tr.act")
    var total_price = 0;
    var total_amount = 0;
    for (var i = 0; i < selected.length; i++) {
        var item =  $(selected[i])
        total_price += parseFloat(item.attr("discountPrice")) * parseInt(item.attr("quantity"))
        total_amount += parseInt(item.attr("quantity"))
    }
    $("#total_amount").text(total_amount)
    $("#total_price").text("$" + total_price);
    
}


function checkedItem(dom) {
    if ($(dom).attr('checked')) {
        $(dom).closest("tr").addClass("act")
        if ($("[name='cart_item_checkbox']").length == $("[name='cart_item_checkbox']:checked").length) {
            $("#js_all_selector").attr("checked", true);
        }
    } else {
        $(dom).closest("tr").removeClass("act")
        $("#js_all_selector").attr("checked", false);
    }
    combined();

}
function chooseAll(dom) {
    $("[name='cart_item_checkbox']").attr('checked', !!$(dom).attr("checked")).change();
}

function addQuantity(dom) {
    var input = $(dom).prev()
    input.val(parseInt(input.val()) + 1)
    input.change()
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
    combined();
}

function deleteCartItem(dom, cartItemId, title) {
    if (confirm("Delete " + title + " from the shopping cart？")) {
        var cartItem = AV.Object.createWithoutData('Shoping_Cart', cartItemId)
        cartItem.destroy();
        $(dom).closest("tr").remove();
    }
    combined();
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
        $("#cart_item_body").html(template("cart_item_temp", data))
        combined();
    })


})