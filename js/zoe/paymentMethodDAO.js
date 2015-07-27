// JavaScript Document

var paymentMethodDAO = {list:listPaymentMethods, 
				getById:getPaymentMethodById, 
				store:storePaymentMethod, 
				deleteAll:deleteAllPaymentMethods};
var filterDataPaymentMethod;
var paymentMethodReceiveFunction;
var paymentMethodReceiveListFunction;
var paymentMethodErrFunc;
var paymentMethodVO;
var recordPaymentMethod;

//----------------------
//metodos hacia afuera
//----------------------
function getPaymentMethodById(aId,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("getPaymentMethod db=" + db);
	filterData=aId;
	paymentMethodReceiveFunction = aReceiveFunction;
	paymentMethodErrFunc = aErrFunc;
	db.transaction(doSelectPaymentMethod, paymentMethodErrFunc);
}

function listPaymentMethods(aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listPaymentMethods db=" + db);
	paymentMethodReceiveListFunction = aReceiveFunction;
	paymentMethodErrFunc = aErrFunc;
	db.transaction(doPaymentMethods, paymentMethodErrFunc);
}

function storePaymentMethod(records,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("storePaymentMethod db=" + db);
	recordPaymentMethod = records;
	paymentMethodErrFunc = aErrFunc;
	db.transaction(doStorePaymentMethod, errorCB, successCB);
}

function deleteAllPaymentMethods(aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteAllPaymentMethods db=" + db);
	paymentMethodErrFunc = aErrFunc;
	db.transaction(doDeleteAllPaymentMethods, errorCB, successCB);
}


//----------------------
//metodos privados
//----------------------

function doSelectPaymentMethod(tx){
	logZoe("doSelectPaymentMethod filterData=" + filterDataPaymentMethod);
	tx.executeSql("SELECT ListID, name, type FROM paymentMethod Where ListID = ?", [filterDataPaymentMethod],paymentMethodLocalReceiveFunction, paymentMethodErrFunc);
}

function doPaymentMethods(tx){
	logZoe("doPaymentMethods");
	tx.executeSql("SELECT ListID, name, type FROM paymentMethod", [],paymentMethodLocalListReceiveFunction, paymentMethodErrFunc);
}

function paymentMethodLocalReceiveFunction(tx,results){
	logZoe("paymentMethodLocalReceiveFunction results = " + JSON.stringify(results));
	if (results.rows.length>0){
	logZoe("localReceiveFunction1 " + JSON.stringify(results.rows.item(0)));
		paymentMethodVO=results.rows.item(0);
		paymentMethodReceiveFunction(paymentMethodVO);
	}
	logZoe("localReceiveFunction fin");
}

function paymentMethodLocalListReceiveFunction(tx,results){
	logZoe("paymentMethodLocalListReceiveFunction results.length=" + results.rows.length);
	var i;
	var arrayPaymentMethods = new Array();
	for (i=0;i<results.rows.length;i++){
	logZoe("paymentMethodLocalListReceiveFunction " + JSON.stringify(results.rows.item(0)));
		arrayPaymentMethods[i] = results.rows.item(i);
	}
	paymentMethodReceiveListFunction(arrayPaymentMethods);
}

function doStorePaymentMethod(tx){
	logZoe ("doStorePaymentMethod ");
	if (recordPaymentMethod.length){
		var i;
		for (i=0;i<recordPaymentMethod.length;i++){
			var theRecord = recordPaymentMethod[i];
			logZoe("store paymentMethod:" + JSON.stringify(theRecord));
			doStoreOnePaymentMethod(tx, theRecord);
		}
	}else{
			doStoreOnePaymentMethod(tx, recordPaymentMethod);
	}
	
}

function doStoreOnePaymentMethod(tx, rec){
	tx.executeSql('INSERT OR REPLACE INTO paymentMethod(ListID, name, type) values (?,?,?)',[rec.ListID, rec.name, rec.type]);
}

function doDeleteAllPaymentMethods(tx){
	tx.executeSql('DELETE FROM paymentMethod',[]);
}
