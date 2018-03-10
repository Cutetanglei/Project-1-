AV.init({
    appId: "yNEf7jl2uUskO9HlnSiKjAWU-gzGzoHsz",
    appKey: "uYOq35PscfChdJ4Xv8EoqUQb"
});

var queryParam = {
    search: "",
    categories: [],
    color: [],
    price: { from: 0, to: 0 },
    order: ""
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


function loadData() {
    if (
        queryParam.color.length < 1 &&
        !queryParam.price.from &&
        !queryParam.price.to
    ) {
        loadProduct()
    } else {
        loadSku();
    }
}

function selectCategories(dom) {
    var value = $(dom).val()
    if ($(dom).attr("checked")) {
        queryParam.categories.push(value)
    } else {
        queryParam.categories.splice(queryParam.categories.indexOf(value), 1, )
    }
    loadData();
}

function selectColor(dom) {
    var value = $(dom).val()
    if ($(dom).attr("checked")) {
        queryParam.color.push(value)
    } else {
        queryParam.color.splice(queryParam.color.indexOf(value), 1, )
    }
    loadData();
}



function addToCart(dom) {
    var Cid = sessionStorage.getItem("Customer_ID")
    if (!Cid) {
        alert("Please login in first！")
        window.location.href = "index.html";
        return
    }
    var customer = AV.Object.createWithoutData('Customer', Cid)
    var sku = AV.Object.createWithoutData('Product_SKU', $(dom).attr("skuId"))

    var cart_query = new AV.Query("Shoping_Cart")
    cart_query.equalTo("customer", customer)
    cart_query.equalTo("sku", sku)
    cart_query.first().then(function (res) {
        if (res) {
            res.set("quantity", res.get("quantity") + 1)
            res.save();
        } else {
            var cart = new AV.Object("Shoping_Cart")
            cart.set("quantity", 1);
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


function loadSku() {
    var sql = "select *,include product from Product_SKU "
    var where = ""

    if (queryParam.search || queryParam.categories.length >= 1) {
        var inWhere = "";

        // 检索
        if (queryParam.search) {
            inWhere += " and title regexp '(?i).*" + queryParam.search + ".*'"
        }
        // 品类
        if (queryParam.categories) {
            if (queryParam.categories.length == 1) {
                inWhere += " and categoryName='" + queryParam.categories[0] + "'";
            } else if (queryParam.categories.length > 1) {
                inWhere += " and (categoryName='" + queryParam.categories[0] + "' or categoryName='" + queryParam.categories[1] + "')";
            }
        }
        inWhere = inWhere.trim()
        if (inWhere.startsWith("and")) {
            inWhere = inWhere.substring(3, inWhere.length)
        }
        where += " and product in (select * from Product where " + inWhere + ")"
    }

    // 颜色
    if (queryParam.color.length == 1) {
        where += " and color='" + queryParam.color[0] + "'";
    } else if (queryParam.color.length > 1) {
        where += " and ("
        queryParam.color.map(function (value, index) {
            where += "color='" + value + "'";
            if (index != queryParam.color.length - 1) {
                where += " or "
            }
        })
        where += ")"
    }
    // 价格
    if (queryParam.price) {
        if (queryParam.price.from) {
            where += " and discountPrice > " + queryParam.price.from
        }
        if (queryParam.price.to) {
            where += " and discountPrice < " + queryParam.price.to
        }
    }

    where = where.trim()
    if (where) {
        if (where.startsWith("and")) {
            where = where.substring(3, where.length)
        }
        sql += " where " + where.trim() + " limit 1000"
        // 排序
        if (queryParam.order) {
            sql += " order by " + queryParam.order
        }
    }
    console.log(sql);
    AV.Query.doCloudQuery(sql).then(function (data) {
        var html = template("sku_template", data.results)
        $("#product_box").html(html)
    })
}

function loadProduct() {
    var product_query = new AV.Query("Product");
    if (queryParam.search) {
        var regExp = new RegExp(queryParam.search,'i');
        product_query.matches("title", regExp)
    }
    if (queryParam.categories.length == 1) {
        product_query.equalTo("categoryName", queryParam.categories[0])
    }
    if (queryParam.categories.length > 1) {
        var product_query_or1 = new AV.Query("Product");
        product_query_or1.equalTo("categoryName", queryParam.categories[0]);

        var product_query_or2 = new AV.Query("Product");
        product_query_or2.equalTo("categoryName", queryParam.categories[1]);

        if (queryParam.search) {
            var regExp = new RegExp(queryParam.search, 'i');
            product_query_or1.matches("title", regExp)
            product_query_or2.matches("title", regExp)
        }
        var query = AV.Query.or(product_query_or1, product_query_or2)
        if(queryParam.order){
            var a = queryParam.order.split(' ')
            if(a[1] == "asc"){
                query.addAscending(a[0])
            }else if(a[1] == "desc"){
                query.addDescending(a[0])
            }
        }
        query.find().then(function (data) {

            var html = template("pro_template", data);
            $("#product_box").html(html)
        })
        return;
    }
    if(queryParam.order){
        var a = queryParam.order.split(' ')
        if(a[1] == "asc"){
            product_query.addAscending(a[0])
        }else if(a[1] == "desc"){
            product_query.addDescending(a[0])
        }
    }
    product_query.find().then(function (data) {
        var html = template("pro_template", data);
        $("#product_box").html(html)
    })
}

function loadColors() {
    var colors = new Set()
    var cql = 'select color from Product_SKU';
    AV.Query.doCloudQuery(cql).then(function (data) {
        data.results.map(function (a, b) {
            colors.add(a.get("color").trim())
        })
        var html = template("color_checkBox_template", [...colors].sort())
        $("#color_checkBox_list").html(html)
    });
}

$(function () {
    var name = sessionStorage.getItem("Customer_Name")
    if (name) {
        $(".w3l_login > a").prepend(name).attr("data-target", null).on("click", function () {
            if (confirm("Login out？")) {
                logout();
            }
        })
        $(".w3l_login > a > span").removeClass("glyphicon-user").addClass("glyphicon-remove")
    }

    function selectedPrice() {
        $("[name='price_radio']").click(function (event) {
            var from = $(this).attr("valuefrom")
            var to = $(this).attr("valueto")
            queryParam.price.from = parseInt(from)
            queryParam.price.to = parseInt(to)
            loadData()
        })
    }

    function selectedSort(){
        $("#sort_item").on("change",function(){
            queryParam.order = this.value
            loadData()
        })
    }

    loadColors()

    var search = GetRequest()["search"]
    if(search){
        queryParam.search = search.replace('+',' ')
    }


    loadData();
    selectedPrice()
    selectedSort();
})