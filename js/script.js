function showLoading(selector) {
    var html = "<div class='text-center'>";
    html += "<div class='loader'></div></div>";
    document.querySelector(selector).innerHTML = html;
}

$(function () {
    $("#navbarToggle").blur(function (event) {
        var screenWidth = window.innerWidth;
        if (screenWidth < 768) {
            $("#collapsable-nav").collapse('hide');
        }
    });
});

(function (global) {
    var dc = {};

    var homeHtml = "snippets/home-snippet.html";

    var categories = ["L", "D", "S", "SP", "DS", "DSS", "WS", "TS"];

    function chooseRandomCategory() {
        var randomIndex = Math.floor(Math.random() * categories.length);
        console.log("Random category index: ", randomIndex);
        return categories[randomIndex];
    }

    function insertProperty(string, propName, propValue) {
        var propToReplace = "{{" + propName + "}}";
        string = string.replace(new RegExp(propToReplace, "g"), propValue);
        return string;
    }

    function loadHomeHtml() {
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(
            homeHtml,
            function (responseText) {
                var randomCategoryShortName = chooseRandomCategory();
                console.log("Random category short name: ", randomCategoryShortName);
                var homeHtmlToInsertIntoMainPage = insertProperty(responseText, "randomCategoryShortName", randomCategoryShortName);
                document.querySelector("#main-content").innerHTML = homeHtmlToInsertIntoMainPage;
            },
            false
        );
    }

    document.addEventListener("DOMContentLoaded", function (event) {
        loadHomeHtml();
    });

    dc.loadMenuItems = function (categoryShort) {
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(
            "snippets/" + categoryShort + ".json",
            buildAndShowMenuItemsHTML
        );
    };

    global.$dc = dc;
    global.insertProperty = insertProperty; // Ensure insertProperty is accessible globally
})(window);

function buildAndShowMenuItemsHTML(categoryMenuItems) {
    console.log("categoryMenuItems: ", categoryMenuItems);
    $ajaxUtils.sendGetRequest(
        "snippets/menu-items-title.html",
        function (menuItemsTitleHtml) {
            $ajaxUtils.sendGetRequest(
                "snippets/menu-item.html",
                function (menuItemHtml) {
                    var menuItemsViewHtml = buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml);
                    insertHtml("#main-content", menuItemsViewHtml);
                },
                false);
        },
        false);
}

function insertHtml(selector, html) {
    document.querySelector(selector).innerHTML = html;
}

function buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml) {
    menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "name", categoryMenuItems.category.name);
    menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "special_instructions", categoryMenuItems.category.special_instructions);

    var finalHtml = menuItemsTitleHtml;
    finalHtml += "<section class='row'>";

    var menuItems = categoryMenuItems.menu_items;
    var catShortName = categoryMenuItems.category.short_name;

    for (var i = 0; i < menuItems.length; i++) {
        var html = menuItemHtml;
        html = insertProperty(html, "short_name", menuItems[i].short_name);
        html = insertProperty(html, "catShortName", catShortName);
        html = insertItemPrice(html, "price_small", menuItems[i].price_small);
        html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
        html = insertItemPrice(html, "price_large", menuItems[i].price_large);
        html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
        html = insertProperty(html, "name", menuItems[i].name);
        html = insertProperty(html, "description", menuItems[i].description);

        finalHtml += html;
    }

    finalHtml += "</section>";
    console.log("finalHtml: ", finalHtml);
    return finalHtml;
}

function insertItemPrice(html, pricePropName, priceValue) {
    if (!priceValue) {
        return insertProperty(html, pricePropName, "");
    }

    priceValue = "$" + priceValue.toFixed(2);
    return insertProperty(html, pricePropName, priceValue);
}

function insertItemPortionName(html, portionPropName, portionValue) {
    if (!portionValue) {
        return insertProperty(html, portionPropName, "");
    }

    portionValue = "(" + portionValue + ")";
    return insertProperty(html, portionPropName, portionValue);
}
