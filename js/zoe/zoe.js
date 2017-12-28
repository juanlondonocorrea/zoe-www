	//load header, footer and menu
	function initAnyPage(target){
			logZoe("en initAnyPage");
			$('.app-header').load("header.html", function() {
				$("#zoeTitle").html("<font size=2>ZOE</font><font size=1> " +  extractTitleFromTarget(target) + "</font><span id=''>");
				$(this).trigger('create');
		});
			$('.app-footer').load("footer.html", function() {
				$(this).trigger('create');
			});
			$('.app-menu').load("menu.html", function() {
				$(this).trigger('create');
			});

		  var toPage = target.id;
		  console.log("target=" + target);
		  console.log("toPage=" + toPage);
		  checkExistDB();
		  if(!toPage || toPage.indexOf("Login") < 0  && toPage.indexOf("config")<0) {
			  if (toPage && toPage.indexOf(".html")>-1){
				   window.localStorage.setItem("pageToGoAfterLogin", + toPage);
			  }
			checkSession();
		  }

		  checkNeedToSync();
		};

		function extractTitleFromTarget(target){
			if (target.attributes && target.attributes["data-title"]){
				return target.attributes["data-title"].nodeValue;
			}
			if (typeof target.id  == 'string'){
				return target.id;
			}
		}


			function checkSession(){
				var currentSRN = window.localStorage.getItem('salesRepName');
				var lastAccess = window.localStorage.getItem('lastAccess');
				var currentUser = window.localStorage.getItem('currentUser');
				
				if (currentSRN==null){
					window.location = 'config.html'; 	
				}
				
				if (currentUser==null || currentUser=="null"){
					window.location = 'Login.html'; 	
				}
				
logZoe("en checkSession lastAccess=" + lastAccess);
logZoe("actualiza lastAccess parseInt(lastAccess, 10) + 5*60*1000)="+(parseInt(lastAccess, 10) + 480*60*1000));
logZoe("actualiza lastAccess  Date.now()="+ Date.now());
				if (lastAccess=="null" || lastAccess==null || (parseInt(lastAccess, 10) + 480*60*1000) < Date.now()) {
logZoe("redirige al login");
					window.localStorage.setItem('lastAccess', null);
logZoe("redirige al login2");
					window.location = 'Login.html'; 	
logZoe("redirige al listo");
				}
				else {
					lastAccess = Date.now();
					window.localStorage.setItem('lastAccess',lastAccess);
logZoe("actualiza lastAccess="+window.localStorage.getItem('lastAccess'));
				}
			}
		
