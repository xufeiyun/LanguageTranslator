

/* 
 * 注册浏览器的DOMContentLoaded事件 
 * @param { Function } onready [必填]在DOMContentLoaded事件触发时需要执行的函数 
 * @param { Object } config [可选]配置项 
 */  
function onDOMContentLoaded(onready,config)
{  
    //浏览器检测相关对象，在此为节省代码未实现，实际使用时需要实现。  
    //var Browser = {};  
    //设置是否在FF下使用DOMContentLoaded（在FF2下的特定场景有Bug）  
    this.conf = {enableMozDOMReady:true};  
    if( config )  
    for( var p in config )  
        this.conf[p] = config[p];  
  
    var isReady = false;  
    function doReady(){  
        if( isReady ) return;  
        //确保onready只执行一次  
        isReady = true;  
        onready();
        document.onreadystatechange = null;
    }
    
    if (typeof(Browser) == "undefined") { 
        console.warn("Browser object is NOT implemented."); 
        document.onreadystatechange = doReady;
        document.addEventListener( "DOMContentLoaded", 
            function(){  
                document.removeEventListener( "DOMContentLoaded", arguments.callee, false );  
                doReady();
            }, 
            false );  
        return;
    }
    
    /*IE*/  
    if( Browser.ie ){  
        (function(){  
            if ( isReady ) return;  
            try {  
                document.documentElement.doScroll("left");  
            } catch( error ) {  
                setTimeout( arguments.callee, 0 );  
                return;  
            }  
            doReady();  
        })();  
        window.attachEvent('onload',doReady);  
    }  
    /*Webkit*/  
    else if (Browser.webkit && Browser.version < 525){  
        (function(){  
            if( isReady ) return;  
            if (/loaded|complete/.test(document.readyState))  
                doReady();  
            else  
                setTimeout( arguments.callee, 0 );  
        })();  
        window.addEventListener('load',doReady,false);  
    }  
    /*FF Opera 高版webkit 其他*/  
    else{  
        if( !Browser.ff || Browser.version != 2 || this.conf.enableMozDOMReady )  
            document.addEventListener( "DOMContentLoaded", function(){  
                document.removeEventListener( "DOMContentLoaded", arguments.callee, false );  
                doReady();  
            }, false );  
        window.addEventListener('load',doReady,false);  
    }  
  
}
/*END*/


// documentReady事件支持
var DOMContentLoaded;
var DOMREADY = function(o){
    var DOMREADY = {
        isReady     :   false,
        ready       :   o,
        bindReady   :   function(){
            try{
                if ( document.readyState === "complete" ){
                    DOMREADY.isReady = true;
                    return setTimeout( DOMREADY.ready, 1 );
                }
                if ( document.addEventListener ){
                    document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
                }else if( document.attachEvent ){
                    document.attachEvent( "onreadystatechange", DOMContentLoaded );
                    var toplevel = false;
                    try {
                        toplevel = window.frameElement == null;
                    } catch(e) {}
                    if( document.documentElement.doScroll && toplevel ){
                        doScrollCheck();
                    }
                }
            }catch(e){}
        }
    };
    if( document.addEventListener ){
        DOMContentLoaded = function(){
            document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
            DOMREADY.ready();
        };

    }else if ( document.attachEvent ){
        DOMContentLoaded = function(){
            if ( document.readyState === "complete" ) {
                document.detachEvent( "onreadystatechange", DOMContentLoaded );
                if( DOMREADY.isReady ){
                    return;
                }else{
                    DOMREADY.isReady = true;
                    DOMREADY.ready();
                }
            }
        };
    }
    function doScrollCheck(){
        if( DOMREADY.isReady ){
            return;
        }
        try {
            document.documentElement.doScroll("left");
        }catch(e){
            setTimeout( doScrollCheck, 1);
            return;
        }
        DOMREADY.isReady = true;
        DOMREADY.ready();
    }
    DOMREADY.bindReady();
};

// 121025 URS update
// 121115 URS fixed

var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function base64encode(str) {
    var out, i, len;
    var c1, c2, c3;
    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
        c1 = str.charCodeAt(i++) & 255;
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt((c1 & 3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 3) << 4) | ((c2 & 240) >> 4));
            out += base64EncodeChars.charAt((c2 & 15) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += base64EncodeChars.charAt(c1 >> 2);
        out += base64EncodeChars.charAt(((c1 & 3) << 4) | ((c2 & 240) >> 4));
        out += base64EncodeChars.charAt(((c2 & 15) << 2) | ((c3 & 192) >> 6));
        out += base64EncodeChars.charAt(c3 & 63);
    }
    return out;
}

function utf16to8(str) {
    var out, i, len, c;
    out = "";
    len = str.length;
    for (i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if ((c >= 1) && (c <= 127)) {
            out += str.charAt(i);
        } else {
            if (c > 2047) {
                out += String.fromCharCode(224 | ((c >> 12) & 15));
                out += String.fromCharCode(128 | ((c >> 6) & 63));
                out += String.fromCharCode(128 | ((c >> 0) & 63));
            } else {
                out += String.fromCharCode(192 | ((c >> 6) & 31));
                out += String.fromCharCode(128 | ((c >> 0) & 63));
            }
        }
    }
    return out;
}