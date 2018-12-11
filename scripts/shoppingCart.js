$(document).ready(function () {
    let storageEnabled = checkStorage();
    let currentCart = getCartData();
    let prevTab = "";
    let nextTab = "tabCart";

    generateCart();

    showTab(nextTab);

    if (document.location.pathname.includes("NAO_AddCart")) {
        let eventInfo = getEventInfo();
        if (addToCart(eventInfo.eventName, eventInfo.price, eventInfo.qty)) {
            window.location.replace("../src/NAO_Calendar.html");
        }
    } else if (document.location.pathname.includes("NAO_Calendar.html")) {
        if (currentCart.length > 0) {
            $('div.alert-success').show();
            $('#successMessage').text("There are items in your cart");
        } else {
            $('div.alert-success').hide();
        }
    }

    function getEventInfo()
    {
        // let vars = [], hash;
        let params = [];
        let hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

        hashes.forEach(function(item) {
            hash = item.split('=');
            let paramVal = hash[1];
            let param = {"paramVal":paramVal}; 
            params.push(param);
        });

        let eventInfo = {"eventName" : params[0].paramVal, "qty" : params[1].paramVal, "price" : params[2].paramVal};

        // for(var i = 0; i < hashes.length; i++)
        // {
        //     hash = hashes[i].split('=');
        //     vars.push(hash[0]);
        //     vars[hash[0]] = hash[1];
        // }
        // return vars;
        return eventInfo;
    }

    $('#clearCartGoHome').click(function() {
        clearCartAndGoHome();
    });

    function clearCartAndGoHome() {
        clearCart();
        window.location.replace("../index.html");
    };

    // $('button.tablinks').click(function () {
    //     let target = $(this).data("target");
    //     prevTab
    //     currentTab = $(this).data("tabindex");
    //     showTab(target);
    //     return false;
    // });

    // $('li.page-item').click(function () {
    //     showTab(nextTab);
    // });

    $('#prev').click(function () {
        showTab(prevTab);
    });

    $('#next').click(function () {
        showTab(nextTab);
    });

    function showTab(tabName) {
        let tabId = '#'+tabName;
        let currentIndex = $(tabId).data("tabindex");
        let target = '#'+$(tabId).data("target");

        prevTab = $(target).data("prevtab");
        nextTab = $(target).data("nexttab");

        if (currentIndex == "0") {
            $('#prev').prop("disabled", true);
            $('#next').prop("disabled", false);
        } else if (currentIndex == "1") {
            $('#prev').prop("disabled", false);
            $('#next').prop("disabled", false);
        } else if (currentIndex == "2") {
            // // nextTab = prevTab;
            // if ($("#frmPayment")[0].checkValidity()) {
            //     $('#prev').prop("disabled", false);
            //     $('#next').prop("disabled", true);
            // } else {
            //     showTab("tabPayment");
            //     alert("Please enter valid Payment Information");
            //     return false;                
            // }
        }

        $('button.tablinks').css( "border-bottom", "none" );
        $('button.tablinks').css( "border-bottom-color", "" );

        $(target).css( "border-bottom", "solid" );
        $(target).css( "border-bottom-color", "red" );

        $('div.tabcontent').hide();
        $(tabId).show();

        return false;
    };

    // add items to cart
    function addToCart(itemName, itemPrice, itemQty) {
        try {
            // check if item already added
            let shoppingCartItem = currentCart.find(item => item.itemName == itemName);
            if (!shoppingCartItem) {
                // if not available then create new item
                shoppingCartItem = {
                    itemNo: getNextItemNo(),
                    itemName: itemName,
                    itemPrice: itemPrice,
                    itemQty: itemQty,
                    itemTotal: getItemtotal(itemPrice,  itemQty)
                };
                currentCart.push(shoppingCartItem);
            } else {
                // if already added then update price and increment quantity
                shoppingCartItem.itemPrice = itemPrice;
                shoppingCartItem.itemQty = parseInt(shoppingCartItem.itemQty) + parseInt(itemQty);
                shoppingCartItem.itemTotal = getItemtotal(itemPrice,  shoppingCartItem.itemQty);
            }
            // save to local storage
            setCartData(currentCart);
        } catch (error) {
            throw('Unable to add to cart at this time. ' + error.message);
        }
        return true;
    };

    function removeFromCart(itemNo) {
        try {
            if (itemNo == "-1") {
                clearCart();
            } else {
                let itemIndex = currentCart.findIndex((item) => item.itemNo == itemNo);
                currentCart.splice(itemIndex, 1);
                setCartData(currentCart);
            }
            generateCart();
        } catch (error) {
            throw('Unable to remove from cart at this time. ' + error.message);
        }
    };

    function clearCart() {
        currentCart = [];
        setCartData(currentCart);
    };

    function getNextItemNo() {
        let nextitemNo = 1;
        if (currentCart) {
            nextitemNo = currentCart.length;
        }
        return nextitemNo;
    };

    function getItemtotal(price, qty) {
        return parseInt(price.replace(/^\D+/g, '')) * parseInt(qty);        
    };

    // checkk if local storage available
    function checkStorage() {
        if (typeof (Storage) !== "undefined") {
            return true;
        }
        return false;
    };

    // get cart data from localstorage
    function getCartData() {
        let naoCart = [];
        // check if local storage is available
        if (storageEnabled) {
            // check if existing cart data is available in local storage
            if (localStorage.getItem("NAOCart") != null) {
                // load from local storage
                naoCart = JSON.parse(localStorage.getItem("NAOCart"));
            }
        }
        return naoCart;
    };

    // set cart data to localstorage
    function setCartData(data) {
        // check if local storage is available
        if (storageEnabled) {
            // save data to local storage
            localStorage.setItem("NAOCart", JSON.stringify(data));
        }
    };    

    function generateCart() {
        //Create a HTML Table element.
        let table = $("<table class='table table-hover' />");
        //table[0].border = "1";
    
        let header = table[0].createTHead();
    
        //Add the header row.
        let row = $(header.insertRow(-1));
        let removeCell = $("<th scope='col' style='color:black' />");
        removeCell.html("<a href='#' class='cart-remove' data-itemno='-1'>X</a>");
        row.append(removeCell);
    
        let nameHeaderCell = $("<th scope='col' style='color:black' />");
        nameHeaderCell.html("Event");
        row.append(nameHeaderCell);
    
        let qtyHeaderCell = $("<th scope='col' style='color:black' />");
        qtyHeaderCell.html("Quantity");
        row.append(qtyHeaderCell);
    
        let priceHeaderCell = $("<th scope='col' style='color:black' />");
        priceHeaderCell.html("Price");
        row.append(priceHeaderCell);
    
        let amtHeaderCell = $("<th scope='col' style='color:black;text-align:right' />");
        amtHeaderCell.html("Amount");
        row.append(amtHeaderCell);
    
        //Add the data rows.
        let body = table[0].createTBody();
        let cartTotal = 0;
        currentCart.forEach(item => {
            let row = $(body.insertRow(-1));
            let removeCell = $("<td style='color:black' />");
            removeCell.html("<a href='#' class='cart-remove' data-itemno=" + item.itemNo + ">X</a>");
            row.append(removeCell);
    
            let nameCell = $("<td style='color:black' />");
            nameCell.html(item.itemName);
            row.append(nameCell);
    
            let qtyCell = $("<td style='color:black' />");
            qtyCell.html(item.itemQty);
            row.append(qtyCell);
    
            let priceCell = $("<td style='color:black' />");
            priceCell.html(item.itemPrice);
            row.append(priceCell);
    
            let itemTotalCell = $("<td style='color:black;text-align:right' />");
            itemTotalCell.html(`$${item.itemTotal}`);
            row.append(itemTotalCell);
            cartTotal += parseInt(item.itemTotal);
        });
    
        let tableTotal = $("<table class='table table-hover' style='border-top:solid;border-top-color:black' />");
        let footer = tableTotal[0].createTFoot();
        let frow = $(footer.insertRow(-1));
        let cell0 = $("<td style='color:black' />");
        cell0.html("&nbsp;");
        frow.append(cell0);
    
        let cell1 = $("<td style='color:black' />");
        cell1.html("&nbsp;");
        frow.append(cell1);
    
        let cell2 = $("<td style='color:black' />");
        cell2.html("&nbsp;");
        frow.append(cell2);
    
        let cell3 = $("<td style='color:black;text-align:right' />");
        cell3.html("Cart Total:");
        frow.append(cell3);
    
        let cell4 = $("<td style='color:black;text-align:right' />");
        cell4.html(`$${cartTotal}`);
        frow.append(cell4);
    
        let cartDiv = $("#cartDiv");
        cartDiv.html("");
        cartDiv.append(table);

        let cartTotalDiv = $("#cartTotal");
        cartTotalDiv.html("");
        cartTotalDiv.append(tableTotal);

        $("#cartTotalCheckout").text("Your Cart Total is $" + cartTotal);
    
        if (currentCart.length > 0) {
            $("#finalCheckout").prop("disabled", false);
        } else {
            $("#finalCheckout").prop("disabled", true);
        }
    
        // remove from cart click handler
        $('a.cart-remove').click(function () {
            try {
                let itemNo = $(this).data("itemno");
                removeFromCart(itemNo);
            } catch (error) {
                showError(error);
            }
            return false;
        });
    };
});    



