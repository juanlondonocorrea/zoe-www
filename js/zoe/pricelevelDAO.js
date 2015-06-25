// JavaScript Document

var pricelevelDAO = {list:listPricelevels, 
				getById:getPricelevelById, 
				store:storePricelevel, 
				deleteAll:deleteAllPricelevels};
var filterDataPricelevel;
var pricelevelReceiveFunction;
var pricelevelReceiveListFunction;
var pricelevelErrFunc;
var pricelevelVO;
var recordPricelevel;


//----------------------
//metodos hacia afuera
//----------------------
function getPricelevelById(aId,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("getPricelevel db=" + db);
	filterDataPricelevel=aId;
	pricelevelReceiveFunction = aReceiveFunction;
	pricelevelErrFunc = aErrFunc;
	db.transaction(doSelectPricelevel, pricelevelErrFunc);
}

function listPricelevels(aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listPricelevels db=" + db);
	pricelevelReceiveListFunction = aReceiveFunction;
	pricelevelErrFunc = aErrFunc;
	db.transaction(doPricelevels, pricelevelErrFunc);
}

function storePricelevel(records,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("storePricelevel db=" + db);
	recordPricelevel = records;
	pricelevelErrFunc = aErrFunc;
	db.transaction(doStorePricelevel, errorCB, successCB);
}

function deleteAllPricelevels(aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteAllPricelevel db=" + db);
	pricelevelErrFunc = aErrFunc;
	db.transaction(doDeleteAllPricelevels, errorCB, successCB);
}


//----------------------
//metodos privados
//----------------------

function doSelectPricelevel(tx){
	logZoe("doSelectPricelevel filterData=" + filterDataPricelevel);
	tx.executeSql("SELECT ListID, name, type, fixedPercentage FROM pricelevel Where ListID = ?", [filterDataPricelevel],pricelevelLocalReceiveFunction, pricelevelErrFunc);
}

function doPricelevels(tx){
	logZoe("doPricelevels");
	tx.executeSql("SELECT ListID, name, type, fixedPercentage FROM pricelevel", [],pricelevelLocalListReceiveFunction, pricelevelErrFunc);
}


function pricelevelLocalReceiveFunction(tx,results){
	logZoe("pricelevelLocalReceiveFunction results.rows=" + results.rows);
	logZoe("pricelevelLocalReceiveFunction results.rows.length=" + results.rows.length);
	if (results.rows.length>0){
	logZoe("localReceiveFunction1 " + JSON.stringify(results.rows.item(0)));
		pricelevelVO=results.rows.item(0);
		pricelevelReceiveFunction(pricelevelVO);
	}
	logZoe("localReceiveFunction fin");
}


function pricelevelLocalListReceiveFunction(tx,results){
	logZoe("pricelevelLocalListReceiveFunction results.length=" + results.rows.length);
	var i;
	var arrayPricelevels = new Array();
	for (i=0;i<results.rows.length;i++){
	logZoe("pricelevelLocalListReceiveFunction " + JSON.stringify(results.rows.item(i)));
		arrayPricelevels[i] = results.rows.item(i);
	}
	pricelevelReceiveListFunction(arrayPricelevels);
}

function doStorePricelevel(tx){
	logZoe ("doStorePricelevel ");
	if (recordPricelevel.length){
		var i;
		for (i=0;i<recordPricelevel.length;i++){
			var theRecord = recordPricelevel[i];
			logZoe("store pricelevel:" + JSON.stringify(theRecord));
			doStoreOnePricelevel(tx, theRecord);
		}
	}else{
			doStoreOnePricelevel(tx, recordPricelevel);
	}
	
}

function doStoreOnePricelevel(tx, rec){
		tx.executeSql('INSERT OR REPLACE INTO pricelevel(ListID, name, type, fixedPercentage) values (?,?,?,?)',[rec.ListID, rec.name, rec.type, ifUndefNull(rec.fixedPercentage)]);
	
	 if (rec.items){
		 for (var i=0;i<rec.items.length;i++){
			 var item = rec.items[i];
			 tx.executeSql('INSERT OR REPLACE INTO pricelevel_item(pricelevel_ListID,inventory_ListID,customPrice) VALUES(?,?,?)',[item.pricelevel_ListID,item.inventory_ListID,item.customPrice]);
		 }
	 }
}

function doDeleteAllPricelevels(tx){
	tx.executeSql('DELETE FROM pricelevel_items',[]);
	tx.executeSql('DELETE FROM pricelevel',[]);
}
