// JavaScript Document

var creditMemoDAO = {listBySalesrep:listCreditMemosBySalesrep, 
				listByCustomer:listCreditMemosByCustomer,
				listToUpload:listCreditMemosToUpload,
				getById:getCreditMemoById, 
				store:storeCreditMemo, 
				deleteAll:deleteAllCreditMemos, 
				delete:deleteCreditMemo, 
				markToSync:markToSyncCreditMemo, 
				markSynchronized:doMarkSynchorinizedCreditMemo,
				generateRefNum:doGenerateRefNum
			};
var filterDataCreditMemo;
var creditMemoReceiveFunction;
var creditMemoReceiveListFunction;
var creditMemoErrFunc;
var creditMemoVO;
var recordCreditMemo;
var includeCreditMemoDetails;


//----------------------
//metodos hacia afuera
//----------------------

function doGenerateRefNum(prefix){
	var date = new Date();
	var toReturn = prefix + (date.getFullYear()+"").substring(2) + "" + (date.getMonth()+1) + "" + date.getDate();
	var plantilla = 'xxxxxxxxxxx'.substring(toReturn.length);
	toReturn += plantilla.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    toReturn = toReturn.toUpperCase();
	return toReturn;
}

function getCreditMemoById(aId,includeDetail,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("getCreditMemo db=" + db);
	filterDataCreditMemo=aId;
	creditMemoReceiveFunction = aReceiveFunction;
	includeCreditMemoDetails = includeDetail;
	creditMemoErrFunc = aErrFunc;
	db.transaction(doSelectCreditMemo, creditMemoErrFunc);
}

function listCreditMemosBySalesrep(salesrep_ListID, aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listCreditMemos db=" + db);
	creditMemoReceiveListFunction = aReceiveFunction;
	creditMemoErrFunc = aErrFunc;
	filterDataCreditMemo = salesrep_ListID;
	db.transaction(doSalesrepCreditMemos, creditMemoErrFunc);
}

function listCreditMemosByCustomer(customer_ListID, aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listCreditMemos db=" + db);
	creditMemoReceiveListFunction = aReceiveFunction;
	creditMemoErrFunc = aErrFunc;
	filterDataCreditMemo = customer_ListID;
	db.transaction(doCustomerCreditMemos, creditMemoErrFunc);
}

function listCreditMemosToUpload(aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listCreditMemosToUpload db=" + db);
	creditMemoReceiveListFunction = aReceiveFunction;
	creditMemoErrFunc = aErrFunc;
	db.transaction(doListCreditMemosToUpload, creditMemoErrFunc);
}

function storeCreditMemo(records,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("storeCreditMemo db=" + db);
	recordCreditMemo = records;
	creditMemoErrFunc = aErrFunc;
	db.transaction(doStoreCreditMemo, errorCB, successCB);
}

function deleteAllCreditMemos(aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteAllCreditMemo db=" + db);
	creditMemoErrFunc = aErrFunc;
	db.transaction(doDeleteAllCreditMemos, errorCB, successCB);
}

function deleteCreditMemo(idCreditMemo,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteCreditMemo db=" + db);
	filterDataCreditMemo = idCreditMemo;
	creditMemoErrFunc = aErrFunc;
	db.transaction(doDeleteCreditMemo, errorCB, successCB);
}

function markToSyncCreditMemo(id_creditMemo,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("markToSyncCreditMemo db=" + db);
	customerErrFunc = aErrFunc;
	filterDataCreditMemo = id_creditMemo;
	db.transaction(doMarkToSyncCreditMemo, errorCB, successCB);
}

function markSynchronizedCustomer(id_creditMemo,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("markToSyncCreditMemo db=" + db);
	customerErrFunc = aErrFunc;
	filterDataCreditMemo = id_creditMemo;
	db.transaction(doMarkToSynchronizedCreditMemo, errorCB, successCB);
}


//----------------------
//metodos privados
//----------------------

function doSelectCreditMemo(tx){
	logZoe("doSelectCreditMemo filterData=" + filterDataCreditMemo);
	tx.executeSql("SELECT creditMemo.*, term.name AS term_name, cm.FullName as customer_msg_FullName,  " +
	" salesrep.Name as salesrep_Name, customer.companyName as customer_companyName,  " +
	" vendor.Name as vendor_name , vendor.addr1 as vendor_addr1, vendor.addr2 as vendor_addr2," +
	" vendor.addr3 as vendor_addr3 , vendor.city as vendor_city, vendor.state as vendor_state," +
	" vendor.country as vendor_country " +
	" FROM creditMemo " +
	" LEFT JOIN salesrep ON salesrep.id_salesrep = creditMemo.id_salesrep " +
	" LEFT JOIN customer ON customer.ListID = creditMemo.ListID " +
	" LEFT JOIN vendor ON vendor.ListID = customer.vendor_ListID " +
	" LEFT JOIN term ON term.id_term = creditMemo.id_term " +
	" LEFT JOIN customer_msg as cm ON cm.ListID = creditMemo.customerMsg_ListID " +
	" WHERE creditMemo.id_creditMemo = ?", [filterDataCreditMemo],creditMemoLocalReceiveFunction, creditMemoErrFunc);
}

