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
  var headers = {"Authorization" : "Basic " + Utilities.base64Encode("ByDuekpGQ8Uyy73vo1en1QslAvJXqMWCe53VVdyBKXedSuxa" + ':' + "uaQp1cnS3PMSYV6e4ZzXn1ENkE5GzdPdEsuJSpMhkk4clt-c")};
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
    //Logger.log(dateIterator()[i])
    //Logger.log(dayInventory);
    dayDataAppender(dayInventory, itemNamesArray, storeName)
    Utilities.sleep(500)
    Logger.log("Call number " + i)
  }
}
function compileSheet(){
  yearDataCompiler("Dutton", "C10-0000456-LIC")
  yearDataCompiler("Haight", "C10-0000453-LIC")
  yearDataCompiler("Sebastopol", "C10-0000455-LIC")
//yearDataCompiler("Sonoma", "")
//yearDataCompiler("Polk", "")
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
      //activeCell += 1
      //activeSheetAppender.getRange(activeCell+1,1).setValue(productName);
      activeSheetAppender.getRange(activeCell,2).setValue(activeSheetAppender.getRange(activeCell,2).getValue() + productQuantity);
      //activeSheetAppender.getRange(activeCell+1,3).setValue(productUnit);
      //activeSheetAppender.getRange(activeCell+1,4).setValue(lastModified);
      }
    
  }
  
  catch(err){ 
    for (var i = 0; i < dayInventory.length; i++){
      if (dataFilter(itemNamesArray, dayInventory[i].Item.Name) == true){
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
  //var app = SpreadsheetApp;
  //var ss = app.getActiveSpreadsheet();
  //var activeSheetFilter = ss.getSheetByName("All Store Total");
  for (i = 0; i <= itemNames.length; i++){
    //if (activeSheetFilter.getRange(i+1,1).getValue().length <= 1){
      //break;}
    //if{activeCellRead = activeSheetFilter.getRange(i+1,1).getValue();
      //Logger.log(activeCellRead)
      if (itemNameFromAPI == itemNames[i]){
        activeCell = i+2                    // adds one to skip the Item header cell on sheet
        //Logger.log(itemNames[i])
        //Logger.log(activeCell)
        return true;
        //var app2 = SpreadsheetApp;
        //var ss2 = app2.getActiveSpreadsheet();
        //var activeSheetAppender = ss2.getSheetByName("Dutton");
        //activeSheetAppender.getRange(activeCell+2,1).setValue(itemName)
      }
    }
  }

//dataFilter("MG Cartridge 1/2g Durban")
function doNothing(){
  return;
}