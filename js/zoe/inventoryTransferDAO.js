// JavaScript Document

var inventoryTransferDAO = {
				getById: getInventoryTransferById, 
				listToUpload:listInventoryTransferToUpload,
				getById:getInventoryTransferById, 
				store:storeInventoryTransfer, 
				deleteAll:deleteAllInventoryTransfer, 
				delete:deleteInventoryTransfer, 
				markToSync:markToSyncInventoryTransfer, 
				markSynchronized:doMarkSynchorinizedInventoryTransfer,
				generateRefNum:doGenerateRefNum
			};
var filterDataInventoryTransfer;
var inventoryTransferReceiveFunction;
var inventoryTransferReceiveListFunction;
var inventoryTransferErrFunc;
var inventoryTransferVO;
var recordInventoryTransfer;
var includeInventoryTransferDetails;

//----------------------
//metodos hacia afuera
//----------------------

function doGenerateRefNum(prefix){
	var date = new Date();
	var toReturn = prefix + (date.getFullYear()+"").substring(3) + "" + (date.getMonth()+1) + "" + date.getDate()+""+date.getHours() + "" + date.getMinutes();
	var plantilla = 'xxxxxxxxxxx'.substring(toReturn.length);
	toReturn += plantilla.replace(/[xy]/g, function(c) {
        var r = Math.random()*10|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(10);
    });
    toReturn = toReturn.toUpperCase();
	return toReturn;
}

function getInventoryTransferById(aId,includeDetail,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("getInventoryTransfer db=" + db);
	filterDataInventoryTransfer=aId;
	inventoryTransferReceiveFunction = aReceiveFunction;
	includeInventoryTransferDetails = includeDetail;
	inventoryTransferErrFunc = aErrFunc;
	db.transaction(doSelectInventoryTransfer, inventoryTransferErrFunc);
}

function listInventoryTransferToUpload(aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listInventoryTransferToUpload db=" + db);
	inventoryTransferReceiveListFunction = aReceiveFunction;
	inventoryTransferErrFunc = aErrFunc;
	db.transaction(dolistInventoryTransferToUpload, inventoryTransferErrFunc);
}

function storeInventoryTransfer(records,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("storeInventoryTransfer db=" + db);
	recordInventoryTransfer = records;
	inventoryTransferErrFunc = aErrFunc;
	db.transaction(dostoreInventoryTransfer, errorCB, successCB);
}

function deleteAllInventoryTransfer(aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteAllInventoryTransfer db=" + db);
	inventoryTransferErrFunc = aErrFunc;
	db.transaction(dodeleteAllInventoryTransfer, errorCB, successCB);
}

function deleteInventoryTransfer(idInventoryTransfer,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteInventoryTransfer db=" + db);
	filterDataInventoryTransfer = idInventoryTransfer;
	inventoryTransferErrFunc = aErrFunc;
	db.transaction(dodeleteInventoryTransfer, errorCB, successCB);
}

function markToSyncInventoryTransfer(id_InventoryTransfer,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("markToSyncInventoryTransfer db=" + db);
	customerErrFunc = aErrFunc;
	filterDataInventoryTransfer = id_InventoryTransfer;
	db.transaction(domarkToSyncInventoryTransfer, errorCB, successCB);
}

//----------------------
//metodos privados
//----------------------

function doSelectInventoryTransfer(tx){
	logZoe("doSelectInventoryTransfer filterData=" + filterDataInventoryTransfer);
	tx.executeSql("SELECT * FROM InventoryTransfer WHERE InventoryTransfer.id_InventoryTransfer = ?", [filterDataInventoryTransfer],InventoryTransferLocalReceiveFunction, inventoryTransferErrFunc);
}

function dolistInventoryTransferToUpload(tx){
	var selectStr = "SELECT InventoryTransfer.*, InventoryTransfer_item.*, inventorySite_ListID, customer.FullName as companyName " +
	"FROM InventoryTransfer LEFT JOIN InventoryTransfer_item ON InventoryTransfer.id_InventoryTransfer = InventoryTransfer_item.id_InventoryTransfer " +
	"LEFT JOIN inventory ON InventoryTransfer_item.inventory_ListID = inventory.ListID " +
	"LEFT JOIN customer ON customer.ListID = InventoryTransfer.ListID WHERE InventoryTransfer.needSync = 1";
	logZoe("dolistInventoryTransferToUpload select= " + selectStr);
	tx.executeSql(selectStr,[], InventoryTransferLocalListToUploadReceiveFunction, inventoryTransferErrFunc);
 }