function doSalesrepCreditMemos(tx){
	logZoe("doSelectSelesrepCreditMemos");
	tx.executeSql("SELECT id_creditMemo, ListID, po_number, txnDate, dueDate, appliedAmount, balanceRemaining, billAddress_addr1, billAddress_addr2, billAddress_addr3, billAddress_city, billAddress_state, billAddress_postalcode, shipAddress_addr1, shipAddress_addr2, shipAddress_addr3, shipAddress_city, shipAddress_state, shipAddress_postalcode, isPaid, isPending, refNumber, salesTaxPercentage, salesTaxTotal, shipDate, subtotal, id_term,id_salesrep, customerMsg_ListID, memo, origin, class_ListID FROM creditMemo WHERE id_salesrep = ?", [filterDataCreditMemo],creditMemoLocalListReceiveFunction, creditMemoErrFunc);
}

function doListCreditMemosToUpload(tx){
	logZoe("doListCreditMemosToUpload");
	tx.executeSql("SELECT creditMemo.*, creditMemo_item.*, inventorySite_ListID FROM creditMemo LEFT JOIN creditMemo_item ON creditMemo.id_creditMemo = creditMemo_item.id_creditMemo " +
	"LEFT JOIN inventory ON creditMemo_item.inventory_ListID = inventory.ListID  WHERE needSync = 1",[], creditMemoLocalListToUploadReceiveFunction, creditMemoErrFunc);
 }


function doCustomerCreditMemos(tx){
	logZoe("doSelectSelesrepCreditMemos");
	tx.executeSql("SELECT id_creditMemo, ListID, po_number, txnDate, dueDate, appliedAmount, balanceRemaining, billAddress_addr1, billAddress_addr2, billAddress_addr3, billAddress_city, billAddress_state, billAddress_postalcode, shipAddress_addr1, shipAddress_addr2, shipAddress_addr3, shipAddress_city, shipAddress_state, shipAddress_postalcode, isPaid, isPending, refNumber, salesTaxPercentage, salesTaxTotal, shipDate, subtotal, id_term, id_salesrep, customerMsg_ListID, memo, origin FROM creditMemo WHERE ListID = ?", [filterDataCreditMemo],creditMemoLocalListReceiveFunction, creditMemoErrFunc);
}

function creditMemoLocalReceiveFunction(tx,results){
	console.log("creditMemoLocalReceiveFunction includeCreditMemoDetails=" + includeCreditMemoDetails);
	console.log("creditMemoLocalReceiveFunction results.rows=" + results.rows);
	console.log("creditMemoLocalReceiveFunction results.rows.length=" + results.rows.length);
	if (results.rows.length>0){
		creditMemoVO=results.rows.item(0);
			if (includeCreditMemoDetails){
					tx.executeSql("SELECT LineID, id_creditMemo, Inventory_ListID, creditMemo_item.Desc, " +
					" Quantity, Rate, Amount, creditMemo_item.SalesTax_ListID, salesTax.Name as salesTax_Name, class.Name as class_Name, inventory.FullName as Inventory_FullName"+
					" FROM creditMemo_item " +
					" LEFT JOIN salesTax ON salesTax.ListID = creditMemo_item.SalesTax_ListID LEFT JOIN class ON class.ListID = creditMemo_item.class_ListID " +
					" LEFT JOIN inventory ON inventory.ListID = creditMemo_item.inventory_ListID "+
					" Where id_creditMemo = ?", [filterDataCreditMemo],creditMemoItemsLocalReceiveFunction, creditMemoLocalErrFunc);
			}else{
				creditMemoReceiveFunction(creditMemoVO);
			}
	}
	logZoe("localReceiveFunction fin");
}

function creditMemoLocalErrFunc(tx, err){
	console.log("creditMemoLocalErrFunc error: " + JSON.stringify(err));
	creditMemoErrFunc(err);
}

function creditMemoItemsLocalReceiveFunction(tx,results){
	console.log("creditMemoItemsLocalReceiveFunction 1");
	console.log("creditMemoItemsLocalReceiveFunction results = " + results);
	console.log("creditMemoItemsLocalReceiveFunction results.rows" + results.rows);
	if (results && results.rows){
		console.log("creditMemoItemsLocalReceiveFunction results.rows.length = " + results.rows.length);
	}
	if (results && results.rows && results.rows.length>0){
		creditMemoVO.items=new Array();
		var i;
		for (i = 0; i<results.rows.length; i++){
			console.log("creditMemoItemsLocalReceiveFunction lastItem=" + results.rows.item(i));
			creditMemoVO.items[i] = results.rows.item(i);
		}
	}
	console.log("creditMemoItemsLocalReceiveFunction fin creditMemoVO=" +  JSON.stringify(creditMemoVO));
	creditMemoReceiveFunction(creditMemoVO);
}

