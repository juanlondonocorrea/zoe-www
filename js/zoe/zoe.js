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
		  if(!toPage || toPage.indexOf("Login") < 0  && toPage.indexOf("config")<0) {
			//checkSession();
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
logZoe("actualiza lastAccess parseInt(lastAccess, 10) + 5*60*1000)="+(parseInt(lastAccess, 10) + 5*60*1000));
logZoe("actualiza lastAccess  Date.now()="+ Date.now());
				if (lastAccess=="null" || lastAccess==null || (parseInt(lastAccess, 10) + 5*60*1000) < Date.now()) {
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
			
function openDatabaseZoe(){
	logZoe("openDatabaseZoe");
	db = window.openDatabase("Database", "1.0", "Zoe Database", 2*1024*1024);
	return db;
}

	var sqls;
	function checkDatabase(){
		logZoe("checkDatabase");
	    $.ajax({
            url : "dbcreate.sql",
            dataType: "text",
            success : function (data) {
				sqls = data.split(";");
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

	function dropDB(tx) {
	var	sql = 'DROP TABLE salesrep';
		tx.executeSql(sql,[],nullHandler,errorHandler);
	}

	var itemsToSync;
	function checkNeedToSync(){
		itemsToSync=0;
		db = openDatabaseZoe();
		db.transaction(doNeedToSync);
	}

	function doNeedToSync(tx) {
	var	sql = 'select sum(cnt) as needCount FROM(Select count(*) as cnt FROM invoice WHERE needSync=1 UNION Select count(*) as cnt FROM customer WHERE needSync=1)';
		tx.executeSql(sql,[],receiveCheckNeedToSync);
	}

	function receiveCheckNeedToSync(tx, results){
		console.log("receiveCheckNeedToSync results=" + results);
		if (results.rows){
			itemsToSync = results.rows.item(0).needCount;
			console.log("needToSync itemsToSync=" + itemsToSync);
			if (itemsToSync>0){
				$("#iconSync").html('<a class="ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext ui-icon-nosync"></a>');
			}else{
				$("#iconSync").html('<a class="ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext ui-icon-sync"></a>');
			}
		}
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
	  console.log(message);
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

function ifUndefNull(variable){
	if (typeof variable == 'undefined'){
		return null;
	}
	return variable;
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