var db=null;			
function openDatabaseZoe(){
	logZoe("openDatabaseZoe");
	if (db!=null){
		db==null;
	}
	if (db==null){
		db = window.openDatabase("Database", "1.0", "Zoe Database", 2*1024*1024);
	}
	return db;
}

	//retorna true si existe la bd
	function checkExistDB(){
		openDatabaseZoe();
		db.transaction(checkTableSalesrep,errorExistDB,successExistDB);
	}
	
	function checkTableSalesrep(tx){
			tx.executeSql("SELECT * FROM salesrep");
	}
	var existDB = false;
	function successExistDB(){
		existDB = true;
		console.log("database exist!");
	}
	function errorExistDB(){
		existDB = false;
		console.log("database not exist!");
	}
	
	var sqls;
	function createDatabase(){
		logZoe("createDatabase");
	    $.ajax({
            url : "dbcreate.sql",
            dataType: "text",
            success : function (data) {
				sqls = data.split("@");
				db = openDatabaseZoe();
				db.transaction(createDB,errorCB, successCreateDB);
            },
			error: function(err){
				logZoe("error leyendo dbcreate.sql" + err);
			}
		});
		return false;
	}

	function dropDatabase(){
		logZoe("dropDatabase");
		db = openDatabaseZoe();
		db.transaction(dropDB, errorCB, successDropDB);
	}

	function createDB(tx) {
		var index;
		for (index = 0; index < sqls.length; ++index) {
			var sql = sqls[index].trim();
			if (sql!=""){
				logZoe("tx " +  tx);
				logZoe("executing " +  sql);
				tx.executeSql(sql);
			}
		}
	}
	
	function executeSQLS(sqls, successFn, errorFn){
		logZoe("executeSQLS");
		db = openDatabaseZoe();
		db.transaction(function(tx){
			for (var index = 0; index < sqls.length; ++index) {
				var sql = sqls[index].trim();
				if (sql!=""){
					logZoe("tx " +  tx);
					logZoe("executing " +  sql);
					tx.executeSql(sql);
				}
			}
		}, errorFN, successFn);
	}

	function dropDB(tx) {
	var	sql = 'DROP TABLE salesrep';
		tx.executeSql(sql,[],nullHandler,errorHandler);
	}

	var itemsToSync;
	function checkNeedToSync(){
		console.log("checkNeedToSync");
		itemsToSync=0;
		db = openDatabaseZoe();
		db.transaction(doNeedToSync);
	}

	function doNeedToSync(tx) {
	var	sql = "select 'Customers' as entity, sum(1) as total FROM customer  WHERE needSync=1"
		+" UNION ALL select 'CreditMemos' as entity, sum(1) as total FROM creditMemo WHERE needSync=1"
		+" UNION ALL select 'Payments' as entity, sum(1) as total FROM payment WHERE needSync=1"
		+" UNION ALL select  'Invoices' as entity, sum(1) as total FROM invoice WHERE needSync=1 ";
		console.log("doNeedToSync sql=" + sql);
		tx.executeSql(sql,[],receiveCheckNeedToSync, errCheckNeedToSync);
	}
	
	var needToSync;
	function receiveCheckNeedToSync(tx, results){
		itemsToSync =0;
		needToSync = new Array();
		console.log("receiveCheckNeedToSync results=" + results);
		for (i = 0; i<results.rows.length; i++){
			var total = results.rows.item(i).total;
			if (total == null || !total) total = 0;
			console.log("results.rows.item(i)=" + JSON.stringify(results.rows.item(i)));
			needToSync[i] = {"entity":results.rows.item(i).entity,"total":total};
			console.log("total=" + total);
			itemsToSync += total;
		}
		console.log("needToSync=" + JSON.stringify(needToSync));
		console.log("needToSync itemsToSync=" + itemsToSync);
		//if (itemsToSync>0){
		//	$("#iconSync").html('<a class="ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext ui-icon-nosync"></a>');
	//	}else{
			$("#iconSync").html('<a class="ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext ui-icon-sync"></a>');
	//	}
	}
	
	function errCheckNeedToSync(){
		needToSync = new Array();
	}
	


	function nullHandler(tx, results){
		logZoe("sqlExecuted. " + JSON.stringify(results));
	};
			
	function errorCB(err) {
		logZoe("Error processing SQL: "+JSON.stringify(err));
	}
			
	function errorHandler(transaction, error) {
		alert("Fatal error executing transaction:"+JSON.stringify(error));
	}
            
		 
	function successCreateDB() {
		window.localStorage.setItem('dbCreated',"true")
		alert("Create database success");
	   logZoe("dbCreated");
	}             

	function successDropDB() {
		window.localStorage.setItem('dbCreated',"false")
		alert("Drop database success");
	   logZoe("db drop");
	}             
	
	function logZoe(message){
		var currentdate = new Date(); 
		var datetime = "Last Sync: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();		
	  console.log(datetime + "->" + message);
	}


	function print_call_stack() {
	  var stack = new Error().stack;
	  console.log("PRINTING CALL STACK");
	  console.log( stack );
	}
	


function openPopup(title, content, okFun, cancelFun, page){
	var withCancel = false;
	var withOk = false;
	if (okFun) {
		withOk = true;
	}
	if (cancelFun){
		withCancel=true;
	}
	var html = createPopup(title, content, withOk, withCancel);
        //append popup to DOM, tell jqm to enhance and initialize the popup
        // and to remove the popup from DOM on close
        page.append(html).find("#popupDialog").enhanceWithin().popup({
            afterclose: function (event, ui) {
				cancelFun(event,ui);
                //remove from DOM on close
                $("#popupDialog").remove();
            }
        }).popup("open", {
            transition: "flow",
            positionTo: "window"
        });
        //Add click handler for button in popup
        $("#popupDialog").on("click", "#btnPopOK", function(){
            alert("You clicked OK, I will now close the popup");            
            $("#popupDialog").popup("close");
		});
    }

function createPopup(title, content, withOk, withCancel){
    var html = '<div data-role="popup" id="popupDialog" data-overlay-theme="b" data-theme="a" data-dismissible="false" >';
    html += '<div data-role="header"><h1>' + title + '</h1><a href="#" data-rel="back" class="ui-btn ui-corner-all ui-shadow ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right">Close</a></div>';
    html += '<div role="main" class="ui-content"> <h3 class="ui-title">' + content + '</h3>';
	if (withCancel){
	html+='<a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-inline" data-rel="back">Cancel</a>';
	}
	if (withOk){
		html+='<a id="btnPopOK" href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-inline" data-transition="flow">OK</a>';
	}
	html+='</div>';
    html += '</div>';
    return html;
}

