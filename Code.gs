/**
 * Unified SaaS Dashboard
 * Google Apps Script Backend (Code.gs)
 */

function doGet(e) {
  // If called via API / Fetch from local computer HTML file
  if (e && e.parameter && e.parameter.action === "send2FA") {
    const result = send2FAEmail(e.parameter.email, e.parameter.code);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }

  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('SaaS Dashboard')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doPost(e) {
  try {
    let email = "";
    let code = "";
    if (e.postData && e.postData.contents) {
      const data = JSON.parse(e.postData.contents);
      email = data.email;
      code = data.code;
    } else if (e.parameter) {
      email = e.parameter.email;
      code = e.parameter.code;
    }
    const result = send2FAEmail(email, code);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get or create the active Spreadsheet database
 */
function getDatabase() {
  const DB_NAME = "SaaS_Dashboard_DB";
  const files = DriveApp.getFilesByName(DB_NAME);
  let spreadsheet;
  
  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.open(files.next());
  } else {
    spreadsheet = SpreadsheetApp.create(DB_NAME);
    // Seed initial sheets
    const defaultSheets = ["Settings", "Finance", "Tasks", "BugBounty", "HotelBookings", "RestaurantOrders", "RestaurantInventory", "TourBookings", "Notes", "Employees", "Menu"];
    defaultSheets.forEach(function(name, index) {
      let sheet;
      if (index === 0) {
        sheet = spreadsheet.getActiveSheet();
        sheet.setName(name);
      } else {
        sheet = spreadsheet.insertSheet(name);
      }
      // Set headers
      const headers = getHeadersForTable(name);
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#c9a84c").setFontColor("#ffffff");
    });
    
    // Seed default settings
    const settingsSheet = spreadsheet.getSheetByName("Settings");
    settingsSheet.appendRow(["key", "value"]);
    settingsSheet.appendRow(["theme", "dark"]);
    settingsSheet.appendRow(["currency", "INR"]);
    settingsSheet.appendRow(["admin_password", "Mrutunjaya@782"]);
    settingsSheet.appendRow(["admin_username", "official.mrutunjaya@gmail.com"]);
    settingsSheet.appendRow(["2fa_enabled", "true"]);
  }
  return spreadsheet;
}

/**
 * Get headers for a specific table
 */
function getHeadersForTable(tableName) {
  switch (tableName) {
    case "Settings": return ["key", "value"];
    case "Finance": return ["id", "date", "type", "category", "amount", "description", "paymentMode"];
    case "Tasks": return ["id", "title", "date", "timeSlot", "status", "priority", "habitsJSON"];
    case "BugBounty": return ["id", "program", "target", "scope", "status", "severity", "reward", "submittedDate", "paidStatus"];
    case "HotelBookings": return ["id", "roomNumber", "guestName", "guestPhone", "checkIn", "checkOut", "status", "totalAmount", "paymentStatus"];
    case "RestaurantOrders": return ["id", "date", "orderDetails", "totalAmount", "status"];
    case "RestaurantInventory": return ["id", "item", "category", "stock", "unit", "minStock", "price"];
    case "TourBookings": return ["id", "customerName", "taxiDetails", "driverName", "tourPackage", "paymentStatus", "totalAmount", "date"];
    case "Notes": return ["id", "title", "content", "category", "tags", "updatedAt"];
    case "Employees": return ["id", "name", "username", "password", "role", "shift", "status"];
    case "Menu": return ["id", "type", "label", "icon", "target", "adminOnly", "order"];
    default: return ["id", "dataJSON"];
  }
}

/**
 * Read all data from a spreadsheet table as JSON objects
 */
function getTableData(tableName) {
  try {
    const ss = getDatabase();
    const sheet = ss.getSheetByName(tableName);
    if (!sheet) return [];
    
    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) return []; // Only headers or empty
    
    const headers = values[0];
    const data = [];
    
    for (let r = 1; r < values.length; r++) {
      const row = values[r];
      const obj = {};
      let hasData = false;
      for (let c = 0; c < headers.length; c++) {
        const val = row[c];
        if (val !== "") hasData = true;
        obj[headers[c]] = val;
      }
      if (hasData) {
        // Parse JSON fields if necessary
        if (obj.habitsJSON) {
          try { obj.habits = JSON.parse(obj.habitsJSON); } catch(e) { obj.habits = {}; }
        }
        data.push(obj);
      }
    }
    return data;
  } catch (error) {
    Logger.log("Error reading table " + tableName + ": " + error.toString());
    return [];
  }
}

/**
 * Save data array back to a spreadsheet table (bulk rewrite for simplicity and consistency)
 */
function saveTableData(tableName, dataArray) {
  try {
    const ss = getDatabase();
    let sheet = ss.getSheetByName(tableName);
    if (!sheet) {
      sheet = ss.insertSheet(tableName);
    }
    
    sheet.clear();
    const headers = getHeadersForTable(tableName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#c9a84c").setFontColor("#ffffff");
    
    if (dataArray && dataArray.length > 0) {
      const rows = [];
      dataArray.forEach(function(item) {
        const row = [];
        headers.forEach(function(header) {
          if (header === "habitsJSON" && item.habits) {
            row.push(JSON.stringify(item.habits));
          } else {
            row.push(item[header] !== undefined ? item[header] : "");
          }
        });
        rows.push(row);
      });
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
    return { success: true };
  } catch (error) {
    Logger.log("Error saving table " + tableName + ": " + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Single call to fetch all databases to speed up initial loading in GAS
 */
function getAllDatabaseData() {
  const tables = ["Settings", "Finance", "Tasks", "BugBounty", "HotelBookings", "RestaurantOrders", "RestaurantInventory", "TourBookings", "Notes", "Employees", "Menu"];
  const dbData = {};
  tables.forEach(function(table) {
    dbData[table] = getTableData(table);
  });
  return dbData;
}

/**
 * Send 2FA Verification Code Email via Google Apps Script MailApp
 */
function send2FAEmail(toEmail, code) {
  try {
    const recipient = toEmail || "official.mrutunjaya@gmail.com";
    const subject = "Your 2FA Login Verification Code: " + code;
    const body = "Hello Admin,\n\n" +
      "Your Two-Factor Authentication (2FA) verification code is: " + code + "\n\n" +
      "Enter this code on the login page to securely access your Admin Dashboard.\n" +
      "This code is confidential. Do not share it with anyone.\n\n" +
      "Best regards,\nSaaS Admin Security Team";
      
    MailApp.sendEmail(recipient, subject, body);
    return { success: true };
  } catch (error) {
    Logger.log("Error sending 2FA email: " + error.toString());
    return { success: false, error: error.toString() };
  }
}
