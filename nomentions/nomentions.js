/* jshint globalstrict:true, browser:true, jquery:true, undef:true, unused:true, eqeqeq:true, laxbreak:true */
"use strict";

(function($) {

    var parseMen = function() {
        // var nodes = $.parseHTML(document.body.innerHTML);
        var nodes = document.body.childNodes;
        $.each(nodes, function(i, node) {
            parseNode(node);
        });
    };

    var parseNode = function(node) {
        if (node.nodeName === '#text') {
            // /\b(.*?(men|man|boy).*?)\b/ig
            node.textContent = node.textContent.replace(/\b(\w*(men|man|boy)\w*)\b/ig, function(match, contents, s) {
                console.log('replacing "'+ s +'" from "'+ match +'"');
                return match.replace(
                    /(men|man|boy)/i,
                    '<img src="http://icons.iconarchive.com/icons/icojam/blue-bits/24/picture-delete-icon.png" alt="'+ s +'">'
                );
            });
        }

        if (node.childNodes && node.childNodes.length > 0) {
            $.each(node.childNodes, function(cIndex, child) {
                parseNode(child);
            });
        }
    };

    $(document).ready(function() {
        console.log('NoMention');
        parseMen();
    });
})(jQuery);
