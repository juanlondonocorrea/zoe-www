// JavaScript Document

var termDAO = {list:listTerms, 
				getById:getTermById, 
				store:storeTerm, 
				deleteAll:deleteAllTerms};
var filterDataTerm;
var termReceiveFunction;
var termReceiveListFunction;
var termErrFunc;
var termVO;
var recordTerm;

//----------------------
//metodos hacia afuera
//----------------------
function getTermById(aId,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("getTerm db=" + db);
	filterData=aId;
	termReceiveFunction = aReceiveFunction;
	termErrFunc = aErrFunc;
	db.transaction(doSelectTerm, termErrFunc);
}

function listTerms(aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listTerms db=" + db);
	termReceiveListFunction = aReceiveFunction;
	termErrFunc = aErrFunc;
	db.transaction(doTerms, termErrFunc);
}

function storeTerm(records,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("storeTerm db=" + db);
	recordTerm = records;
	termErrFunc = aErrFunc;
	db.transaction(doStoreTerm, errorCB, successCB);
}

function deleteAllTerms(aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteAllTerms db=" + db);
	termErrFunc = aErrFunc;
	db.transaction(doDeleteAllTerms, errorCB, successCB);
}


//----------------------
//metodos privados
//----------------------

function doSelectTerm(tx){
	logZoe("doSelectTerm filterData=" + filterDataTerm);
	tx.executeSql("SELECT id_term, name, stdDueDays, stdDiscountDays, discountPct FROM term Where id_term = ?", [filterDataTerm],termLocalReceiveFunction, termErrFunc);
}

function doTerms(tx){
	logZoe("doTerms");
	tx.executeSql("SELECT id_term,name, stdDueDays, stdDiscountDays, discountPct FROM term", [],termLocalListReceiveFunction, termErrFunc);
}

function termLocalReceiveFunction(tx,results){
	logZoe("termLocalReceiveFunction results = " + JSON.stringify(results));
	if (results.rows.length>0){
	logZoe("localReceiveFunction1 " + JSON.stringify(results.rows.item(0)));
		termVO=results.rows.item(0);
		termReceiveFunction(termVO);
	}
	logZoe("localReceiveFunction fin");
}

function termLocalListReceiveFunction(tx,results){
	logZoe("termLocalListReceiveFunction results.length=" + results.rows.length);
	var i;
	var arrayTerms = new Array();
	for (i=0;i<results.rows.length;i++){
	logZoe("termLocalListReceiveFunction " + JSON.stringify(results.rows.item(i)));
		arrayTerms[i] = results.rows.item(i);
	}
	termReceiveListFunction(arrayTerms);
}

function doStoreTerm(tx){
	logZoe ("doStoreTerm ");
	if (recordTerm.length){
		var i;
		for (i=0;i<recordTerm.length;i++){
			var theRecord = recordTerm[i];
			logZoe("store term:" + JSON.stringify(theRecord));
			doStoreOneTerm(tx, theRecord);
		}
	}else{
			doStoreOneTerm(tx, recordTerm);
	}
	
}

function doStoreOneTerm(tx, rec){
	tx.executeSql('INSERT OR REPLACE INTO term(id_term, name, stdDueDays, stdDiscountDays, discountPct) values (?,?,?,?,?)',[rec.id_term, rec.name, rec.stdDueDays, rec.stdDiscountDays, rec.discountPct]);
}

function doDeleteAllTerms(tx){
	tx.executeSql('DELETE FROM term',[]);
}
