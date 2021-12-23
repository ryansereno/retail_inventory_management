function dateIterator(){
  var currentDate = new Date();
  var lastYear = new Date();
  var daysOfYear = [];
  var start = new Date(lastYear.setFullYear(currentDate.getFullYear() -2)); //get date 2 years ago
  for (i = start; i <= currentDate; i.setDate(i.getDate() + 1)) { // iterate through dates of past 2 years
      var interatorDate = new Date(i);
      var reformateDate = interatorDate.getFullYear() + "-" + (interatorDate.getMonth() + 1) + "-" + interatorDate.getDate()  // reformat date to YYYY-MM-DD for api url
      daysOfYear.push(reformateDate);}  // assemble 730 dates into an array
      return daysOfYear
}

function apiCall(apiDate) {
  var headers = {"Authorization" : "Basic " + Utilities.base64Encode("ByDuekpGQ8Uyy73vo1en1QslAvJXqMWCe53VVdyBKXedSuxa" + ':' + "uaQp1cnS3PMSYV6e4ZzXn1ENkE5GzdPdEsuJSpMhkk4clt-c")};
  var params = {"method":"GET","headers":headers};
  var url = "https://api-ca.metrc.com/packages/v1/active?licenseNumber=C10-0000456-LIC&lastModifiedStart=" + apiDate + "T00:01:00Z&lastModifiedEnd=" + apiDate + "T23:59:00Z"
  var response = UrlFetchApp.fetch(url, params);
  var content = response.getContentText();
  var packageList = JSON.parse(content);
  Logger.log(url)
  return packageList;
}

function yearDataCompiler(){
  var app = SpreadsheetApp;
  var ss = app.getActiveSpreadsheet();
  var activeSheetAppender = ss.getSheetByName("Dutton");
  activeSheetAppender.getRange("B2:B").setValue(0)
  for (let i = 200; i <= 731; i++) {
    var dayInventory = apiCall(dateIterator()[i]);
    //Logger.log(dateIterator()[i])
    //Logger.log(dayInventory);
    dayDataAppender(dayInventory)
    Utilities.sleep(500)
    Logger.log("Call number " + i)
  }
}
//yearDataCompiler()

var activeCell    //initialization of active cell variable for dayDataAppender, must be global since function is called multiple times
function dayDataAppender(dayInventory){
  var app = SpreadsheetApp;
  var ss = app.getActiveSpreadsheet();
  var activeSheetAppender = ss.getSheetByName("Dutton");
  try{
    if (dataFilter(dayInventory.Item.Name) == true){
      var productName = dayInventory.Item.Name
      var productQuantity = dayInventory.Quantity
      var productUnit = dayInventory.UnitOfMeasureAbbreviation
      var lastModified = dayInventory.LastModified;
      //activeCell += 1
      //activeSheetAppender.getRange(activeCell+1,1).setValue(productName);
      activeSheetAppender.getRange(activeCell,2).setValue(activeSheetAppender.getRange(activeCell,2).getValue() + productQuantity);
      //activeSheetAppender.getRange(activeCell+1,3).setValue(productUnit);
      //activeSheetAppender.getRange(activeCell+1,4).setValue(lastModified);
      }
    
  }
  
  catch(err){ 
    for (var i = 0; i < dayInventory.length; i++){
      if (dataFilter(dayInventory[i].Item.Name) == true){
        var productName = dayInventory[i].Item.Name
        var productQuantity = dayInventory[i].Quantity
        var productUnit = dayInventory[i].UnitOfMeasureAbbreviation
        var lastModified = dayInventory[i].LastModified;
        //activeCell += 1
        //activeSheetAppender.getRange(activeCell+1,1).setValue(productName);
        activeSheetAppender.getRange(activeCell,2).setValue(activeSheetAppender.getRange(activeCell,2).getValue() + productQuantity);
        //activeSheetAppender.getRange(activeCell+1,3).setValue(productUnit);
        //activeSheetAppender.getRange(activeCell+1,4).setValue(lastModified);
        }
    }
  }
}

//dayDataAppender(apiCall("2021-12-08"));




function dataFilter(itemName){
  var app = SpreadsheetApp;
  var ss = app.getActiveSpreadsheet();
  var activeSheetFilter = ss.getSheetByName("All Store Total");
  for (i = 1; i < 1500; i++){
    if (activeSheetFilter.getRange(i+1,1).getValue().length <= 1){
      break;}
    else{activeCellRead = activeSheetFilter.getRange(i+1,1).getValue();
      //Logger.log(activeCellRead)
      if (itemName == activeCellRead){
        activeCell = i+1
        return true;
        //var app2 = SpreadsheetApp;
        //var ss2 = app2.getActiveSpreadsheet();
        //var activeSheetAppender = ss2.getSheetByName("Dutton");
        //activeSheetAppender.getRange(activeCell+2,1).setValue(itemName)
      }
    }
  }
}
//dataFilter("MG Cartridge 1/2g Durban")