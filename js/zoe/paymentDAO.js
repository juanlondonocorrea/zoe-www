// JavaScript Document

var paymentDAO = {
				getById: getPaymentById, 
				listByCustomer:listPaymentsByCustomer,
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
	tx.executeSql("SELECT id_payment, ListID, po_number, txnDate, dueDate, appliedAmount, balanceRemaining, billAddress_addr1, billAddress_addr2, billAddress_addr3, billAddress_city, billAddress_state, billAddress_postalcode, shipAddress_addr1, shipAddress_addr2, shipAddress_addr3, shipAddress_city, shipAddress_state, shipAddress_postalcode, isPaid, isPending, refNumber, salesTaxPercentage, salesTaxTotal, shipDate, subtotal, id_term, id_salesrep, customerMsg_ListID, memo, origin, signature, signaturePNG, photo FROM payment WHERE ListID = ?", [filterDataPayment],paymentLocalListReceiveFunction, paymentErrFunc);
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
		tx.executeSql('INSERT OR REPLACE INTO payment(id_payment, ListID, po_number, txnDate, dueDate, appliedAmount, balanceRemaining, billAddress_addr1, billAddress_addr2, billAddress_addr3, billAddress_city, billAddress_state, billAddress_postalcode, shipAddress_addr1, shipAddress_addr2, shipAddress_addr3, shipAddress_city, shipAddress_state, shipAddress_postalcode, isPaid, isPending, refNumber, salesTaxPercentage, salesTaxTotal, shipDate, subtotal, id_term, id_salesrep, customerMsg_ListID, memo, signature,signaturePNG,  photo, origin) ' +
		' values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?,?,?, ?, ?)',
		[rec.id_payment, rec.ListID, ifUndefNull(rec.po_number)+"", ifUndefNull(rec.txnDate), 
		ifUndefNull(rec.dueDate), ifUndefNull(rec.appliedAmount), ifUndefNull(rec.balanceRemaining), 
		ifUndefNull(rec.billAddress_addr1), ifUndefNull(rec.billAddress_addr2), 
		ifUndefNull(rec.billAddress_addr3), ifUndefNull(rec.billAddress_city), 
		ifUndefNull(rec.billAddress_state), ifUndefNull(rec.billAddress_postalcode), 
		ifUndefNull(rec.shipAddress_addr1), ifUndefNull(rec.shipAddress_addr2), 
		ifUndefNull(rec.shipAddress_addr3), ifUndefNull(rec.shipAddress_city), 
		ifUndefNull(rec.shipAddress_state), ifUndefNull(rec.shipAddress_postalcode), 
		ifUndefNull(rec.isPaid), ifUndefNull(rec.isPending), ifUndefNull(rec.refNumber)+"", 
		ifUndefNull(rec.TaxPercentage), ifUndefNull(rec.salesTaxTotal), ifUndefNull(rec.shipDate), 
		ifUndefNull(rec.subtotal), ifUndefNull(rec.id_term), ifUndefNull(rec.id_salesrep), 
		ifUndefNull(rec.customerMsg_ListID), ifUndefNull(rec.memo), ifUndefNull(rec.signature), 
		ifUndefNull(rec.signaturePNG), ifUndefNull(rec.photo), ifUndefNull(rec.origin)] );
		
	 if (rec.items){
	 	console.log("storing payment items")
		 for (var i=0;i<rec.items.length;i++){
			 var item = rec.items[i];
			 console.log("item=" + JSON.stringify(item));
			 console.log("elementos=" + JSON.stringify([item.LineID,rec.id_payment,item.Inventory_ListID,item.Desc,item.Quantity,item.Rate,item.Amount,item.salesTax_ListID]));
			 tx.executeSql('INSERT INTO payment_item(LineID,id_payment,Inventory_ListID,Desc,Quantity,Rate,Amount,SalesTax_ListID) '+
			 ' VALUES(?,?,?,?,?,?,?,?)',
			 [item.LineID,rec.id_payment,ifUndefNull(item.Inventory_ListID),ifUndefNull(item.Desc),ifUndefNull(item.Quantity),
			 ifUndefNull(item.Rate),ifUndefNull(item.Amount),ifUndefNull(item.salesTax_ListID)]);
		 }
	 }
}

function doDeleteAllPayments(tx){
	tx.executeSql('DELETE FROM payment_item',[]);
	tx.executeSql('DELETE FROM payment',[]);
}

function doDeletePayment(tx){
	console.log("doDeletePayment filterDataPayment=" + filterDataPayment);
	tx.executeSql('DELETE FROM payment_item where id_payment=?',[filterDataPayment+""]);
	tx.executeSql('DELETE FROM payment where id_payment = ?',[filterDataPayment+""]);
}

function doMarkToSyncPayment(tx){
	logZoe ("doMarkToSyncPayment datafiler=" + filterDataPayment);
	tx.executeSql("UPDATE payment SET needSync=1, zoeUpdateDate=datetime('now', 'localtime') where id_payment = ?",[filterDataPayment+""]);
}

function doMarkSynchorinizedPayment(tx){
	tx.executeSql("UPDATE payment SET needSync=0, zoeSyncDate=datetime('now', 'localtime') where id_payment = ?",[filterDataPayment+""]);
}

function doStorePaymentPhoto(tx){
	logZoe ("doStorePaymentPhoto record=" + JSON.stringify(recordPayment));
	tx.executeSql("UPDATE payment SET photo=? where id_payment = ?",[recordPayment.photo, recordPayment.id_payment+""]);
}