function logout(){
		window.localStorage.setItem("currentUser",null);
		window.localStorage.setItem("lastAccess",null);
		window.location="Login.html";
}

function ifUndefNull(variable){
	if (typeof variable == 'undefined' || variable == 'undefined'){
		return null;
	}
	return variable;
}

function ifNull(variable, defaultValue){
	if  (isNaN(variable) || (variable == null)) {
		return defaultValue;
	}
	return variable;
}

function isNumeric( obj ) {
    return !jQuery.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
}

function isInt(n){
        return Number(n)===n && n%1===0;
}

function isFloat(n){
        return   n===Number(n)  && n%1!==0;
}

// Convierte la variable a Número, número de decimales si es real, valor por defecto 
function NumberCast(variable,decimales, defaultValue) {
	var Num = 0;
	variable = parseFloat((''+variable).replace(',','.'));
	if (isNumeric(variable))
	{
		if (isInt(variable)) 
		{
			Num = variable;
		}
		else if (isFloat(variable)) 
		{
			Num = variable.toFixed(decimales);
		}
		return Num;
	}
	else if (isNaN(variable) || (variable == null)) 
	{
		return defaultValue;
	}
}

function generateKey(){
	var date = new Date();
	var toReturn = date.getTime();
	toReturn += 'xxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
	return toReturn;
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}



//DATE FORMAT

    // EXAMPLE alert("now=" + new Date().format("yyyy-mm-dd"));
    // EXAMPLE2 alert("now=" +dateFormat(new Date(),"yyyy-mm-dd"));
	
    Date.prototype.format = function (mask, utc) {
        return dateFormat(this, mask, utc);
    };


    var dateFormat = function () {
        var    token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) val = "0" + val;
                return val;
            };
    
        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc) {
            var dF = dateFormat;
    
            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }
    
            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date;
            if (isNaN(date)) throw SyntaxError("invalid date");
    
            mask = String(dF.masks[mask] || mask || dF.masks["default"]);
    
            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }
    
            var    _ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d:    d,
                    dd:   pad(d),
                    ddd:  dF.i18n.dayNames[D],
                    dddd: dF.i18n.dayNames[D + 7],
                    m:    m + 1,
                    mm:   pad(m + 1),
                    mmm:  dF.i18n.monthNames[m],
                    mmmm: dF.i18n.monthNames[m + 12],
                    yy:   String(y).slice(2),
                    yyyy: y,
                    h:    H % 12 || 12,
                    hh:   pad(H % 12 || 12),
                    H:    H,
                    HH:   pad(H),
                    M:    M,
                    MM:   pad(M),
                    s:    s,
                    ss:   pad(s),
                    l:    pad(L, 3),
                    L:    pad(L > 99 ? Math.round(L / 10) : L),
                    t:    H < 12 ? "a"  : "p",
                    tt:   H < 12 ? "am" : "pm",
                    T:    H < 12 ? "A"  : "P",
                    TT:   H < 12 ? "AM" : "PM",
                    Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };
    
            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();
    
    // Some common format strings
    dateFormat.masks = {
        "default":      "ddd mmm dd yyyy HH:MM:ss",
        shortDate:      "m/d/yy",
        mediumDate:     "mmm d, yyyy",
        longDate:       "mmmm d, yyyy",
        fullDate:       "dddd, mmmm d, yyyy",
        shortTime:      "h:MM TT",
        mediumTime:     "h:MM:ss TT",
        longTime:       "h:MM:ss TT Z",
        isoDate:        "yyyy-mm-dd",
        isoTime:        "HH:MM:ss",
        isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };
    
    // Internationalization strings
    dateFormat.i18n = {
        dayNames: [
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ]
    };
    
function fillXMLTag(tag, value, notGenerateIfNull, notGenerateIfEmpty){
	if (notGenerateIfNull && (typeof value == "undefined" || value==null)){
		return "";
	}
	if (notGenerateIfEmpty && value == ""){
		return "";
	}
	var nValue = value ;
	if (typeof value == "undefined" || nValue == null){
		nValue = "";
	}
	nValue = nValue.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;');

	return "<"+tag+">" + nValue + "</"+tag+">";
}