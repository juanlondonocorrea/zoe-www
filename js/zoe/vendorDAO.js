// JavaScript Document

var vendorDAO = {list:listVendors, 
		getById:getVendorById, 
		getByName:getVendorByName, 
		store:storeVendor, 
		deleteAll:deleteAllVendor
	};
var filterDataVendor;
var vendorReceiveFunction;
var vendorReceiveListFunction;
var vendorErrFunc;
var vendorVO;
var recordVendor;
//----------------------
//metodos hacia afuera
//----------------------
function getVendorById(aId,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("getVendor db=" + db);
	filterData=aId;
	vendorReceiveFunction = aReceiveFunction;
	vendorErrFunc = aErrFunc;
	db.transaction(doSelectVendor, vendorErrFunc);
}

function getVendorByName(aName,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("getVendor db=" + db);
	filterData=aName;
	vendorReceiveFunction = aReceiveFunction;
	vendorErrFunc = aErrFunc;
	db.transaction(doSelectByNameVendor, vendorErrFunc);
}

function listVendors(aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listVendors db=" + db);
	vendorReceiveListFunction = aReceiveFunction;
	vendorErrFunc = aErrFunc;
	db.transaction(doSelectAllVendor, vendorErrFunc);
}

function storeVendor(records,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("storeVendor records=" + JSON.stringify(records));
	recordVendor = records;
	vendorErrFunc = aErrFunc;
	db.transaction(doStoreVendor, errorCB, successCB);
}

function deleteAllVendor(aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteAllVendor db=" + db);
	vendorErrFunc = aErrFunc;
	db.transaction(doDeleteAllVendor, errorCB, successCB);
}


//----------------------
//metodos privados
//----------------------

function doSelectVendor(tx){
	logZoe("doSelectVendor filterData=" + filterDataVendor);
	tx.executeSql("SELECT * FROM vendor Where ListId=?", [filterDataVendor],vendorLocalReceiveFunction, vendorErrFunc);
}

function doSelectByNameVendor(tx){
	logZoe("doSelectVendor filterData=" + filterDataVendor);
	tx.executeSql("SELECT * FROM vendor Where name=?", [filterDataVendor],vendorLocalReceiveFunction, vendorErrFunc);
}

function doSelectAllVendor(tx){
	logZoe("doSelectAllVendor")
	tx.executeSql("SELECT * FROM vendor ORDER BY name", [],vendorLocalListReceiveFunction, vendorErrFunc);
}


function vendorLocalReceiveFunction(tx,results){
	logZoe("vendorLocalReceiveFunction");
	if (results.rows.length>0){
		vendorVO=results.rows.item(0);
		vendorReceiveFunction(vendorVO);
	}
	logZoe("localReceiveFunction fin");
}

function vendorLocalListReceiveFunction(tx,results){
	print_call_stack();
	var arrayVendors= new Array();
	if (results && results.rows){
		logZoe("vendorLocalListReceiveFunction results.length=" + results.rows.length);
		var i;
		for (i=0;i<results.rows.length;i++){
			logZoe("vendorLocalListReceiveFunction " + JSON.stringify(results.rows.item(i)));
			arrayVendors[i] = results.rows.item(i);
		}
	}else if (results){
		arrayVendors[0] = results;
		//logZoe("arrayVendors[0] " + JSON.stringify(arrayVendors[0]));
	}
	vendorReceiveListFunction(arrayVendors);	
}

function doStoreVendor(tx){
	logZoe ("doStoreVendor ");
	if (recordVendor.length){
		var i;
		for (i=0;i<recordVendor.length;i++){
			var theRecord = recordVendor[i];
			logZoe("store vendor:" + JSON.stringify(theRecord));
			doStoreOneVendor(tx, theRecord);
		}
	}else{
			doStoreOneVendor(tx, recordVendor);
	}
	
}

function doStoreOneVendor(tx, theRecord){
	tx.executeSql('INSERT OR REPLACE INTO vendor(ListID, Name, addr1, addr2, addr3, city, state, country) values (?,?,?,?,?,?,?,?)',[theRecord.ListID, ifUndefNull(theRecord.name), ifUndefNull(theRecord.addr1), ifUndefNull(theRecord.addr2), ifUndefNull(theRecord.addr3), ifUndefNull(theRecord.city), ifUndefNull(theRecord.state), ifUndefNull(theRecord.country)]);
}

function doDeleteAllVendor(tx){
	tx.executeSql('DELETE FROM vendor',[]);
}
