// JavaScript Document
var synchronizing = false;
var xhrSync;
var receiveSyncCallback;
function consumeWS(mensaje, format, receiveFunction, cache, xpathExp){
	receiveSyncCallback = receiveFunction;
	if (synchronizing==true){
		alert("Synchronizing in process");
		return;
	}
	log("consumeWS1"); 

	synchronizing = true;
	
//	$( "#synchDialog" ).popup( "open" );
//	$( "#synchDialog" ).on( "popupafterclose", cancelSynch );
	
//    var webServiceURL = 'http://24.234.187.107:54320/SyncService';
//    var webServiceURL = 'http://192.168.88.103:54320/SyncService';
	
    var webServiceURL = window.localStorage.getItem("syncURL");

	log("consumeWS2 webServiceURL=" + webServiceURL); 

	$.support.cors = true;
	
	var dataToSend = "{synch:{uploadOperations:'"+mensaje+"',responseFormat:'"+format+"'"; 
	
	if (cache){
		dataToSend = dataToSend + ",cache:'" + cache + "'";
	}
	if (xpathExp){
		dataToSend = dataToSend + ",xpathExp:'" + xpathExp + "'";
	}
	
	dataToSend += "}}";
	
	log("consumeWS3 data:" + dataToSend); 
	
    xhrSync = $.ajax({
        type: "POST",
        url: webServiceURL,
		timeout: 120000 ,
		jsonp: "callback",
        data: dataToSend,
        dataType: "text",
        success: recibeSyncResponse
//        error: errSync,
    });



}

function recibeSyncResponse(data, textStatus, jqXHR )
{
	console.log("recibeSyncResponse");
	console.log("synchronizing data:" + data );
	console.log("synchronizing textStatus:" + textStatus );
	console.log("synchronizing jqXHR:" + jqXHR );
	console.log("synchronizing jqXHR.responseText:" + jqXHR.responseText );
	console.log("synchronizing jqXHR.responseText:" + JSON.stringify(jqXHR) );
	if (jqXHR && jqXHR.responseText){		
		console.log("synchronizing EN 1a");
		console.log("synchronizing EN jqXHR json" + JSON.stringify(jqXHR) );
		console.log("synchronizing EN 1b");
		synchronizing = false
//		$( "#synchDialog" ).popup( "close" );
		var jsonStr = 	jqXHR.responseText;
		console.log("synchronizing EN 1c");
		jsonStr = jsonStr.substring(1,jsonStr.length-1);
		console.log("jsonStr="+jsonStr);
		console.log("synchronizing EN 1d");
		var obj = JSON.parse(jsonStr);
		console.log("synchronizing EN 1e");
		if (obj && obj.QBXML){
		console.log("synchronizing EN 1f");
			var msgObj = obj.QBXML.QBXMLMsgsRs;
		console.log("synchronizing EN 1f-1 msgObj=" + msgObj);
			receiveSyncCallback(msgObj);
		}else{
		console.log("synchronizing EN 1g");
			if (obj){
				receiveSyncCallback(obj);
			}else{
				console.log("Synch error: empty response");
				alert("Synch error: empty response");
			}
		}
	}else{
		console.log("synchronizing EN 2");
		console.log("synchronizing por el else json jqXHR:" + JSON.stringify(jqXHR) );
	}
}

function errSync(jqXHR, textStatus)
{
	console.log("en errSync");
	synchronizing = false;
//	$( "#synchDialog" ).popup( "close" );			
	console.log("synchronizing errSync: " + textStatus);              
	console.log("synchronizing error jqXHR: " + JSON.stringify(jqXHR));              
	alert("Synch error: empty response");
}

function log(msg){
	var currTime = Date.now();
	console.log(currTime + " - " + msg);
}

function cancelSynch(){
	if(xhrSync && xhrSync.readyState != 4){
		synchronizing = false;
		xhrSync.abort();
	}
}