function creditMemoLocalListReceiveFunction(tx,results){
	logZoe("creditMemoLocalListReceiveFunction results=" + results);
	logZoe("creditMemoLocalListReceiveFunction results.rows=" + results.rows);
	logZoe("creditMemoLocalListReceiveFunction results.length=" + results.rows.length);
	var i;
	arrayCreditMemos = new Array();
	for (i=0;i<results.rows.length;i++){
	logZoe("creditMemoLocalListReceiveFunction " + JSON.stringify(results.rows.item(i)));
		arrayCreditMemos[i] = results.rows.item(i);
		creditMemoReceiveListFunction(arrayCreditMemos);
	}
}

function creditMemoLocalListToUploadReceiveFunction(tx,results){
	logZoe("creditMemoLocalListToUploadReceiveFunction results.length=" + results.rows.length);
	var i;
	var indexCreditMemo=-1;
	var indexItem=0;
	var id_creditMemo_ant = "0";
	var arrayCreditMemos = new Array();
	var creditMemoVO;
	for (i=0;i<results.rows.length;i++){
		var rec = results.rows.item(i)
		logZoe("creditMemoLocalListToUploadReceiveFunction " + JSON.stringify(rec));
		if (id_creditMemo_ant != rec.id_creditMemo){
			indexCreditMemo += 1;
			indexItem = 0;
			creditMemoVO = {
				id_creditMemo: rec.id_creditMemo,
				ListID: rec.ListID,
				po_number: rec.po_number,
				dueDate: rec.dueDate,
				txnDate: rec.txnDate,
				appliedAmount: rec.appliedAmount,
				balanceRemaining: rec.balanceRemaining,
				billAddress_addr1: rec.billAddress_addr1,
				billAddress_addr2: rec.billAddress_addr2,
				billAddress_city: rec.billAddress_city,
				billAddress_state: rec.billAddress_state,
				billAddress_postalcode: rec.billAddress_postalcode,
				shipAddress_addr1: rec.shipAddress_addr1,
				shipAddress_addr2: rec.shipAddress_addr2,
				shipAddress_city: rec.shipAddress_city,
				shipAddress_state: rec.shipAddress_state,
				shipAddress_postalcode: rec.shipAddress_postalcode,
				isPaid: rec.isPaid,
				isPending: rec.isPending,
				refNumber: rec.refNumber,
				salesTaxPercentage: rec.salesTaxPercentage,
				salesTaxTotal: rec.salesTaxTotal,
				shipDate: rec.shipDate,
				subtotal: rec.subtotal,
				id_term: rec.id_term,
				billAddress_addr3: rec.billAddress_addr3,
				shipAddress_addr3: rec.shipAddress_addr3,
				zoeUpdateDate: rec.zoeUpdateDate,
				zoeSycDate: rec.zoeSycDate,
				needSync: rec.needSync,
				origin: rec.origin,
				id_salesrep: rec.id_salesrep,
				customerMsg_ListID: rec.customerMsg_ListID,
				memo: rec.memo,
				items: new Array()
			}
			arrayCreditMemos[indexCreditMemo] = creditMemoVO;
		}

		var creditMemoItemVO = {
			  	LineID:rec.LineID,
  				id_creditMemo:rec.id_creditMemo,
				Inventory_ListID:rec.Inventory_ListID,
				InventorySite_ListID:rec.InventorySite_ListID,
				Desc:rec.Desc,
				Quantity:rec.Quantity,
				Rate:rec.Rate,
				Amount:rec.Amount,
				SalesTax_ListID:rec.SalesTax_ListID,
				class_ListID:rec.class_ListID
		}

		creditMemoVO.items[indexItem] = creditMemoItemVO;
		indexItem +=1;
		id_creditMemo_ant = rec.id_creditMemo;
	}
	console.log("arrayCreditMemos=" + JSON.stringify(arrayCreditMemos));
	creditMemoReceiveListFunction(arrayCreditMemos);
}



function doGetCreditMemoItems(tx){
	currentI += 1;
	if (currentI<arrayCreditMemos.length){
		var currentCreditMemo = arrayCreditMemos[i];
		tx.executeSql("SELECT LineID, id_creditMemo, Inventory_ListID, Desc, Quantity, Rate, Amount, SalesTax_ListID, class_ListID FROM creditMemo_item Where id_creditMemo = ?", [currentCreditMemo.id_creditMemo],creditMemoItemLocalReceiveFunction, creditMemoErrFunc);
	}
}

