; (function (win, lib) {
    var doc = win.document;
    var docEl = doc.documentElement;
    var metaEl = doc.querySelector('meta[name="viewport"]');
    var flexibleEl = doc.querySelector('meta[name="flexible"]');
    var dpr = 0;
    var scale = 0;
    var tid;
    var flexible = lib.flexible || (lib.flexible = {});

    //If a viewport meta tag exists, extract and parse the initial-scale value.
    if (metaEl) {
        console.warn('The scale is set based on existing meta tags');
        var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/);
        if (match) {
            scale = parseFloat(match[1]);
            dpr = parseInt(1 / scale);
        }
        //If a custom flexible meta tag exists, extract and parse the initial-dpr and maximum-dpr values.
    } else if (flexibleEl) {
        var content = flexibleEl.getAttribute('content');
        if (content) {
            var initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
            var maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/);
            if (initialDpr) {
                dpr = parseFloat(initialDpr[1]);
                scale = parseFloat((1 / dpr).toFixed(2));
            }
            if (maximumDpr) {
                dpr = parseFloat(maximumDpr[1]);
                scale = parseFloat((1 / dpr).toFixed(2));
            }
        }
    }

    if (!dpr && !scale) {
        var isAndroid = win.navigator.appVersion.match(/android/gi);
        var isIPhone = win.navigator.appVersion.match(/iphone/gi);
        var devicePixelRatio = win.devicePixelRatio;
        //Detect if the device is Android or iPhone
        if (isIPhone) {
            // Under iOS, for screens 2 and 3, use a 2x plan, and for the rest, use a 1x plan
            if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {
                dpr = 3;
            } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)) {
                dpr = 2;
            } else {
                dpr = 1;
            }
        } else {
           // For other devices, the double solution is still used
            dpr = 1;
        }
        scale = 1 / dpr;
    }

    docEl.setAttribute('data-dpr', dpr);//Set a data-dpr attribute on the root element with the calculated DPR
    if (!metaEl) {
        metaEl = doc.createElement('meta'); //creates a new meta element
        metaEl.setAttribute('name', 'viewport'); //set the name attribute to viewport.
        metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');//set the content attribute to control the initial, maximum, and minimum scale of the viewport
        if (docEl.firstElementChild) {
            docEl.firstElementChild.appendChild(metaEl);
        } else {
            var wrap = doc.createElement('div');
            wrap.appendChild(metaEl);
            doc.write(wrap.innerHTML); // write meta tag to document
        }
    }

    function refreshRem() {
        var width = docEl.getBoundingClientRect().width;//Get the viewport width
        if (width / dpr > 540) {
            width = 540 * dpr;//Limit the width
        }
        var rem = width / 10;
        docEl.style.fontSize = rem + 'px';
        flexible.rem = win.rem = rem;//Set the root element's font size to the calculated rem
    }

    win.addEventListener('resize', function () {
        clearTimeout(tid);//prevent multiple executions of refreshRem in quick succession
        tid = setTimeout(refreshRem, 300);// Sets a new timeout to call the refreshRem function after 300 milliseconds
    }, false);
    win.addEventListener('pageshow', function (e) {
        if (e.persisted) { //Check if the pageshow event is due to the page being loaded from the cache
            clearTimeout(tid);
            tid = setTimeout(refreshRem, 300);
        }
    }, false);

    if (doc.readyState === 'complete') {
        doc.body.style.fontSize = 12 * dpr + 'px';
    } else {
        doc.addEventListener('DOMContentLoaded', function (e) {
            doc.body.style.fontSize = 12 * dpr + 'px';
        }, false);
    }


    refreshRem();

    flexible.dpr = win.dpr = dpr;
    flexible.refreshRem = refreshRem;
    flexible.rem2px = function (d) {
        var val = parseFloat(d) * this.rem;
        if (typeof d === 'string' && d.match(/rem$/)) {
            val += 'px';
        }
        return val; //Returns the pixel equivalent, either as a number or a string with 'px'
    }
    flexible.px2rem = function (d) {
        var val = parseFloat(d) / this.rem;
        if (typeof d === 'string' && d.match(/px$/)) {
            val += 'rem';
        }
        return val; //Returns the rem equivalent, either as a number or a string with 'rem'
    }

})(window, window['lib'] || (window['lib'] = {}));