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

function apiCall(apiDate, licenseNumber) {
  var headers = {"Authorization" : "Basic " + Utilities.base64Encode(keys.software + ':' + keys.user)};
  var params = {"method":"GET","headers":headers};
  var url = "https://api-ca.metrc.com/packages/v1/active?licenseNumber=" + licenseNumber + "&lastModifiedStart=" + apiDate + "T00:01:00Z&lastModifiedEnd=" + apiDate + "T23:59:00Z"
  var response = UrlFetchApp.fetch(url, params);
  var content = response.getContentText();
  var packageList = JSON.parse(content);
  Logger.log(url)
  return packageList;
}

function yearDataCompiler(storeName, licenseNumber){
  var app = SpreadsheetApp;
  var ss = app.getActiveSpreadsheet();
  var activeSheetAppender = ss.getSheetByName(storeName);
  activeSheetAppender.getRange("B2:B").setValue(0)
  var itemNamesArray = itemNameArrayCompiler()
  for (let i = 1; i <= 731; i++) {
    var dayInventory = apiCall(dateIterator()[i], licenseNumber);
    dayDataAppender(dayInventory, itemNamesArray, storeName)
    Utilities.sleep(500)
    Logger.log("Call number " + i)
  }
  var today = new Date()
  var dd = today.getDate()
  var mm = today.getMonth() + 1
  var yyyy = today.getFullYear()
  activeSheetAppender.getRange("E1").setValue(mm + '/' + dd + '/' + yyyy)
}
function compileSheet(){
  yearDataCompiler("Dutton", "C10-0000xxx-LIC")
  yearDataCompiler("Haight", "C10-0000xxx-LIC")
  yearDataCompiler("Sebastopol", "C10-0000xxx-LIC")
  //yearDataCompiler("Sonoma", "")            add these in when license numbers are available; add view package permission to the metrc account
  //yearDataCompiler("Polk", "")
  var app = SpreadsheetApp;
  var ss = app.getActiveSpreadsheet();
  var activeSheetAppender = ss.getSheetByName("All Store Total");
  var today = new Date()
  var dd = today.getDate()
  var mm = today.getMonth() + 1
  var yyyy = today.getFullYear()
  activeSheetAppender.getRange("E1").setValue(mm + '/' + dd + '/' + yyyy)
}


var activeCell    //initialization of active cell variable for dayDataAppender, must be global since function is called multiple times
function dayDataAppender(dayInventory, itemNamesArray, storeName){
  var app = SpreadsheetApp;
  var ss = app.getActiveSpreadsheet();
  var activeSheetAppender = ss.getSheetByName(storeName);
  try{
    if (dataFilter(itemNamesArray, dayInventory.Item.Name) == true){
      var productName = dayInventory.Item.Name
      var productQuantity = dayInventory.Quantity
      var productUnit = dayInventory.UnitOfMeasureAbbreviation
      var lastModified = dayInventory.LastModified;
      activeSheetAppender.getRange(activeCell,2).setValue(activeSheetAppender.getRange(activeCell,2).getValue() + productQuantity);
      }
    
  }
  
  catch(err){ 
    for (var i = 0; i < dayInventory.length; i++){
      if (dataFilter(itemNamesArray, dayInventory[i].Item.Name) == true){
        var productName = dayInventory[i].Item.Name
        var productQuantity = dayInventory[i].Quantity
        var productUnit = dayInventory[i].UnitOfMeasureAbbreviation
        var lastModified = dayInventory[i].LastModified;
        activeSheetAppender.getRange(activeCell,2).setValue(activeSheetAppender.getRange(activeCell,2).getValue() + productQuantity);
      }
    }
  }
}

function itemNameArrayCompiler(){
  var app = SpreadsheetApp;
  var ss = app.getActiveSpreadsheet();
  var activeSheetFilter = ss.getSheetByName("All Store Total");
  var itemNames = []
  for (i = 1; i < 1500; i++){
      if (activeSheetFilter.getRange(i+1,1).getValue().length <= 1){
        break;}
      else{activeCellRead = activeSheetFilter.getRange(i+1,1).getValue();
        itemNames.push(activeCellRead);}
  }
  Logger.log("item list compiled")
  return itemNames;
}

function dataFilter(itemNames, itemNameFromAPI){
  for (i = 0; i <= itemNames.length; i++){
      if (itemNameFromAPI == itemNames[i]){
        activeCell = i+2                    // adds one to skip the Item header cell on sheet
        return true;
      }
    }
  }

