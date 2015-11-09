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
	logZoe("getPayment db=" + db);
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
	logZoe("deleteAllPayment db=" + db);
	inventoryTransferErrFunc = aErrFunc;
	db.transaction(dodeleteAllInventoryTransfer, errorCB, successCB);
}

function deleteInventoryTransfer(idPayment,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteInventoryTransfer db=" + db);
	filterDataInventoryTransfer = idPayment;
	inventoryTransferErrFunc = aErrFunc;
	db.transaction(dodeleteInventoryTransfer, errorCB, successCB);
}

function markToSyncInventoryTransfer(id_payment,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("markToSyncInventoryTransfer db=" + db);
	customerErrFunc = aErrFunc;
	filterDataInventoryTransfer = id_payment;
	db.transaction(domarkToSyncInventoryTransfer, errorCB, successCB);
}

//----------------------
//metodos privados
//----------------------

function doSelectInventoryTransfer(tx){
	logZoe("doSelectInventoryTransfer filterData=" + filterDataInventoryTransfer);
	tx.executeSql("SELECT * FROM payment WHERE payment.id_payment = ?", [filterDataInventoryTransfer],paymentLocalReceiveFunction, inventoryTransferErrFunc);
}

function dolistInventoryTransferToUpload(tx){
	var selectStr = "SELECT payment.*, payment_item.*, inventorySite_ListID, customer.FullName as companyName " +
	"FROM payment LEFT JOIN payment_item ON payment.id_payment = payment_item.id_payment " +
	"LEFT JOIN inventory ON payment_item.inventory_ListID = inventory.ListID " +
	"LEFT JOIN customer ON customer.ListID = payment.ListID WHERE payment.needSync = 1";
	logZoe("dolistInventoryTransferToUpload select= " + selectStr);
	tx.executeSql(selectStr,[], paymentLocalListToUploadReceiveFunction, inventoryTransferErrFunc);
 }


function doCustomerInventoryTransfer(tx){
	logZoe("doSelectSelesrepInventoryTransfer");
	tx.executeSql("SELECT * FROM payment WHERE ListID = ?", [filterDataInventoryTransfer],paymentLocalListReceiveFunction, inventoryTransferErrFunc);
}

function doCustomerInventoryTransferByDateRange(tx){
	logZoe("doCustomerInventoryTransferByDateRange ========");
	strInventoryTransfer = " SELECT TxnDate, customer.FullName AS Full_Name, refNumber, TotalAmount AS TotAmount, PaymentMethod.Name AS PaymentMethod_Name "+
				  " FROM Payment "+
				  " LEFT JOIN customer ON customer.ListID = payment.ListID "+
				  " LEFT JOIN PaymentMethod ON PaymentMethod.ListID = Payment.paymentMethod_ListID "+
				  " WHERE TxnDate BETWEEN ? AND ? "+
				  " ORDER BY TxnDate ASC";
	logZoe("strInventoryTransfer ========"+strInventoryTransfer);
	tx.executeSql(strInventoryTransfer, filterDataInventoryTransfer,paymentLocalListReceiveFunction, inventoryTransferErrFunc);
}

function paymentLocalReceiveFunction(tx,results){
	console.log("paymentLocalReceiveFunction includeInventoryTransferDetails=" + includeInventoryTransferDetails);
	console.log("paymentLocalReceiveFunction results.rows=" + results.rows);
	console.log("paymentLocalReceiveFunction results.rows.length=" + results.rows.length);
	if (results.rows.length>0){
		inventoryTransferVO=results.rows.item(0);
			if (includeInventoryTransferDetails){
					tx.executeSql("SELECT pat.*, invoice.*"+
					" FROM paymentAppliedTo pat LEFT JOIN invoice ON pat.txnID = invoice.id_invoice " +
					" Where id_payment = ?", [filterDataInventoryTransfer],paymentItemsLocalReceiveFunction, paymentLocalErrFunc);
			}else{
				inventoryTransferReceiveFunction(inventoryTransferVO);
			}
	}
	logZoe("localReceiveFunction fin");
}

function paymentLocalErrFunc(tx, err){
	console.log("paymentLocalErrFunc error: " + JSON.stringify(err));
	inventoryTransferErrFunc(err);
}

function paymentItemsLocalReceiveFunction(tx,results){
	console.log("paymentItemsLocalReceiveFunction 1");
	console.log("paymentItemsLocalReceiveFunction results = " + results);
	console.log("paymentItemsLocalReceiveFunction results.rows" + results.rows);
	if (results && results.rows){
		console.log("paymentItemsLocalReceiveFunction results.rows.length = " + results.rows.length);
	}
	if (results && results.rows && results.rows.length>0){
		inventoryTransferVO.items=new Array();
		var i;
		for (i = 0; i<results.rows.length; i++){
			console.log("paymentItemsLocalReceiveFunction lastItem=" + results.rows.item(i));
			inventoryTransferVO.items[i] = results.rows.item(i);
		}
	}
	console.log("paymentItemsLocalReceiveFunction fin inventoryTransferVO=" +  JSON.stringify(inventoryTransferVO));
	inventoryTransferReceiveFunction(inventoryTransferVO);
}

