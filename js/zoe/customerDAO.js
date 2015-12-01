// JavaScript Document

var customerDAO = {list:listCustomers, 
		listBySalesRep:listCustomersBySalesRep,
		listByRouteDay:listCustomersByRouteDay,
		listModifiedToUpload:listModifiedCustomersToUpload,
		listAddedToUpload:listAddedCustomersToUpload,
		listAllToUpload:listAllCustomersToUpload,
		getById:getCustomerById, 
		store:storeCustomer, 
		updateVendor:updateCustomerVendor, 
		deleteAll:deleteAllCustomer, 
		delete:deleteCustomer,
		move:moveCustomer,
		markToSync:markToSyncCustomer, 
		markSynchronized:markSynchronizedCustomer,
		markSynchronizedError:markSynchronizedErrorCustomer};
var filterDataCustomer;
var customerReceiveFunction;
var customerReceiveListFunction;
var customerErrFunc;
var customerVO;
var recordCustomer;
var customerOrigin;
var oldCustomerListID;
var newCustomerListID;
//----------------------
//metodos hacia afuera
//----------------------
function getCustomerById(aId,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("getCustomer db=" + db);
	filterData=aId;
	customerReceiveFunction = aReceiveFunction;
	customerErrFunc = aErrFunc;
	db.transaction(doSelectCustomer, customerErrFunc);
}

function listCustomers(aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listCustomers db=" + db);
	customerReceiveListFunction = aReceiveFunction;
	customerErrFunc = aErrFunc;
	db.transaction(doSelectAllCustomer, customerErrFunc);
}

function listModifiedCustomersToUpload(aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listModifiedCustomersToUpload db=" + db);
	customerReceiveListFunction = aReceiveFunction;
	customerErrFunc = aErrFunc;
	db.transaction(doListModifiedCustomersToUpload, customerErrFunc);
}

function listAddedCustomersToUpload(aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listAddedCustomersToUpload db=" + db);
	customerReceiveListFunction = aReceiveFunction;
	customerErrFunc = aErrFunc;
	db.transaction(doListAddedCustomersToUpload, customerErrFunc);
}

function listAllCustomersToUpload(aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listAllCustomersToUpload db=" + db);
	customerReceiveListFunction = aReceiveFunction;
	customerErrFunc = aErrFunc;
	db.transaction(doListAllCustomersToUpload, customerErrFunc);
}

function listCustomersByRouteDay(aDay, aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listCustomers db=" + db);
	customerReceiveListFunction = aReceiveFunction;
	customerErrFunc = aErrFunc;
	filterDataCustomer = aDay;
	db.transaction(doListCustomersByRouteDay, customerErrFunc);
}

function listCustomersBySalesRep(id_salesRep, aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listCustomersBySalesRep db=" + db);
	customerReceiveListFunction = aReceiveFunction;
	customerErrFunc = aErrFunc;
	filterDataCustomer = id_salesRep;
	db.transaction(doListCustomersBySalesRep, customerErrFunc);
}

function storeCustomer(records,aErrFunc,successCB,origin){
	db = openDatabaseZoe();
	logZoe("storeCustomer db=" + db);
	recordCustomer = records;
	customerOrigin = origin;
	customerErrFunc = aErrFunc;
	db.transaction(doStoreCustomer, errorCB, successCB);
}

function moveCustomer(oldListID, newListID,aErrFunc,successCB,origin){
	db = openDatabaseZoe();
	logZoe("moveCustomer oldListID=" + oldListID + ", newListID=" + newListID);
	oldCustomerListID = oldListID;
	newCustomerListID = newListID;
	customerOrigin = origin;
	customerErrFunc = aErrFunc;
	db.transaction(doMoveCustomer, errorCB, successCB);
}

function updateCustomerVendor(records,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("storeCustomer db=" + db);
	recordCustomer = records;
	customerErrFunc = aErrFunc;
	db.transaction(doStoreCustomerVendor, errorCB, successCB);
}

function deleteAllCustomer(aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteAllCustomer db=" + db);
	customerErrFunc = aErrFunc;
	db.transaction(doDeleteAllCustomer, errorCB, successCB);
}

