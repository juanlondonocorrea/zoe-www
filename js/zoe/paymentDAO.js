// JavaScript Document

var paymentDAO = {
				getById: getPaymentById, 
				listByCustomer:listPaymentsByCustomer,
				PaymentsByCustomerDateRange:listPaymentsByCustomerDateRange,
				listToUpload:listPaymentsToUpload,
				getById:getPaymentById, 
				store:storePayment, 
				deleteAll:deleteAllPayments, 
				delete:deletePayment, 
				markToSync:markToSyncPayment, 
				markSynchronized:doMarkSynchorinizedPayment,
				generateRefNum:doGenerateRefNum
			};
var filterDataPayment;
var paymentReceiveFunction;
var paymentReceiveListFunction;
var paymentErrFunc;
var paymentVO;
var recordPayment;
var includePaymentDetails;

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

function getPaymentById(aId,includeDetail,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("getPayment db=" + db);
	filterDataPayment=aId;
	paymentReceiveFunction = aReceiveFunction;
	includePaymentDetails = includeDetail;
	paymentErrFunc = aErrFunc;
	db.transaction(doSelectPayment, paymentErrFunc);
}

function listPaymentsByCustomer(customer_ListID, aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listPayments db=" + db);
	paymentReceiveListFunction = aReceiveFunction;
	paymentErrFunc = aErrFunc;
	filterDataPayment = customer_ListID;
	db.transaction(doCustomerPayments, paymentErrFunc);
}

function listPaymentsByCustomerDateRange(initDate, finalDate, aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listPaymentsByCustomerDateRange db=" + db);
	paymentReceiveListFunction = aReceiveFunction;
	paymentErrFunc = aErrFunc;
	filterDataPayment = new Array();
	filterDataPayment = [initDate,finalDate];
	console.log("filterDataPayment: ========> "+filterDataPayment);
	db.transaction(doCustomerPaymentsByDateRange, paymentErrFunc);
}

function listPaymentsToUpload(aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listPaymentsToUpload db=" + db);
	paymentReceiveListFunction = aReceiveFunction;
	paymentErrFunc = aErrFunc;
	db.transaction(doListPaymentsToUpload, paymentErrFunc);
}

function storePayment(records,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("storePayment db=" + db);
	recordPayment = records;
	paymentErrFunc = aErrFunc;
	db.transaction(doStorePayment, errorCB, successCB);
}

function deleteAllPayments(aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteAllPayment db=" + db);
	paymentErrFunc = aErrFunc;
	db.transaction(doDeleteAllPayments, errorCB, successCB);
}

function deletePayment(idPayment,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deletePayment db=" + db);
	filterDataPayment = idPayment;
	paymentErrFunc = aErrFunc;
	db.transaction(doDeletePayment, errorCB, successCB);
}

function markToSyncPayment(id_payment,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("markToSyncPayment db=" + db);
	customerErrFunc = aErrFunc;
	filterDataPayment = id_payment;
	db.transaction(doMarkToSyncPayment, errorCB, successCB);
}

//----------------------
//metodos privados
//----------------------

function doSelectPayment(tx){
	logZoe("doSelectPayment filterData=" + filterDataPayment);
	tx.executeSql("SELECT * FROM payment WHERE payment.id_payment = ?", [filterDataPayment],paymentLocalReceiveFunction, paymentErrFunc);
}

function doListPaymentsToUpload(tx){
	var selectStr = "SELECT payment.*, payment_item.*, inventorySite_ListID, customer.FullName as companyName " +
	"FROM payment LEFT JOIN payment_item ON payment.id_payment = payment_item.id_payment " +
	"LEFT JOIN inventory ON payment_item.inventory_ListID = inventory.ListID " +
	"LEFT JOIN customer ON customer.ListID = payment.ListID WHERE payment.needSync = 1";
	logZoe("doListPaymentsToUpload select= " + selectStr);
	tx.executeSql(selectStr,[], paymentLocalListToUploadReceiveFunction, paymentErrFunc);
 }


function doCustomerPayments(tx){
	logZoe("doSelectSelesrepPayments");
	tx.executeSql("SELECT * FROM payment WHERE ListID = ?", [filterDataPayment],paymentLocalListReceiveFunction, paymentErrFunc);
}

function doCustomerPaymentsByDateRange(tx){
	logZoe("doCustomerPaymentsByDateRange ========");
	strPayments = " SELECT TxnDate, customer.FullName AS Full_Name, refNumber, TotalAmount, PaymentMethod.Name AS PaymentMethod_Name "+
				  " FROM Payment "+
				  " LEFT JOIN customer ON customer.ListID = payment.ListID "+
				  " LEFT JOIN PaymentMethod ON PaymentMethod.ListID = Payment.paymentsMethod_ListID "+
				  " WHERE TxnDate BETWEEN ? AND ? "+
				  " ORDER BY TxnDate ASC";
	logZoe("strPayments ========"+strPayments);
	tx.executeSql(strPayments, filterDataPayment,paymentLocalListReceiveFunction, paymentErrFunc);
}

