AV.init({
    appId: "yNEf7jl2uUskO9HlnSiKjAWU-gzGzoHsz",
    appKey: "uYOq35PscfChdJ4Xv8EoqUQb"
});

var pro_id = GetRequest()["id"]
var sku_id = GetRequest()["skuid"]
if (!pro_id) {
    window.location.href = "index.html";
}


var Product = AV.Object.createWithoutData('Product', pro_id)
var romIsExist = false;

function addToCart(dom) {
    var Cid = sessionStorage.getItem("Customer_ID")
    if (!Cid) {
        alert("Please login in first！")
        window.location.href = "index.html";
        return
    }
    var customer = AV.Object.createWithoutData('Customer', Cid)
    if (!$(dom).attr("skuId")) {
        if(romIsExist){
            alert("Please choose colour and ROM")
        }else{
            alert("Please choose colour")
        }
        return;
    }
    var sku = AV.Object.createWithoutData('Product_SKU', $(dom).attr("skuId"))

    var cart_query = new AV.Query("Shoping_Cart")
    cart_query.equalTo("customer", customer)
    cart_query.equalTo("sku", sku)
    cart_query.first().then(function (res) {
        var quantity = parseInt($("#quantity_value").text())
        if (res) {
            res.set("quantity", res.get("quantity") + quantity)
            res.save();
        } else {
            var cart = new AV.Object("Shoping_Cart")
            cart.set("quantity", quantity);
            cart.set("customer", customer)
            cart.set("sku", sku)
            cart.save();
        }
        $(dom).text("Added successfully")
        setTimeout(function () {
            $(dom).text("Add to cart")
        }, 1000)
    })
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



function colorSelected(dom) {
    var sku_query = new AV.Query("Product_SKU");
    sku_query.equalTo("product", Product)
    sku_query.equalTo("color", $(dom).attr("skuColor"))
    sku_query.find().then(function (sku) {
        var roms = sku.map(function (a, b) {
            return a.get("rom")
        });
        $("[name=rom_radio]").map(function (a, d) {
            var dom = $(d)
            if (roms.indexOf(dom.attr("skuRom")) < 0) {
                dom.attr("checked", false)
                dom.attr("disabled", true)
                dom.closest("label").addClass("disabled")
            } else {
                dom.attr("disabled", false)
                dom.closest("label").removeClass("disabled")
            }
        })
        confirmSku();
    })
}

function romSelected(dom) {
    var sku_query = new AV.Query("Product_SKU");
    sku_query.equalTo("product", Product)
    sku_query.equalTo("rom", $(dom).attr("skuRom"))
    sku_query.find().then(function (sku) {
        var roms = sku.map(function (a, b) {
            return a.get("color")
        });
        $("[name=color_radio]").map(function (a, d) {
            var dom = $(d)
            if (roms.indexOf(dom.attr("skuColor")) < 0) {
                dom.attr("checked", false)
                dom.attr("disabled", true)
                dom.closest("label").addClass("disabled")
            } else {
                dom.attr("disabled", false)
                dom.closest("label").removeClass("disabled")
            }
        })
        confirmSku();
    })
}

function confirmSku() {
    var color = $("[name='color_radio']:checked").attr("skuColor")
    var rom = $("[name='rom_radio']:checked").attr("skuRom")

    var sku_query = new AV.Query("Product_SKU");
    sku_query.equalTo("product", Product)
    sku_query.equalTo("color", color)
    if(rom){
        sku_query.equalTo("rom", rom)
    }
    sku_query.first().then(function(sku){
        if(sku){
            $("#toCart").attr("skuId",sku.id)
            $("#originalPrice").text("$"+sku.get("originalPrice"))
            $("#discountPrice").text("$"+sku.get("discountPrice"))
        }
    })
}

$(function () {
    loadProductInfo(pro_id);
    var name = sessionStorage.getItem("Customer_Name")
    if(name){
        $(".w3l_login > a").prepend(name).attr("data-target",null).on("click",function(){
            if(confirm("Login out？")){
                logout();
            }
        }) 
        $(".w3l_login > a > span").removeClass("glyphicon-user").addClass("glyphicon-remove")
    }
    

    function loadProductInfo(id) {
        Product.fetch().then(function (product) {
            $("[name='pro_title']").text(product.get("title"))
            $("[name='pro_desc']").text(product.get("description"))
            $("#images_box").html(template("image_template", product.get("images")));
            $('.flexslider').flexslider({
                animation: "slide",
                controlNav: "thumbnails"
            });

            var sku_query = new AV.Query("Product_SKU");
            sku_query.equalTo("product", product)
            sku_query.find().then(function (data) {
                var color = []
                var rom = []
                var selected;
                for (var i = 0; i < data.length; i++) {
                    if(data[i].id == sku_id){
                        selected = data[i]
                    }else if(!selected){
                        selected = data[0]
                    }
                    var item_color = data[i].get("color")
                    var item_rom = data[i].get("rom")

                    if(color.indexOf(item_color) == -1){
                        color.push(item_color);
                    }
                   
                    if (item_rom && rom.indexOf(item_rom) == -1) {
                        rom.push(item_rom)
                    }
                }
                $("#colors_box").html(template("color_template", color))

                if (rom.length > 0) {
                    romIsExist = true;
                    $("#roms_box").html(template("rom_template", rom))
                } else {
                    $("#rom_property").remove();
                }
                $("[skuColor='" + selected.get("color") + "']").attr("checked", true);
                $("[skuRom='" + selected.get("rom") + "']").attr("checked", true);
                confirmSku();
            })
        })

    }




})