function deleteCustomer(idCustomer,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteCustomer db=" + db);
	filterDataCustomer = idCustomer;
	invoiceErrFunc = aErrFunc;
	db.transaction(doDeleteCustomer, errorCB, successCB);
}


function markToSyncCustomer(ListID,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("markToSyncCustomer db=" + db);
	customerErrFunc = aErrFunc;
	filterDataCustomer = ListID;
	db.transaction(doMarkToSyncCustomer, errorCB, successCB);
}

function markSynchronizedCustomer(ListID,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("markSynchronizedCustomer db=" + db);
	customerErrFunc = aErrFunc;
	filterDataCustomer = ListID;
	db.transaction(doMarkSynchorinizedCustomer, errorCB, successCB);
}

function markSynchronizedErrorCustomer(ListID,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("markSynchronizedErrorInvoice db=" + db);
	customerErrFunc = aErrFunc;
	filterDataCustomer = ListID;
	db.transaction(doMarkSyncErrorCustomer, errorCB, successCB);
}



//----------------------
//metodos privados
//----------------------

function doSelectCustomer(tx){
	logZoe("doSelectCustomer filterData=" + filterDataCustomer);
	tx.executeSql("SELECT ListID, editSequence, FullName, IsActive, billAddress1, billAddress2, shipAddress1, shipAddress2, openBalance, overdueBalance, workPhone, cellPhone, email, shipAddressZipcode, billAddresZipcode, billAddresCity, billAddressState, billAddressCountry, shipAddressCity, shipAddressState, shipAddressCountry, id_salesrep, routeDay1, routeDay2, routeDay3, routeDay4, routeDay5, routeDay6, routeDay7, Fax, billAddress3, shipAddress3, name, companyName, otherDetails, id_term, pricelevel_ListID, vendor_ListID, origin FROM customer Where ListId=?", [filterDataCustomer],customerLocalReceiveFunction, customerErrFunc);
}

function doSelectAllCustomer(tx){
	logZoe("doSelectAllCustomer")
	tx.executeSql("SELECT ListID, editSequence, FullName, IsActive, billAddress1, billAddress2, shipAddress1, shipAddress2, openBalance, overdueBalance, workPhone, cellPhone, email, shipAddressZipcode, billAddresZipcode, billAddresCity, billAddressState, billAddressCountry, shipAddressCity, shipAddressState, shipAddressCountry, id_salesrep, routeDay1, routeDay2, routeDay3, routeDay4, routeDay5, routeDay6, routeDay7, Fax, billAddress3, shipAddress3, name, companyName, otherDetails, id_term, pricelevel_ListID, vendor_ListID, origin FROM customer ORDER BY FullName", [],customerLocalListReceiveFunction, customerErrFunc);
}

function doListCustomersByRouteDay(tx){
	logZoe("doListCustomersByRouteDay")
	var query = "SELECT customer.ListID, editSequence, FullName, IsActive, billAddress1, billAddress2, "
	+" shipAddress1, shipAddress2, openBalance, overdueBalance, workPhone, cellPhone, email, shipAddressZipcode,"
	+" billAddresZipcode, billAddresCity, billAddressState, billAddressCountry, shipAddressCity,"
	+" shipAddressState, shipAddressCountry, id_salesrep, routeDay1, routeDay2, routeDay3, routeDay4, routeDay5,"
	+" routeDay6, routeDay7, Fax, billAddress3, shipAddress3, name, companyName, otherDetails, customer.id_term,"
	+" pricelevel_ListID ,ifnull(inv.salesofday,0) as salesofday, ifnull(cred.creditsofday,0) as creditsofday, vendor_ListID, origin FROM customer"
	+" LEFT JOIN (select listid, sum(subtotal+salestaxtotal) salesofday FROM invoice where shipdate=date('now','localtime') group by listid) as inv on inv.listid= customer.listid"
	+" LEFT JOIN (select listid, sum(subtotal+salestaxtotal) creditsofday FROM creditMemo where shipdate=date('now','localtime') group by listid) as cred on cred.listid= customer.listid"
	+" WHERE customer.routeday" + filterDataCustomer + "=1" ;
	console.log("doListCustomersByRouteDay query=" + query);
	tx.executeSql(query,[],customerLocalListReceiveFunction, customerErrFunc);
}

