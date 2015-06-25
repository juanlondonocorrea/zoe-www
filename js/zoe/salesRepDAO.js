// JavaScript Document

var salesRepDAO = {getByName:getSalesRepByName, store:storeSalesRep, };
var filterData;
var salesRepReceiveFunction;
var salesRepErrFunc;
var salesRepVO;
var recordSalesRep;

function getSalesRepByName(aName,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("getSalesRep db=" + db);
	filterData=aName;
	salesRepReceiveFunction = aReceiveFunction;
	salesRepErrFunc = aErrFunc;
	db.transaction(doSelectSalesRep, salesRepErrFunc);
}
function storeSalesRep(record,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("storeSalesRep db=" + db);
	recordSalesRep = record;
	salesRepErrFunc = aErrFunc;
	db.transaction(doStoreSalesRep, errorCB, successCB);
}



function doSelectSalesRep(tx){
	logZoe("doSelectSalesRep filterData=" + filterData);
	tx.executeSql("SELECT id_salesrep,Name, Password, isActive, SyncTime, Initial FROM salesRep Where Name=?", [filterData],localReceiveFunction, salesRepErrFunc);
}

function localReceiveFunction(tx,results){
	logZoe("localReceiveFunction results.length=" + results.rows.length);
	if (results.rows.length>0){
	logZoe("localReceiveFunction1 " + JSON.stringify(results.rows.item(0)));
		salesRepVO=results.rows.item(0);
		salesRepReceiveFunction(salesRepVO);
	}
	logZoe("localReceiveFunction fin");
}

function doStoreSalesRep(tx){
	logZoe ("doStoreSalesRep"+JSON.stringify(recordSalesRep));
	tx.executeSql('INSERT OR REPLACE INTO salesRep(id_salesrep, Name, Password, isActive, SyncTime, Initial) values (?,?,?,?,?,?)',[recordSalesRep.id_salesRep, recordSalesRep.name, recordSalesRep.password, recordSalesRep.isActive, recordSalesRep.syncTime, recordSalesRep.Initial]/*,localReceiveFunction, salesRepErrFunc*/);
}