function doCustomerInventoryTransfer(tx){
	logZoe("doSelectSelesrepInventoryTransfer");
	tx.executeSql("SELECT * FROM InventoryTransfer WHERE ListID = ?", [filterDataInventoryTransfer],InventoryTransferLocalListReceiveFunction, inventoryTransferErrFunc);
}

function doCustomerInventoryTransferByDateRange(tx){
	logZoe("doCustomerInventoryTransferByDateRange ========");
	strInventoryTransfer = " SELECT TxnDate, customer.FullName AS Full_Name, refNumber, TotalAmount AS TotAmount, InventoryTransferMethod.Name AS InventoryTransferMethod_Name "+
				  " FROM InventoryTransfer "+
				  " LEFT JOIN customer ON customer.ListID = InventoryTransfer.ListID "+
				  " LEFT JOIN InventoryTransferMethod ON InventoryTransferMethod.ListID = InventoryTransfer.InventoryTransferMethod_ListID "+
				  " WHERE TxnDate BETWEEN ? AND ? "+
				  " ORDER BY TxnDate ASC";
	logZoe("strInventoryTransfer ========"+strInventoryTransfer);
	tx.executeSql(strInventoryTransfer, filterDataInventoryTransfer,InventoryTransferLocalListReceiveFunction, inventoryTransferErrFunc);
}

function InventoryTransferLocalReceiveFunction(tx,results){
	console.log("InventoryTransferLocalReceiveFunction includeInventoryTransferDetails=" + includeInventoryTransferDetails);
	console.log("InventoryTransferLocalReceiveFunction results.rows=" + results.rows);
	console.log("InventoryTransferLocalReceiveFunction results.rows.length=" + results.rows.length);
	if (results.rows.length>0){
		inventoryTransferVO=results.rows.item(0);
			if (includeInventoryTransferDetails){
					tx.executeSql("SELECT pat.*, invoice.*"+
					" FROM InventoryTransferAppliedTo pat LEFT JOIN invoice ON pat.txnID = invoice.id_invoice " +
					" Where id_InventoryTransfer = ?", [filterDataInventoryTransfer],InventoryTransferItemsLocalReceiveFunction, InventoryTransferLocalErrFunc);
			}else{
				inventoryTransferReceiveFunction(inventoryTransferVO);
			}
	}
	logZoe("localReceiveFunction fin");
}

function InventoryTransferLocalErrFunc(tx, err){
	console.log("InventoryTransferLocalErrFunc error: " + JSON.stringify(err));
	inventoryTransferErrFunc(err);
}

function InventoryTransferItemsLocalReceiveFunction(tx,results){
	console.log("InventoryTransferItemsLocalReceiveFunction 1");
	console.log("InventoryTransferItemsLocalReceiveFunction results = " + results);
	console.log("InventoryTransferItemsLocalReceiveFunction results.rows" + results.rows);
	if (results && results.rows){
		console.log("InventoryTransferItemsLocalReceiveFunction results.rows.length = " + results.rows.length);
	}
	if (results && results.rows && results.rows.length>0){
		inventoryTransferVO.items=new Array();
		var i;
		for (i = 0; i<results.rows.length; i++){
			console.log("InventoryTransferItemsLocalReceiveFunction lastItem=" + results.rows.item(i));
			inventoryTransferVO.items[i] = results.rows.item(i);
		}
	}
	console.log("InventoryTransferItemsLocalReceiveFunction fin inventoryTransferVO=" +  JSON.stringify(inventoryTransferVO));
	inventoryTransferReceiveFunction(inventoryTransferVO);
}

function InventoryTransferLocalListReceiveFunction(tx,results){
	logZoe("InventoryTransferLocalListReceiveFunction results=" + results);
	logZoe("InventoryTransferLocalListReceiveFunction results.rows=" + results.rows);
	logZoe("InventoryTransferLocalListReceiveFunction results.length=" + results.rows.length);
	var i;
	arrayInventoryTransfer = new Array();
	for (i=0;i<results.rows.length;i++){
	logZoe("InventoryTransferLocalListReceiveFunction " + JSON.stringify(results.rows.item(i)));
		arrayInventoryTransfer[i] = results.rows.item(i);
	}
	inventoryTransferReceiveListFunction(arrayInventoryTransfer);
}


