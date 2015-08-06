// JavaScript Document

var classDAO = {list:listClasses, 
				getById:getClassById, 
				store:storeClass, 
				deleteAll:deleteAllClasses};
var filterDataClass;
var classReceiveFunction;
var classReceiveListFunction;
var classErrFunc;
var classVO;
var recordClass;

//----------------------
//metodos hacia afuera
//----------------------
function getClassById(aId,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("getClass db=" + db);
	filterData=aId;
	classReceiveFunction = aReceiveFunction;
	classErrFunc = aErrFunc;
	db.transaction(doSelectClass, classErrFunc);
}

function listClasses(aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listClasses db=" + db);
	classReceiveListFunction = aReceiveFunction;
	classErrFunc = aErrFunc;
	db.transaction(doClasses, classErrFunc);
}

function storeClass(records,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("storeClass db=" + db);
	recordClass = records;
	classErrFunc = aErrFunc;
	db.transaction(doStoreClass, errorCB, successCB);
}

function deleteAllClasses(aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteAllClasses db=" + db);
	classErrFunc = aErrFunc;
	db.transaction(doDeleteAllClasses, errorCB, successCB);
}


//----------------------
//metodos privados
//----------------------

function doSelectClass(tx){
	logZoe("doSelectClass filterData=" + filterDataClass);
	tx.executeSql("SELECT * FROM class Where LISTID = ?", [filterDataClass],classLocalReceiveFunction, classErrFunc);
}

function doClasses(tx){
	logZoe("doClasses");
	tx.executeSql("SELECT * FROM class", [],classLocalListReceiveFunction, classErrFunc);
}

function classLocalReceiveFunction(tx,results){
	logZoe("classLocalReceiveFunction results = " + JSON.stringify(results));
	if (results.rows.length>0){
	logZoe("localReceiveFunction1 " + JSON.stringify(results.rows.item(0)));
		classVO=results.rows.item(0);
		classReceiveFunction(classVO);
	}
	logZoe("localReceiveFunction fin");
}

function classLocalListReceiveFunction(tx,results){
	logZoe("classLocalListReceiveFunction results.length=" + results.rows.length);
	var i;
	var arrayClasses = new Array();
	for (i=0;i<results.rows.length;i++){
	logZoe("classLocalListReceiveFunction " + JSON.stringify(results.rows.item(i)));
		arrayClasses[i] = results.rows.item(i);
	}
	classReceiveListFunction(arrayClasses);
}

function doStoreClass(tx){
	logZoe ("doStoreClass ");
	if (recordClass.length){
		var i;
		for (i=0;i<recordClass.length;i++){
			var theRecord = recordClass[i];
			logZoe("store class:" + JSON.stringify(theRecord));
			doStoreOneClass(tx, theRecord);
		}
	}else{
			doStoreOneClass(tx, recordClass);
	}
	
}

function doStoreOneClass(tx, rec){
	tx.executeSql('INSERT OR REPLACE INTO class(ListID, Name, Type) values (?,?,?)',[rec.ListID, rec.Name]);
}

function doDeleteAllClasses(tx){
	tx.executeSql('DELETE FROM class',[]);
}
