// JavaScript Document

var customerMsgDAO = {list:listCustomerMsgs, 
				getById:getCustomerMsgById, 
				store:storeCustomerMsg, 
				deleteAll:deleteAllCustomerMsgs};
var filterDataCustomerMsg;
var customerMsgReceiveFunction;
var customerMsgReceiveListFunction;
var customerMsgErrFunc;
var customerMsgVO;
var recordCustomerMsg;

//----------------------
//metodos hacia afuera
//----------------------
function getCustomerMsgById(aId,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("getCustomerMsg db=" + db);
	filterData=aId;
	customerMsgReceiveFunction = aReceiveFunction;
	customerMsgErrFunc = aErrFunc;
	db.transaction(doSelectCustomerMsg, customerMsgErrFunc);
}

function listCustomerMsgs(aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listCustomerMsgs db=" + db);
	customerMsgReceiveListFunction = aReceiveFunction;
	customerMsgErrFunc = aErrFunc;
	db.transaction(doCustomerMsgs, customerMsgErrFunc);
}

function storeCustomerMsg(records,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("storeCustomerMsg db=" + db);
	recordCustomerMsg = records;
	customerMsgErrFunc = aErrFunc;
	db.transaction(doStoreCustomerMsg, errorCB, successCB);
}

function deleteAllCustomerMsgs(aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteAllCustomerMsgs db=" + db);
	customerMsgErrFunc = aErrFunc;
	db.transaction(doDeleteAllCustomerMsgs, errorCB, successCB);
}


//----------------------
//metodos privados
//----------------------

function doSelectCustomerMsg(tx){
	logZoe("doSelectCustomerMsg filterData=" + filterDataCustomerMsg);
	tx.executeSql("SELECT ListID, FullName FROM customer_msg  Where ListID = ?", [filterDataCustomerMsg],customerMsgLocalReceiveFunction, customerMsgErrFunc);
}

function doCustomerMsgs(tx){
	logZoe("doCustomerMsgs");
	tx.executeSql("SELECT ListID, FullName FROM customer_msg", [],customerMsgLocalListReceiveFunction, customerMsgErrFunc);
}

function customerMsgLocalReceiveFunction(tx,results){
	logZoe("customerMsgLocalReceiveFunction results = " + JSON.stringify(results));
	if (results.rows.length>0){
	logZoe("localReceiveFunction1 " + JSON.stringify(results.rows.item(0)));
		customerMsgVO=results.rows.item(0);
		customerMsgReceiveFunction(customerMsgVO);
	}
	logZoe("localReceiveFunction fin");
}

function customerMsgLocalListReceiveFunction(tx,results){
	logZoe("customerMsgLocalListReceiveFunction results.length=" + results.rows.length);
	var i;
	var arrayCustomerMsgs = new Array();
	for (i=0;i<results.rows.length;i++){
	logZoe("customerMsgLocalListReceiveFunction " + JSON.stringify(results.rows.item(i)));
		arrayCustomerMsgs[i] = results.rows.item(i);
	}
	customerMsgReceiveListFunction(arrayCustomerMsgs);
}

function doStoreCustomerMsg(tx){
	logZoe ("doStoreCustomerMsg ");
	if (recordCustomerMsg.length){
		var i;
		for (i=0;i<recordCustomerMsg.length;i++){
			var theRecord = recordCustomerMsg[i];
			logZoe("store customerMsg:" + JSON.stringify(theRecord));
			doStoreOneCustomerMsg(tx, theRecord);
		}
	}else{
			doStoreOneCustomerMsg(tx, recordCustomerMsg);
	}
	
}

function doStoreOneCustomerMsg(tx, rec){
	tx.executeSql('INSERT OR REPLACE INTO customer_msg(ListID, FullName) values (?,?)',[rec.ListID, rec.FullName]);
}

function doDeleteAllCustomerMsgs(tx){
	tx.executeSql('DELETE FROM customer_msg',[]);
}
