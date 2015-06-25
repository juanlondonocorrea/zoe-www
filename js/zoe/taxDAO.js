// JavaScript Document

var taxDAO = {list:listTaxes, 
				getById:getTaxById, 
				store:storeTax, 
				deleteAll:deleteAllTaxes};
var filterDataTax;
var taxReceiveFunction;
var taxReceiveListFunction;
var taxErrFunc;
var taxVO;
var recordTax;

//----------------------
//metodos hacia afuera
//----------------------
function getTaxById(aId,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("getTax db=" + db);
	filterData=aId;
	taxReceiveFunction = aReceiveFunction;
	taxErrFunc = aErrFunc;
	db.transaction(doSelectTax, taxErrFunc);
}

function listTaxes(aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listTaxes db=" + db);
	taxReceiveListFunction = aReceiveFunction;
	taxErrFunc = aErrFunc;
	db.transaction(doTaxes, taxErrFunc);
}

function storeTax(records,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("storeTax db=" + db);
	recordTax = records;
	taxErrFunc = aErrFunc;
	db.transaction(doStoreTax, errorCB, successCB);
}

function deleteAllTaxes(aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteAllTaxes db=" + db);
	taxErrFunc = aErrFunc;
	db.transaction(doDeleteAllTaxes, errorCB, successCB);
}


//----------------------
//metodos privados
//----------------------

function doSelectTax(tx){
	logZoe("doSelectTax filterData=" + filterDataTax);
	tx.executeSql("SELECT ListID, name, desc FROM salesTax Where ListID = ?", [filterDataTax],taxLocalReceiveFunction, taxErrFunc);
}

function doTaxes(tx){
	logZoe("doTaxes");
	tx.executeSql("SELECT ListID, name, desc FROM salesTax", [],taxLocalListReceiveFunction, taxErrFunc);
}

function taxLocalReceiveFunction(tx,results){
	logZoe("taxLocalReceiveFunction results = " + JSON.stringify(results));
	if (results.rows.length>0){
	logZoe("localReceiveFunction1 " + JSON.stringify(results.rows.item(0)));
		taxVO=results.rows.item(0);
		taxReceiveFunction(taxVO);
	}
	logZoe("localReceiveFunction fin");
}

function taxLocalListReceiveFunction(tx,results){
	logZoe("taxLocalListReceiveFunction results.length=" + results.rows.length);
	var i;
	var arrayTaxes = new Array();
	for (i=0;i<results.rows.length;i++){
	logZoe("taxLocalListReceiveFunction " + JSON.stringify(results.rows.item(0)));
		arrayTaxes[i] = results.rows.item(i);
	}
	taxReceiveListFunction(arrayTaxes);
}

function doStoreTax(tx){
	logZoe ("doStoreTax ");
	if (recordTax.length){
		var i;
		for (i=0;i<recordTax.length;i++){
			var theRecord = recordTax[i];
			logZoe("store tax:" + JSON.stringify(theRecord));
			doStoreOneTax(tx, theRecord);
		}
	}else{
			doStoreOneTax(tx, recordTax);
	}
	
}

function doStoreOneTax(tx, rec){
	tx.executeSql('INSERT OR REPLACE INTO salesTax(ListID, name, desc) values (?,?,?)',[rec.ListID, rec.name, rec.desc]);
}

function doDeleteAllTaxes(tx){
	tx.executeSql('DELETE FROM salesTax',[]);
}