function paymentLocalListReceiveFunction(tx,results){
	logZoe("paymentLocalListReceiveFunction results=" + results);
	logZoe("paymentLocalListReceiveFunction results.rows=" + results.rows);
	logZoe("paymentLocalListReceiveFunction results.length=" + results.rows.length);
	var i;
	arrayInventoryTransfer = new Array();
	for (i=0;i<results.rows.length;i++){
	logZoe("paymentLocalListReceiveFunction " + JSON.stringify(results.rows.item(i)));
		arrayInventoryTransfer[i] = results.rows.item(i);
	}
	inventoryTransferReceiveListFunction(arrayInventoryTransfer);
}


function doGetPaymentItems(tx){
	currentI += 1;
	if (currentI<arrayInventoryTransfer.length){
		var currentPayment = arrayInventoryTransfer[i];
		tx.executeSql("SELECT LineID, id_payment, Inventory_ListID, Desc, Quantity, Rate, Amount, SalesTax_ListID FROM payment_item Where id_payment = ?", [currentPayment.id_payment+""],paymentItemLocalReceiveFunction, inventoryTransferErrFunc);
	}
}

function paymentItemLocalReceiveFunction(tx,results){

}

function dostoreInventoryTransfer(tx){
	logZoe ("dostoreInventoryTransfer ");
	if (recordInventoryTransfer.length){
		var i;
		for (i=0;i<recordInventoryTransfer.length;i++){
			var theRecord = recordInventoryTransfer[i];
			logZoe("store payment:" + JSON.stringify(theRecord));
			doStoreOnePayment(tx, theRecord);
		}
	}else{
			doStoreOnePayment(tx, recordInventoryTransfer);
	}
	
}

function doStoreOnePayment(tx, rec){
		tx.executeSql('INSERT OR REPLACE INTO payment(id_payment, TxnDate, refNumber, totalAmount, memo, ListID, paymentMethod_ListID, id_creditMemo, origin,zoeUpdateDate, zoeSyncDate, needSync) ' +
		' values (?,?,?,?,?,?,?,?,?,?,?,?)',
		[rec.id_payment, rec.TxnDate, ifUndefNull(rec.refNumber)+"", ifUndefNull(rec.totalAmount), 
		ifUndefNull(rec.memo), ifUndefNull(rec.ListID), ifUndefNull(rec.paymentMethod_ListID), 
		ifUndefNull(rec.id_creditMemo), ifUndefNull(rec.origin), 
		dateFormat(new Date(),'yyyy-mm-dd'), null, rec.needSync] );
		
	 if (rec.items){
	 	console.log("storing payment items")
		 for (var i=0;i<rec.items.length;i++){
			 var item = rec.items[i];
			 console.log("item=" + JSON.stringify(item));
			 tx.executeSql('INSERT INTO paymentAppliedTo(TxnID,id_payment,paymentAmount) '+
			 ' VALUES(?,?,?)',
			 [item.TxnID,rec.id_payment,ifUndefNull(item.paymentAmount)]);
		 }
	 }
}

function dodeleteAllInventoryTransfer(tx){
	tx.executeSql('DELETE FROM paymentAppliedTo',[]);
	tx.executeSql('DELETE FROM payment',[]);
}

function dodeleteInventoryTransfer(tx){
	console.log("dodeleteInventoryTransfer filterDataInventoryTransfer=" + filterDataInventoryTransfer);
	tx.executeSql('DELETE FROM paymentAppliedTo where id_payment=?',[filterDataInventoryTransfer+""]);
	tx.executeSql('DELETE FROM payment where id_payment = ?',[filterDataInventoryTransfer+""]);
}

function domarkToSyncInventoryTransfer(tx){
	logZoe ("domarkToSyncInventoryTransfer datafiler=" + filterDataInventoryTransfer);
	tx.executeSql("UPDATE payment SET needSync=1, zoeUpdateDate=datetime('now', 'localtime') where id_payment = ?",[filterDataInventoryTransfer+""]);
}

function doMarkSynchorinizedInventoryTransfer(tx){
	tx.executeSql("UPDATE payment SET needSync=0, zoeSyncDate=datetime('now', 'localtime') where id_payment = ?",[filterDataInventoryTransfer+""]);
}

