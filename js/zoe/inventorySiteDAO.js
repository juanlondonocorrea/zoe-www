// JavaScript Document

var inventorySiteDAO = {list:listInventorySites, 
				getById:getInventorySiteById, 
				getByName:getInventorySiteByName, 
				store:storeInventorySite, 
				deleteAll:deleteAllInventorySites};
var filterDataInventorySite;
var inventorySiteReceiveFunction;
var inventorySiteReceiveListFunction;
var inventorySiteErrFunc;
var inventorySiteVO;
var recordInventorySite;

//----------------------
//metodos hacia afuera
//----------------------
function getInventorySiteById(aId,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("getInventorySiteById db=" + db);
	filterData=aId;
	inventorySiteReceiveFunction = aReceiveFunction;
	inventorySiteErrFunc = aErrFunc;
	db.transaction(doSelectInventorySite, inventorySiteErrFunc);
}

function getInventorySiteByName(aName,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("getInventorySiteByName db=" + db);
	filterData=aName;
	inventorySiteReceiveFunction = aReceiveFunction;
	inventorySiteErrFunc = aErrFunc;
	db.transaction(doSelectInventorySiteByName, inventorySiteErrFunc);
}

function listInventorySites(aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listInventorySites db=" + db);
	inventorySiteReceiveListFunction = aReceiveFunction;
	inventorySiteErrFunc = aErrFunc;
	db.transaction(doInventorySites, inventorySiteErrFunc);
}

function storeInventorySite(records,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("storeInventorySite db=" + db);
	recordInventorySite = records;
	inventorySiteErrFunc = aErrFunc;
	db.transaction(doStoreInventorySite, errorCB, successCB);
}

function deleteAllInventorySites(aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteAllInventorySites db=" + db);
	inventorySiteErrFunc = aErrFunc;
	db.transaction(doDeleteAllInventorySites, errorCB, successCB);
}


//----------------------
//metodos privados
//----------------------

function doSelectInventorySite(tx){
	logZoe("doSelectInventorySite filterData=" + filterDataInventorySite);
	tx.executeSql("SELECT * FROM inventorySite Where ListID = ?", [filterDataInventorySite],inventorySiteLocalReceiveFunction, inventorySiteErrFunc);
}

function doSelectInventorySiteByName(tx){
	logZoe("doSelectInventorySiteByName filterData=" + filterDataInventorySite);
	tx.executeSql("SELECT * FROM inventorySite Where Name = ?", [filterDataInventorySite],inventorySiteLocalReceiveFunction, inventorySiteErrFunc);
}

function doInventorySites(tx){
	logZoe("doInventorySites");
	tx.executeSql("SELECT * FROM inventorySite", [],inventorySiteLocalListReceiveFunction, inventorySiteErrFunc);
}

function inventorySiteLocalReceiveFunction(tx,results){
	logZoe("inventorySiteLocalReceiveFunction results = " + JSON.stringify(results));
	if (results.rows.length>0){
	logZoe("localReceiveFunction1 " + JSON.stringify(results.rows.item(0)));
		inventorySiteVO=results.rows.item(0);
		inventorySiteReceiveFunction(inventorySiteVO);
	}
	logZoe("localReceiveFunction fin");
}

function inventorySiteLocalListReceiveFunction(tx,results){
	logZoe("inventorySiteLocalListReceiveFunction results.length=" + results.rows.length);
	var i;
	var arrayInventorySites = new Array();
	for (i=0;i<results.rows.length;i++){
	logZoe("inventorySiteLocalListReceiveFunction " + JSON.stringify(results.rows.item(i)));
		arrayInventorySites[i] = results.rows.item(i);
	}
	inventorySiteReceiveListFunction(arrayInventorySites);
}

function doStoreInventorySite(tx){
	logZoe ("doStoreInventorySite ");
	if (recordInventorySite.length){
		var i;
		for (i=0;i<recordInventorySite.length;i++){
			var theRecord = recordInventorySite[i];
			logZoe("store inventorySite:" + JSON.stringify(theRecord));
			doStoreOneInventorySite(tx, theRecord);
		}
	}else{
			doStoreOneInventorySite(tx, recordInventorySite);
	}
	
}

function doStoreOneInventorySite(tx, rec){
	tx.executeSql('INSERT OR REPLACE INTO inventorySite(ListID, Name, SiteDesc) values (?,?,?)',[rec.ListID, rec.Name, rec.SiteDesc]);
}

function doDeleteAllInventorySites(tx){
	tx.executeSql('DELETE FROM inventorySite',[]);
}