function doListCustomersBySalesRep(tx){
	logZoe("doListCustomersBySalesRep")
	var query = "SELECT ListID FROM customer WHERE id_salesRep=?";
	console.log("doListCustomersByRouteDay query=" + query);
	tx.executeSql(query,[filterDataCustomer],customerLocalListReceiveFunction, customerErrFunc);
}

function customerLocalReceiveFunction(tx,results){
	logZoe("customerLocalReceiveFunction");
	if (results.rows.length>0){
		customerVO=results.rows.item(0);
		customerReceiveFunction(customerVO);
	}
	logZoe("localReceiveFunction fin");
}

function customerLocalListReceiveFunction(tx,results){
	var arrayCustomers= new Array();
	if (results && results.rows){
		logZoe("customerLocalListReceiveFunction results.length=" + results.rows.length);
		var i;
		for (i=0;i<results.rows.length;i++){
			logZoe("customerLocalListReceiveFunction " + JSON.stringify(results.rows.item(i)));
			arrayCustomers[i] = results.rows.item(i);
		}
	}else if (results){
		arrayCustomers[0] = results;
		//logZoe("arrayCustomers[0] " + JSON.stringify(arrayCustomers[0]));
	}
	customerReceiveListFunction(arrayCustomers);	
}

function doStoreCustomer(tx){
	logZoe ("doStoreCustomer ");
	if (recordCustomer.length){
		var i;
		for (i=0;i<recordCustomer.length;i++){
			var theRecord = recordCustomer[i];
			doStoreOneCustomer(tx, theRecord);
		}
	}else{
			doStoreOneCustomer(tx, recordCustomer);
	}
	
}

function doStoreOneCustomer(tx, theRecord){
	console.log("store customer:" + JSON.stringify(theRecord));
	tx.executeSql('INSERT OR REPLACE INTO customer(ListID, editSequence, FullName, IsActive, billAddress1, '
	+' billAddress2, shipAddress1, shipAddress2, openBalance, overdueBalance, workPhone, cellPhone, '
	+' email, shipAddressZipcode, billAddresZipcode, billAddresCity, billAddressState, billAddressCountry,'
	+' shipAddressCity, shipAddressState, shipAddressCountry, id_salesrep, routeDay1, routeDay2, routeDay3,'
	+' routeDay4, routeDay5, routeDay6, routeDay7, Fax, billAddress3, shipAddress3, name, companyName, otherDetails,'
	+' id_term, pricelevel_ListID, vendor_ListID) '
	+' values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
	[theRecord.ListID, ifUndefNull(theRecord.editSequence+""),ifUndefNull(theRecord.FullName), theRecord.IsActive, ifUndefNull(theRecord.billAddress1), 
	ifUndefNull(theRecord.billAddress2), ifUndefNull(theRecord.shipAddress1), ifUndefNull(theRecord.shipAddress2), 
	ifUndefNull(theRecord.openBalance), ifUndefNull(theRecord.overdueBalance), ifUndefNull(theRecord.workPhone), 
	ifUndefNull(theRecord.cellPhone), ifUndefNull(theRecord.email), ifUndefNull(theRecord.shipAddressZipcode), 
	ifUndefNull(theRecord.billAddresZipcode), ifUndefNull(theRecord.billAddresCity), ifUndefNull(theRecord.billAddressState), 
	ifUndefNull(theRecord.billAddressCountry), ifUndefNull(theRecord.shipAddressCity), ifUndefNull(theRecord.shipAddressState), 
	ifUndefNull(theRecord.shipAddressCountry), ifUndefNull(theRecord.id_salesrep), ifUndefNull(theRecord.routeDay1), 
	ifUndefNull(theRecord.routeDay2), ifUndefNull(theRecord.routeDay3), ifUndefNull(theRecord.routeDay4), 
	ifUndefNull(theRecord.routeDay5), ifUndefNull(theRecord.routeDay6), ifUndefNull(theRecord.routeDay7), 
	ifUndefNull(theRecord.Fax), ifUndefNull(theRecord.billAddress3), ifUndefNull(theRecord.shipAddress3), 
	ifUndefNull(theRecord.name), ifUndefNull(theRecord.companyName), ifUndefNull(theRecord.otherDetails), 
	ifUndefNull(theRecord.id_term), theRecord.pricelevel_ListID, ifUndefNull(theRecord.vendor_ListID)]);
	if (customerOrigin && customerOrigin!=""){
		tx.executeSql('UPDATE customer set origin = ? WHERE ListID = ?',[customerOrigin, theRecord.ListID]);
	}
}