function paymentLocalReceiveFunction(tx,results){
	console.log("paymentLocalReceiveFunction includePaymentDetails=" + includePaymentDetails);
	console.log("paymentLocalReceiveFunction results.rows=" + results.rows);
	console.log("paymentLocalReceiveFunction results.rows.length=" + results.rows.length);
	if (results.rows.length>0){
		paymentVO=results.rows.item(0);
			if (includePaymentDetails){
					tx.executeSql("SELECT pat.*, invoice.*"+
					" FROM paymentAppliedTo pat LEFT JOIN invoice ON pat.txnID = invoice.id_invoice " +
					" Where id_payment = ?", [filterDataPayment],paymentItemsLocalReceiveFunction, paymentLocalErrFunc);
			}else{
				paymentReceiveFunction(paymentVO);
			}
	}
	logZoe("localReceiveFunction fin");
}

function paymentLocalErrFunc(tx, err){
	console.log("paymentLocalErrFunc error: " + JSON.stringify(err));
	paymentErrFunc(err);
}

function paymentItemsLocalReceiveFunction(tx,results){
	console.log("paymentItemsLocalReceiveFunction 1");
	console.log("paymentItemsLocalReceiveFunction results = " + results);
	console.log("paymentItemsLocalReceiveFunction results.rows" + results.rows);
	if (results && results.rows){
		console.log("paymentItemsLocalReceiveFunction results.rows.length = " + results.rows.length);
	}
	if (results && results.rows && results.rows.length>0){
		paymentVO.items=new Array();
		var i;
		for (i = 0; i<results.rows.length; i++){
			console.log("paymentItemsLocalReceiveFunction lastItem=" + results.rows.item(i));
			paymentVO.items[i] = results.rows.item(i);
		}
	}
	console.log("paymentItemsLocalReceiveFunction fin paymentVO=" +  JSON.stringify(paymentVO));
	paymentReceiveFunction(paymentVO);
}

function paymentLocalListReceiveFunction(tx,results){
	logZoe("paymentLocalListReceiveFunction results=" + results);
	logZoe("paymentLocalListReceiveFunction results.rows=" + results.rows);
	logZoe("paymentLocalListReceiveFunction results.length=" + results.rows.length);
	var i;
	arrayPayments = new Array();
	for (i=0;i<results.rows.length;i++){
	logZoe("paymentLocalListReceiveFunction " + JSON.stringify(results.rows.item(i)));
		arrayPayments[i] = results.rows.item(i);
	}
	paymentReceiveListFunction(arrayPayments);
}


function doGetPaymentItems(tx){
	currentI += 1;
	if (currentI<arrayPayments.length){
		var currentPayment = arrayPayments[i];
		tx.executeSql("SELECT LineID, id_payment, Inventory_ListID, Desc, Quantity, Rate, Amount, SalesTax_ListID FROM payment_item Where id_payment = ?", [currentPayment.id_payment+""],paymentItemLocalReceiveFunction, paymentErrFunc);
	}
}

function paymentItemLocalReceiveFunction(tx,results){

}

function doStorePayment(tx){
	logZoe ("doStorePayment ");
	if (recordPayment.length){
		var i;
		for (i=0;i<recordPayment.length;i++){
			var theRecord = recordPayment[i];
			logZoe("store payment:" + JSON.stringify(theRecord));
			doStoreOnePayment(tx, theRecord);
		}
	}else{
			doStoreOnePayment(tx, recordPayment);
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

function doDeleteAllPayments(tx){
	tx.executeSql('DELETE FROM paymentAppliedTo',[]);
	tx.executeSql('DELETE FROM payment',[]);
}

function doDeletePayment(tx){
	console.log("doDeletePayment filterDataPayment=" + filterDataPayment);
	tx.executeSql('DELETE FROM paymentAppliedTo where id_payment=?',[filterDataPayment+""]);
	tx.executeSql('DELETE FROM payment where id_payment = ?',[filterDataPayment+""]);
}

function doMarkToSyncPayment(tx){
	logZoe ("doMarkToSyncPayment datafiler=" + filterDataPayment);
	tx.executeSql("UPDATE payment SET needSync=1, zoeUpdateDate=datetime('now', 'localtime') where id_payment = ?",[filterDataPayment+""]);
}

function doMarkSynchorinizedPayment(tx){
	tx.executeSql("UPDATE payment SET needSync=0, zoeSyncDate=datetime('now', 'localtime') where id_payment = ?",[filterDataPayment+""]);
}

