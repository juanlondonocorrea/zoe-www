// JavaScript Document


function onMobileinit() {
	logZoe('INICIO');
	checkDatabase();

}

            var db2;
function checkDatabase(){
	
	logZoe("checkDatabase");
	db2 = window.openDatabase("Database", "1.0", "Zoe Database", 2*1024*1024);
	db2.transaction(createDB, errorCB, successCB);
}

function createDB(tx) {
// var	sqlCreate1 = 'DROP TABLE salesrep';
//	tx.executeSql(sqlCreate1,[],nullHandler,errorHandler);
var	sqlCreate2 = 'CREATE TABLE IF NOT EXISTS salesrep (id_salesrep TEXT NOT NULL, Name TEXT NOT NULL, Password TEXT NOT NULL, isActive INTEGER NOT NULL, SyincTime NUMERIC NOT NULL, CONSTRAINT Key2 PRIMARY KEY (id_salesrep), CONSTRAINT id_salesrep UNIQUE (id_salesrep) )';
tx.executeSql(sqlCreate2,[],nullHandler,errorHandler);
logZoe("sqlCreate: "+sqlCreate2);

tx.executeSql('INSERT INTO salesrep (id_salesrep, Name, Password, isActive, SyincTime) VALUES (1,"JuanC","jcsh",1,11)',null,renderList);
tx.executeSql('INSERT INTO salesrep (id_salesrep, Name, Password, isActive, SyincTime) VALUES (2,"JuanF","jflc",1,22)',null,renderList);
logZoe("insert"); 

$.mobile.changePage( "#page2", { reverse: false, transition: "slide" } );
}

			function errorHandler(transaction, error) {
            logZoe('Error: ' + error.message + ' code: ' + error.code);
			}
            
			function nullHandler(){};
			
// created/openned
/* db2.transaction(function(tx){
    tx.executeSql(sqlCreate,[],nullHandler,errorHandler);
 },errorHandler,successCallBack);
*/
         
            function errorCB(err) {

                logZoe("Error processing SQL: "+err.code + ":" + err.message);
            }
			
			function errorHandler(transaction, error) {
            logZoe('Error: ' + error.message + ' code: ' + error.code);
			}
            
			function nullHandler(){};
		 
            function successCB() {
               logZoe("YEAH!!!!");
			}
         
            function insertSalesRep(tx) {
				var _id_salesrep = 2; // $("[name='code']").val();
                var _Name        = 'Lisa';// $("[name='name']").val();
                var _Password    = 'abcdefg';// $("[name='password']").val();
                var _isActive    = 0; // $("[name='active']").val();
                var _SyincTime   = 2222; // $("[name='syncronize time']").val();
				logZoe("INSERT: ");
				logZoe("_id_salesrep: "+_id_salesrep);
				logZoe("_Name: "+_Name);
				logZoe("_Password: "+_Password);
				logZoe("_isActive: "+_isActive);
				logZoe("_SyincTime: "+_SyincTime);
				logZoe("_Name: "+_Name); 
                //SQLInsert
				//tx.executeSql('INSERT INTO salesrep (id_salesrep, Name, Password, isActive, SyincTime) VALUES (11,aa,a1a1,1,11)', [], sucessQueryDB, errorCB);
				
				//tx.executeSql('INSERT INTO salesrep (id_salesrep, Name, Password, isActive, SyincTime) VALUES (?,?,?,?,?)', [_id_salesrep,_Name,_Password,_isActive,_SyincTime], sucessQueryDB, errorCB);
				//tx.executeSql('insert into People(id, name, age) values (?,?,?)', [1, "Marujita", 105]);
				//tx.executeSql('SELECT * FROM salesrep', [], renderList, errorCB);
 				logZoe();
            }
			
         
            function sucessQueryDB(tx) { 
				logZoe("Success: ");    
                tx.executeSql('SELECT * FROM salesrep', [], renderList, errorCB);
            }
         
            function renderList(tx,results) {
                var htmlstring = '';
                 
                var len = results.rows.length;
                 
                for (var i=0; i<len; i++){
                    htmlstring += '<li>' + results.rows.item(i).title + '</li>';
                     
                }

				logZoe("htmlstring: "+htmlstring); 
               // $('#resultList').html(htmlstring);
                //$('#resultList').listview('refresh');
                 
                 
            }
 
            function submitForm() {
				db2.transaction(insertSalesRep, errorCB);
                $.mobile.changePage( "#page2", { reverse: false, transition: "slide" } );
                return false;
            }
						