function creditMemoItemLocalReceiveFunction(tx,results){

}

function doStoreCreditMemo(tx){
	logZoe ("doStoreCreditMemo ");
	if (recordCreditMemo.length){
		var i;
		for (i=0;i<recordCreditMemo.length;i++){
			var theRecord = recordCreditMemo[i];
			logZoe("store creditMemo:" + JSON.stringify(theRecord));
			doStoreOneCreditMemo(tx, theRecord);
		}
	}else{
			doStoreOneCreditMemo(tx, recordCreditMemo);
	}
	
}

function doStoreOneCreditMemo(tx, rec){
		tx.executeSql('INSERT OR REPLACE INTO creditMemo(id_creditMemo, ListID, po_number, txnDate, dueDate, appliedAmount, balanceRemaining, billAddress_addr1, billAddress_addr2, billAddress_addr3, billAddress_city, billAddress_state, billAddress_postalcode, shipAddress_addr1, shipAddress_addr2, shipAddress_addr3, shipAddress_city, shipAddress_state, shipAddress_postalcode, isPaid, isPending, refNumber, salesTaxPercentage, salesTaxTotal, shipDate, subtotal, id_term, id_salesrep, customerMsg_ListID, memo, origin) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ?, ?, ?, ?)',[rec.id_creditMemo, rec.ListID, ifUndefNull(rec.po_number), ifUndefNull(rec.txnDate), ifUndefNull(rec.dueDate), ifUndefNull(rec.appliedAmount), ifUndefNull(rec.balanceRemaining), ifUndefNull(rec.billAddress_addr1), ifUndefNull(rec.billAddress_addr2), ifUndefNull(rec.billAddress_addr3), ifUndefNull(rec.billAddress_city), ifUndefNull(rec.billAddress_state), ifUndefNull(rec.billAddress_postalcode), ifUndefNull(rec.shipAddress_addr1), ifUndefNull(rec.shipAddress_addr2), ifUndefNull(rec.shipAddress_addr3), ifUndefNull(rec.shipAddress_city), ifUndefNull(rec.shipAddress_state), ifUndefNull(rec.shipAddress_postalcode), ifUndefNull(rec.isPaid), ifUndefNull(rec.isPending), ifUndefNull(rec.refNumber), ifUndefNull(rec.TaxPercentage), ifUndefNull(rec.salesTaxTotal), ifUndefNull(rec.shipDate), ifUndefNull(rec.subtotal), ifUndefNull(rec.id_term), ifUndefNull(rec.id_salesrep), ifUndefNull(rec.customerMsg_ListID), ifUndefNull(rec.memo), ifUndefNull(rec.origin)] );
		
	
	 if (rec.items){
	 	console.log("storing creditMemo items")
		 for (var i=0;i<rec.items.length;i++){
			 var item = rec.items[i];
			 console.log("item=" + JSON.stringify(item));
			 console.log("elementos=" + JSON.stringify([item.LineID,rec.id_creditMemo,item.Inventory_ListID,item.Desc,item.Quantity,item.Rate,item.Amount,item.salesTax_ListID]));
			 tx.executeSql('INSERT INTO creditMemo_item(LineID,id_creditMemo,Inventory_ListID,Desc,Quantity,Rate,Amount,SalesTax_ListID, class_ListID) VALUES(?,?,?,?,?,?,?,?,?)',[item.LineID,rec.id_creditMemo,ifUndefNull(item.Inventory_ListID),item.Desc,item.Quantity,item.Rate,item.Amount,ifUndefNull(item.salesTax_ListID),ifUndefNull(item.class_ListID)]);
		 }
	 }
}

function doDeleteAllCreditMemos(tx){
	tx.executeSql('DELETE FROM creditMemo_item',[]);
	tx.executeSql('DELETE FROM creditMemo',[]);
}

function doDeleteCreditMemo(tx){
	tx.executeSql('DELETE FROM creditMemo_item where id_creditMemo=?',[filterDataCreditMemo+""]);
	tx.executeSql('DELETE FROM creditMemo where id_creditMemo = ?',[filterDataCreditMemo+""]);
}

function doMarkToSyncCreditMemo(tx){
	logZoe ("doMarkToSyncCreditMemo datafiler=" + filterDataCreditMemo);
	tx.executeSql("UPDATE creditMemo SET needSync=1, zoeUpdateDate=datetime('now', 'localtime') where id_creditMemo = ?",[filterDataCreditMemo]);
}

function doMarkSynchorinizedCreditMemo(tx){
	tx.executeSql("UPDATE creditMemo SET needSync=0, zoeSyncDate=datetime('now', 'localtime') where id_creditMemo = ?",[filterDataCreditMemo]);
}