function doListModifiedCustomersToUpload(tx){
	var selectStr = "SELECT * FROM customer WHERE needSync = 1 AND origin = 'remote'";
	logZoe("doListModifiedCustomersToUpload select= " + selectStr);
	tx.executeSql(selectStr,[], customerLocalListReceiveFunction, invoiceErrFunc);
 }

function doListAddedCustomersToUpload(tx){
	var selectStr = "SELECT * FROM customer WHERE needSync = 1 AND origin = 'local'";
	logZoe("doListAddedCustomersToUpload select= " + selectStr);
	tx.executeSql(selectStr,[], customerLocalListReceiveFunction, invoiceErrFunc);
 }

function doListAllCustomersToUpload(tx){
	var selectStr = "SELECT customer.*, vendor.name as vendor_name  FROM customer LEFT JOIN vendor on customer.vendor_ListID = vendor.ListID WHERE needSync = 1";
	logZoe("doListAllCustomersToUpload select= " + selectStr);
	tx.executeSql(selectStr,[], customerLocalListReceiveFunction, invoiceErrFunc);
 }

function doMarkToSyncCustomer(tx){
	tx.executeSql("UPDATE customer SET needSync=1, zoeUpdateDate=datetime('now', 'localtime') where ListID = ?",[filterDataCustomer+""]);
}

function doMarkSynchorinizedCustomer(tx){
	console.log("doMarkSynchorinizedCustomer filterDataCustomer=" + filterDataCustomer);
	tx.executeSql("UPDATE customer SET needSync=0, zoeSyncDate=datetime('now', 'localtime') where ListID = ?",[filterDataCustomer+""]);
}

function doDeleteAllCustomer(tx){
	tx.executeSql('DELETE FROM customer',[]);
}

function doDeleteCustomer(tx){
	console.log("doDeleteCustomer filterDataCustomer=" + filterDataCustomer);
	tx.executeSql('DELETE FROM customer where ListID = ?',[filterDataCustomer+""]);
}

function doMoveCustomer(tx){
	var where = " SET ListID = '"+ newCustomerListID + "' WHERE ListID = '" + oldCustomerListID + "'";
	var sql1 = "UPDATE invoice" + where;
	var sql2 = "UPDATE creditMemo" + where;
	var sql3 = "UPDATE payment " + where;
	var sql4 = "DELETE FROM customer WHERE ListID = '" + oldCustomerListID + "'"; 
		
	console.log(sql1);
	tx.executeSql(sql1,	[]);
	console.log(sql2);
	tx.executeSql(sql2,	[]);
	console.log(sql3);
	tx.executeSql(sql3,	[]);
	console.log(sql4);
	tx.executeSql(sql4,	[]);
}


function doStoreCustomerVendor(tx){
	console.log("update customer vendor " + JSON.stringify(recordCustomer));
	for (var i in recordCustomer){
		tx.executeSql("UPDATE customer SET vendor_ListID=? where vendor_ListID = ? ",[recordCustomer[i].ListID, recordCustomer[i].name.toUpperCase()]);
	}
}

function doMarkSyncErrorCustomer(tx){
	tx.executeSql("UPDATE customer SET needSync=0, zoeSyncDate=datetime('now', 'localtime'), needCorrection=1 where ListID = ?",[filterDataCustomer+""]);
}
