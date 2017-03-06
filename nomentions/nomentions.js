/* jshint globalstrict:true, browser:true, jquery:true, undef:true, unused:true, eqeqeq:true, laxbreak:true */
/* global browser */
"use strict";


(function(funcName, baseObj) {
    // The public function name defaults to window.docReady
    // If you want to put them in a different namespace,
    // you can pass in your own object and own function name and those will be used
    funcName = funcName || "docReady";
    baseObj = baseObj || window;
    var readyList = [];
    var readyFired = false;
    var readyEventHandlersInstalled = false;

    // call this when the document is ready
    // this function protects itself against being called more than once
    function ready() {
        if (!readyFired) {
            // this must be set to true before we start calling callbacks
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                // if a callback here happens to add new ready handlers,
                // the docReady() function will see that it already fired
                // and will schedule the callback to run right after
                // this event loop finishes so all handlers will still execute
                // in order and no new ones will be added to the readyList
                // while we are processing the list
                readyList[i].fn.call(window, readyList[i].ctx);
            }
            // allow any closures held by these functions to free
            readyList = [];
        }
    }

    function readyStateChange() {
        if ( document.readyState === "complete" ) {
            ready();
        }
    }

    // This is the one public interface
    // docReady(fn, context);
    // the context argument is optional - if present, it will be passed
    // as an argument to the callback
    baseObj[funcName] = function(callback, context) {
        if (typeof callback !== "function") {
            throw new TypeError("callback for docReady(fn) must be a function");
        }
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function() {callback(context);}, 1);
            return;
        } else {
            // add the function and context to the list
            readyList.push({fn: callback, ctx: context});
        }
        // if document already ready to go, schedule the ready function to run
        if (document.readyState === "complete") {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
            // otherwise if we don't have event handlers installed, install them
            if (document.addEventListener) {
                // first choice is DOMContentLoaded event
                document.addEventListener("DOMContentLoaded", ready, false);
                // backup is window load event
                window.addEventListener("load", ready, false);
            } else {
                // must be IE
                document.attachEvent("onreadystatechange", readyStateChange);
                window.attachEvent("onload", ready);
            }
            readyEventHandlersInstalled = true;
        }
    };
})("onDocReady", window);

(function() {

    var parseDocument = function() {
        var tree = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        function replaceCallback(match) {
            return {
                name: 'img',
                attrs: {
                    "src": browser.extension.getURL("images/nomentions-button-48.png"),
                    "alt": match,
                    "title": match,
                    "style": "vertical-align:middle;"
                    // "style": "vertical-align:text-bottom;"
                }
            };
        }

        while (tree.nextNode()) {
            var node = tree.currentNode;

            if (node.parentNode.tagName === 'SCRIPT') {
                continue;
            }

            // /\b(\w*(...)\w*)\b/ig
            textNodeReplace(node, /(m[ae]n|boy|uncle|father|son)/ig, replaceCallback);
        }
    };

    var textNodeReplace = function(node, regex, handler) {
        var self = this,
            parent = node.parentNode,
            sib = node.nextSibling,
            doc = node.ownerDocument,
            hits;

        if (regex.global) {
            while (node && (hits = regex.exec(node.nodeValue))) {
                regex.lastIndex = 0;
                node = handleResult(node, hits, handler.apply(self, hits));
            }
        } else if ((hits = regex.exec(node.nodeValue))) { // Double parens silences hint warning
            handleResult(node, hits, handler.apply(self, hits));
        }

        function handleResult(node, hits, results) {
            var orig = node.nodeValue;
            node.nodeValue = orig.slice(0, hits.index);
            [].concat(create(parent, results)).forEach(function(n) {
                parent.insertBefore(n, sib);
            });

            var rest = orig.slice(hits.index + hits[0].length);

            return rest && parent.insertBefore(doc.createTextNode(rest), sib);
        }

        function create(el, o) {
            if (o.map) {
                return o.map(function(v) {
                    return create(el, v);
                });
            } else if (typeof o === 'object') {
                var e = doc.createElementNS(o.namespaceURI || el.namespaceURI, o.name);
                if (o.attrs)
                    for (var a in o.attrs) e.setAttribute(a, o.attrs[a]);
                if (o.content)[].concat(create(e, o.content)).forEach(e.appendChild, e);
                return e;
            } else {
                return doc.createTextNode(o + "");
            }
        }
    };


    window.onDocReady(function() {
        parseDocument();
    });
})();
