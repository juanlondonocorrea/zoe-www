// JavaScript Document

var inventoryDAO = {list:listInventory, 
				listByCustomer: listInventoryByCustomer,
				getById:getInventoryById, 
				store:storeInventory,
				storeItemSites:storeItemSites,
				deleteAll:deleteAllInventories};
var filterDataInventory;
var inventoryReceiveFunction;
var inventoryReceiveListFunction;
var inventoryErrFunc;
var inventoryVO={ListID:null, FullName:null, InventorySite_ListID:null, QuantityOnHand:0, salesPrice:0, salesTax_ListID:null};
var recordInventory;


//----------------------
//metodos hacia afuera
//----------------------
function getInventoryById(aId,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	filterDataInventory=aId;
	inventoryReceiveFunction = aReceiveFunction;
	inventoryErrFunc = aErrFunc;
	db.transaction(doSelectInventory, inventoryErrFunc);
}

function listInventory(aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listInventories db=" + db);
	inventoryReceiveListFunction = aReceiveFunction;
	inventoryErrFunc = aErrFunc;
	db.transaction(doListInventory, inventoryErrFunc);
}

function listInventoryByCustomer(aCustomer,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	filterDataInventory=aCustomer;
	inventoryReceiveListFunction = aReceiveFunction;
	inventoryErrFunc = aErrFunc;
	db.transaction(doListInventoryByCustomer, inventoryErrFunc);
}


function storeInventory(records,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("storeInventory db=" + db);
	recordInventory = records;
	inventoryErrFunc = aErrFunc;
	db.transaction(doStoreInventory, errorCB, successCB);
}
function storeItemSites(records,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("storeInventory db=" + db);
	recordInventory = records;
	inventoryErrFunc = aErrFunc;
	db.transaction(doStoreItemSites, errorCB, successCB);
}

function storePricelevels(records,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("storePriceLevels db=" + db);
	recordInventory = records;
	inventoryErrFunc = aErrFunc;
	db.transaction(doStorePricelevels, errorCB, successCB);
}

function deleteAllInventories(aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteAllInventory db=" + db);
	inventoryErrFunc = aErrFunc;
	db.transaction(doDeleteAllInventories, errorCB, successCB);
}

function deleteAllPricelevels(aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteAllPricelevels db=" + db);
	inventoryErrFunc = aErrFunc;
	db.transaction(doDeleteAllPricelevels, errorCB, successCB);
}

//----------------------
//metodos privados
//----------------------

function doSelectInventory(tx){
	logZoe("doSelectInventory filterData=" + filterDataInventory);
	tx.executeSql("SELECT inventory.ListID, FullName, InventorySite_ListID, QuantityOnHand, salesPrice, salesDesc, salesTax_ListID, salesTax.desc FROM inventory, salesTax Where inventory.ListID = ? AND salesTax_ListID = salesTax.ListID", [filterDataInventory],inventoryLocalReceiveFunction, inventoryErrFunc);
}

function doListInventory(tx){
	logZoe("doSelectSelesrepInventories");
	tx.executeSql("SELECT inventory.ListID, FullName, InventorySite_ListID, QuantityOnHand, salesPrice, salesTax_ListID, salesTax.desc FROM inventory, salesTax WHERE salesTax_ListID = salesTax.ListID", [],inventoryLocalListReceiveFunction, inventoryErrFunc);
}

function doListInventoryByCustomer(tx){
	logZoe("doListInventoryByCustomer");
	tx.executeSql("select * from(Select i.*,pli.customprice FROM inventory i LEFT JOIN pricelevel_item pli ON pli.inventory_listid = i.listid LEFT JOIN pricelevel pl ON pl.listid=pli.pricelevel_listid LEFT JOIN customer c ON c.pricelevel_listid = pl.listid WHERE c.listid=? UNION SELECT i.*, null as customprice from inventory i Order by salesdesc) where inventorysite_listid is not null", [filterDataInventory],inventoryLocalListReceiveFunction, inventoryErrFunc);
}



function inventoryLocalReceiveFunction(tx,results){
	logZoe("inventoryLocalReceiveFunction results.rows=" + results.rows);
	logZoe("inventoryLocalReceiveFunction results.rows.length=" + results.rows.length);
	if (results.rows.length>0){
	logZoe("localReceiveFunction1 " + JSON.stringify(results.rows.item(0)));
		inventoryVO=results.rows.item(0);
		inventoryReceiveFunction(inventoryVO);
	}
	logZoe("localReceiveFunction fin");
}


function inventoryLocalListReceiveFunction(tx,results){
	logZoe("inventoryLocalListReceiveFunction results.length=" + results.rows.length);
	var i;
	var arrayInventories = new Array();
	for (i=0;i<results.rows.length;i++){
	logZoe("inventoryLocalListReceiveFunction " + JSON.stringify(results.rows.item(i)));
		arrayInventories[i] = results.rows.item(i);
	}
	inventoryReceiveListFunction(arrayInventories);
}

function doStoreInventory(tx){
	logZoe ("doStoreInventory ");
	if (recordInventory.length){
		var i;
		for (i=0;i<recordInventory.length;i++){
			var theRecord = recordInventory[i];
			logZoe("store inventory:" + JSON.stringify(theRecord));
			doStoreOneInventory(tx, theRecord);
		}
	}else{
			doStoreOneInventory(tx, recordInventory);
	}
	
}

function doStoreOneInventory(tx, rec){
		tx.executeSql('INSERT OR REPLACE INTO inventory(ListID, FullName, InventorySite_ListID, QuantityOnHand, salesPrice, salesTax_ListID, salesDesc) values (?,?,?,?,?,?,?)',[rec.ListID, rec.FullName, ifUndefNull(rec.InventorySite_ListID), ifUndefNull(rec.QuantityOnHand), rec.salesPrice, ifUndefNull(rec.salesTax_ListID), ifUndefNull(rec.salesDesc)]);
}


function doStoreItemSites(tx){
	logZoe ("doStoreItemSites ");
	if (recordInventory.length){
		var i;
		for (i=0;i<recordInventory.length;i++){
			var theRecord = recordInventory[i];
			logZoe("store doStoreItemSites:" + JSON.stringify(theRecord));
			doStoreOneItemSites(tx, theRecord);
		}
	}else{
			doStoreOneItemSites(tx, recordInventory);
	}
	
}

function doStoreOneItemSites(tx, rec){
		tx.executeSql('UPDATE inventory SET InventorySite_ListID = ?, QuantityOnHand = ? WHERE ListID=?',[ifUndefNull(rec.InventorySite_ListID), ifUndefNull(rec.QuantityOnHand), rec.ListID]);
}

function doDeleteAllInventories(tx){
	tx.executeSql('DELETE FROM inventory',[]);
}