function doGetInventoryTransferItems(tx){
	currentI += 1;
	if (currentI<arrayInventoryTransfer.length){
		var currentInventoryTransfer = arrayInventoryTransfer[i];
		tx.executeSql("SELECT LineID, id_InventoryTransfer, Inventory_ListID, Desc, Quantity, Rate, Amount, SalesTax_ListID FROM InventoryTransfer_item Where id_InventoryTransfer = ?", [currentInventoryTransfer.id_InventoryTransfer+""],InventoryTransferItemLocalReceiveFunction, inventoryTransferErrFunc);
	}
}

function InventoryTransferItemLocalReceiveFunction(tx,results){

}

function dostoreInventoryTransfer(tx){
	logZoe ("dostoreInventoryTransfer ");
	if (recordInventoryTransfer.length){
		var i;
		for (i=0;i<recordInventoryTransfer.length;i++){
			var theRecord = recordInventoryTransfer[i];
			logZoe("store InventoryTransfer:" + JSON.stringify(theRecord));
			doStoreOneInventoryTransfer(tx, theRecord);
		}
	}else{
			doStoreOneInventoryTransfer(tx, recordInventoryTransfer);
	}
	
}

function doStoreOneInventoryTransfer(tx, rec){
		tx.executeSql('INSERT OR REPLACE INTO InventoryTransfer(id_InventoryTransfer, TxnDate, refNumber, totalAmount, memo, ListID, InventoryTransferMethod_ListID, id_creditMemo, origin,zoeUpdateDate, zoeSyncDate, needSync) ' +
		' values (?,?,?,?,?,?,?,?,?,?,?,?)',
		[rec.id_InventoryTransfer, rec.TxnDate, ifUndefNull(rec.refNumber)+"", ifUndefNull(rec.totalAmount), 
		ifUndefNull(rec.memo), ifUndefNull(rec.ListID), ifUndefNull(rec.InventoryTransferMethod_ListID), 
		ifUndefNull(rec.id_creditMemo), ifUndefNull(rec.origin), 
		dateFormat(new Date(),'yyyy-mm-dd'), null, rec.needSync] );
		
	 if (rec.items){
	 	console.log("storing InventoryTransfer items")
		 for (var i=0;i<rec.items.length;i++){
			 var item = rec.items[i];
			 console.log("item=" + JSON.stringify(item));
			 tx.executeSql('INSERT INTO InventoryTransferAppliedTo(TxnID,id_InventoryTransfer,InventoryTransferAmount) '+
			 ' VALUES(?,?,?)',
			 [item.TxnID,rec.id_InventoryTransfer,ifUndefNull(item.InventoryTransferAmount)]);
		 }
	 }
}

function dodeleteAllInventoryTransfer(tx){
	tx.executeSql('DELETE FROM InventoryTransferAppliedTo',[]);
	tx.executeSql('DELETE FROM InventoryTransfer',[]);
}

function dodeleteInventoryTransfer(tx){
	console.log("dodeleteInventoryTransfer filterDataInventoryTransfer=" + filterDataInventoryTransfer);
	tx.executeSql('DELETE FROM InventoryTransferAppliedTo where id_InventoryTransfer=?',[filterDataInventoryTransfer+""]);
	tx.executeSql('DELETE FROM InventoryTransfer where id_InventoryTransfer = ?',[filterDataInventoryTransfer+""]);
}

function domarkToSyncInventoryTransfer(tx){
	logZoe ("domarkToSyncInventoryTransfer datafiler=" + filterDataInventoryTransfer);
	tx.executeSql("UPDATE InventoryTransfer SET needSync=1, zoeUpdateDate=datetime('now', 'localtime') where id_InventoryTransfer = ?",[filterDataInventoryTransfer+""]);
}

function doMarkSynchorinizedInventoryTransfer(tx){
	tx.executeSql("UPDATE InventoryTransfer SET needSync=0, zoeSyncDate=datetime('now', 'localtime') where id_InventoryTransfer = ?",[filterDataInventoryTransfer+""]);
}

