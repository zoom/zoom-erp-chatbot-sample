

const axios = require('axios');
const moment = require('moment');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { Readable } = require('stream');
require('./ERPChatBotApp');
const {roleapiPath} = require('./OracleChatBotConstant');
const { parseStringPromise } = require('xml2js');
const atob = require('atob'); // To decode Base64 content






async function getReqheaderDataApi(bearerToken, UserInputReqNumber) {
    const apiUrl =`${process.env.oraclepodname}`+`${process.env.OracleReqURL}`;
   // console.log("start in getReqheaderDataApi" );
  // console.log('getReqheaderDataApi', apiUrl);

    const queryParams = {
      q: 'Requisition=' + UserInputReqNumber
    };
  console.log('Requisition=' ,UserInputReqNumber);
   // const credentials = process.env.oracleusername+':'+process.env.oraclepass; // not used 
    // const encodedCredentials = Buffer.from(credentials).toString('base64');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`,
    // 'Authorization':'Basic '+encodedCredentials,
      
    };
    const config = {
      headers: headers,
      params: queryParams
    };
  
    try {
      const response = await axios.get(apiUrl, config);
      const responseData = response.data.items[0];
   //console.log("response.status from reqheader",response.status);
  console.log("responseData from req",responseData);

      if (response.status === 200 ) {
        if (response.count !== 0) {        
        return {
          status: response.status,
          documentStatus: responseData.DocumentStatus,
          FunctionalCurrencyCode: responseData.FunctionalCurrencyCode,
          Description: responseData.Description,
          Requisition: responseData.Requisition,
          Preparer: responseData.Preparer,
          CreatedBy: responseData.CreatedBy,
          RequisitionHeaderId:responseData.RequisitionHeaderId,
          formattedDate:moment(responseData.CreationDate).format('M/D/YYYY')
        };
      }
      } else {
        throw new Error(`Invalid status code ${response.status} in the API response.`);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("Bearer token expired please contact finance admin");
      } else {
        //return "Invalid Requistion Number" ;
        const currentDate  = new Date();
        return {
          status: "Invalid Requisition Number",
          documentStatus: "Invalid Requisition Number",
          FunctionalCurrencyCode: "Invalid Requisition Number",
          Description: "Invalid Requisition Number",
          Requisition: "Invalid Requisition Number",
          Preparer: "Invalid Requisition Number",
          CreatedBy: "Invalid Requisition Number",
          RequisitionHeaderId:"Invalid Requisition Number",
          formattedDate:moment(currentDate).format('M/D/YYYY')
        }
        console.log("return in error");
        //throw new Error(`API request failed: ${error.message}`);
        
      }
    }
    
  }

  
  async function getreqlinesDataApi(bearerToken, UserInputReqID) {
    const apiUrllines =`${process.env.oraclepodname}`+`${process.env.OracleReqURL}`+ '/' + UserInputReqID + '/child/lines';
    //console.log('linesurl', apiUrllines);
    const queryParams = {
      limit: 2000
    };
    
    //const credentials =  process.env.oracleusername+':'+process.env.oraclepass; // not used 
    //const encodedCredentials = Buffer.from(credentials).toString('base64');
    const headers = {
      'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
         //'Authorization':'Basic '+encodedCredentials,
    };
    const config = {
      headers: headers,
      params: queryParams
    };
  
    try {
      const response = await axios.get(apiUrllines, config);
      const responseData = response.data.items;
      let totalAmount = 0;
      let totalCurrencyAmount = 0;
      const distinctRequestors = {};
      const distinctCurrency = {};
      const distinctPO = {};
      const distinctPOhdrid = {};
      const distinctbuyer={};
      const distinctsupplier={};
      let amount =0;
  
      if (response.status === 200) {
        responseData.forEach(item => {
  

          if (item.LineTypeCode ==="Goods" || item.LineTypeCode ==="ORA_Rate Based Services")
          {
           //  amount =(item.UnitPrice * item.Quantity); // OE20-3098 rounding issue in UAT 
             amount = Number((item.UnitPrice * item.Quantity).toFixed(2));
            
          } else if (item.LineTypeCode ==="Fixed Price Services")
          {
         //  amount = item.Amount; // OE20-3098 rounding issue in UAT 
           amount = Number(item.Amount.toFixed(2));
           
          }
          const currencyAmount = item.CurrencyAmount;
          const Currency = item.CurrencyCode;
          if (item.PurchaseOrder) {
          const PurchaseOrder = item.PurchaseOrder;
          const POHeaderId = item.POHeaderId;
        //  console.log("const PurchaseOrder = item.PurchaseOrder;",item.PurchaseOrder )
          if (!distinctPO[PurchaseOrder]) {
            distinctPO[PurchaseOrder] = true;
          }
          if (!distinctPOhdrid[POHeaderId]) {
            distinctPOhdrid[POHeaderId] = true;
          }
          }
            if (item.Requester){
          const requestor = item.Requester;
          if (!distinctRequestors[requestor]) {
            distinctRequestors[requestor] = true;
          }
            }
            if (item.AssignedBuyerDisplayName){
            
          const buyeronpo=item.AssignedBuyerDisplayName;
          if (!distinctbuyer[buyeronpo]) {
            distinctbuyer[buyeronpo] = true;
          }
            }
            if (item.Supplier){

          const supplieronpo=item.Supplier;
          if (!distinctsupplier[supplieronpo]) {
            distinctsupplier[supplieronpo] = true;
          }
            }
         
    
          
         
          if (!distinctCurrency[Currency]) {
            distinctCurrency[Currency] = true;
          }
        
       

  
          totalAmount += amount;
          totalCurrencyAmount += currencyAmount;
        
      });
  
        const distinctRequestorsList = Object.keys(distinctRequestors).join(", ");
        const distinctCurrencyList = Object.keys(distinctCurrency).join(", ");
        const distinctPOList = Object.keys(distinctPO).join(", ");
        const distinctPOhdrList = Object.keys(distinctPOhdrid).join(", ");
        const distinctbuyerList = Object.keys(distinctbuyer).join(", ");
        const distinctsupplierList = Object.keys(distinctsupplier).join(", ");
    
  
        //console.log("amount", totalAmount);
  
        return {
          distinctRequestors: distinctRequestorsList,
          distinctCurrency: distinctCurrencyList,
          PurchaseOrder: distinctPOList,
          Amount: totalAmount,
          CurrencyAmount: totalCurrencyAmount,
           buyeronpo:distinctbuyerList,
           supplieronpo:distinctsupplierList,
           POHeaderId:distinctPOhdrList
        };
      } else {
        throw new Error(`Invalid status code ${response.status} in the Req Line API response.`);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
      console.log("Bearer token expired please contact finance admin");
       } else {
        throw new Error(`Req Lines API request failed: ${error.message}`);
      }
    }
  }
  
  
async function getReqApprovalDataApi(bearerToken, UserInputReqID) {
  const apiUrapprover = `${process.env.oraclepodname}`+`${process.env.OracleReqURL}/${UserInputReqID}/action/retrieveCurrentApprovers`;
 // console.log('apiUrapprover', apiUrapprover);
  
  //const credentials = `${process.env.oracleusername}:${process.env.oraclepass}`; //not used
  //const encodedCredentials = Buffer.from(credentials).toString('base64');
  
  const headers = {
      'Content-Type': 'application/vnd.oracle.adf.action+json',
      'Authorization': `Bearer ${bearerToken}`,
      'HTTPAccept': '*/*'
  };
  
  let config = {
      method: 'post',
      maxBodyLength: 'Infinity',
      url: apiUrapprover,
      headers: headers
  };

  try {
      const response = await axios.request(config);
      const responseData = response.data;

      if (responseData.result && responseData.result[0].failureCode === 'TASK_NOT_CREATED'
        || responseData.result && responseData.result[0].failureCode === 'NO_APPROVERS_FOUND' // OE20-3757
       ) {
          console.error('Task not created');
          return { currenapprover: 'Task not created' };
      }

      const distinctApprovers = new Set();

      if (Array.isArray(responseData.result)) {
          responseData.result.forEach(item => {
              distinctApprovers.add(item.assigneeDisplayName);
          });

          const distinctApproverList = Array.from(distinctApprovers).join(", ");

       //   console.log("Approvers", distinctApproverList);

          return {
              currenapprover: distinctApproverList
          };
      } else {
          throw new Error(`Invalid response format: ${JSON.stringify(responseData)}`);
      }
  } catch (error) {
      console.error(`Error in API request: ${error.message}`);
      if (error.response && error.response.status) {
          console.error(`Status code: ${error.response.status}`);
      }
      throw new Error(`Req getReqApprovalDataApi API request failed: ${error.message}`);
  }
}
  async function getPOheaderDataApi(bearerToken, UserInputPONumber) {
    const apiUrl =process.env.oraclepodname+process.env.Oraclepourlbody;
   // console.log("start in getPOheaderDataApi" );
    const queryParams = {
      q: 'OrderNumber=' + UserInputPONumber
    };
    console.log("OrderNumber",UserInputPONumber );
    //const credentials = process.env.oracleusername+':'+process.env.oraclepass; //not used
    //const encodedCredentials = Buffer.from(credentials).toString('base64');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`,
    // 'Authorization':'Basic '+encodedCredentials,
      
    };
    const config = {
      headers: headers,
      params: queryParams
    };
  
    try {
      const response = await axios.get(apiUrl, config);
      const responseData = response.data.items[0];


      if (response.status === 200 ) {
        if (response.count !== 0) {        
        return {
         postatus: responseData.Status,
          PurchaseOrder: responseData.OrderNumber,
          Description: responseData.Description,
         TotalPOAmount: responseData.Total,
         SupplierName: responseData.Supplier,
         BuyerName: responseData.Buyer,
		 POHeaderId: responseData.POHeaderId,
     CurrencyCode:responseData.CurrencyCode,
     RequesterDisplayName:responseData.RequesterDisplayName, //OE20-3418
         formattedDate:moment(responseData.CreationDate).format('M/D/YYYY')
        };
      }
      } else {
        throw new Error(`Invalid status code ${response.status} in the API response.`);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("Bearer token expired please contact finance admin");
      } else {
        //return "Invalid Requistion Number" ;
        const currentDate  = new Date();
        return {
          postatus: "Invalid Purchase Order Number",
          PurchaseOrder: "Invalid Purchase Order Number",
          Description: "Invalid Purchase Order Number",
         TotalPOAmount:"Invalid Purchase Order Number",
         SupplierName: "Invalid Purchase Order Number",
         BuyerName: "Invalid Purchase Order Number",
		 POHeaderId: "Invalid Purchase Order Number",
     CurrencyCode:"Invalid Purchase Order Number",
     RequesterDisplayName:"Invalid Purchase Order Number",//OE20-3418
          formattedDate:moment(currentDate).format('M/D/YYYY')
        }
        console.log("return in error");
        //throw new Error(`API request failed: ${error.message}`);
        
      }
    }
  }
  
async function checkUserRoles(username,bearerToken) {
  // Base URL components
  const filterParam = `filter=displayName%20eq%20%22${encodeURIComponent(username)}%22`;
  // Construct the final URL
  const url = `${process.env.oraclepodname}${roleapiPath}?${filterParam}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`,
    }
  };

  try {
    const response = await axios.get(url, config);
    const user = response.data.Resources && response.data.Resources[0];

    if (user && user.roles) {
      const roles = user.roles.map(role => role.value);
      const requiredRoles = [
        'ZM_PO_PROCUREMENT_INQUIRY_JOB',
        'ZM_PO_BUYER_NEGOTIATION_JOB',
        'ZM_PO_BUYER_JOB',
        'ZM_PO_ADVANCED_PROCUREMENT_REQUESTOR_FPA_JOB'
      ];
      // Check if the user has any one of the required roles
      const hasAnyRequiredRole = requiredRoles.some(role => roles.includes(role));

      if (hasAnyRequiredRole) {
        console.log(`User ${username} has at least one of the required roles.`);
        return 'Y'; // Return 'Y' if the user has at least one of the required roles
      } else {
        console.log(`User ${username} does not have any of the required roles.`);
        return null; // Return null if the user does not have any of the required roles
      }
      
    } else {
      console.log(`User ${username} not found or has no roles.`);
      return null; // Return null if user is not found or has no roles
    }
  } catch (error) {
   // console.error('Error fetching user roles:', error);
    return null; // Return null in case of an error
  }
}

async function getPOLifeCycleDetails(bearerToken, POHeaderId) {
  const apiUrl = `${process.env.oraclepodname}${process.env.OraclePOLifeCycleDetailsURL}${POHeaderId}`;
  
  const queryParams = {
      onlyData: true
  };

  const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
  };

  const config = {
      headers: headers,
      params: queryParams
  };

  try {
      const response = await axios.get(apiUrl, config);
      const responseData = response.data;
     // console.log("PO Lifecycle API Response:", responseData);

      if (response.status === 200) {

        const paidAmount = responseData.PaidAmount ?? 0;
        const partiallyPaidAmount = responseData.PartiallyPaidAmount ?? 0;
        const unpaidAmount = responseData.UnpaidAmount ?? 0;
           // Calculate total invoice amount
           const totalInvoiceAmount = parseFloat((paidAmount + partiallyPaidAmount + unpaidAmount).toFixed(2));

              return {
                  OrderedAmount: responseData.OrderedAmount || 0,
                  totalInvoiceAmount: totalInvoiceAmount
              };
          
      } else {
          throw new Error(`Invalid status code ${response.status} in the API response.`);
      }
  } catch (error) {
      if (error.response && error.response.status === 401) {
          console.log("Bearer token expired please contact finance admin");
      } else {
          return {
              OrderedAmount: 0,
              totalInvoiceAmount: 0
          };
      }
  }
}



async function getPOLifeCycleInvoices(bearerToken, POHeaderId) {
  const apiUrl = `${process.env.oraclepodname}${process.env.OraclePOLifeCycleDetailsURL}${POHeaderId}/child/invoices`;

  const queryParams = {
      onlyData: true,
      limit: 10000 
  };

  const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`
  };

  const config = {
      headers: headers,
      params: queryParams
  };

  try {
      const response = await axios.get(apiUrl, config);

      if (response.status === 200 && response.data.items.length > 0) {
          const totalInvoicedAmount = response.data.items.reduce((sum, item) => sum + (item.TotalInvoicedAmount || 0), 0);
          const distinctCurrencies = [...new Set(response.data.items.map(item => item.CurrencyCode).filter(Boolean))];
          return {
              status: response.status,
              TotalInvoicedAmount: totalInvoicedAmount,
              CurrencyCode: distinctCurrencies.join(', ')
          };
      }

      return {
          status: response.status,
          TotalInvoicedAmount: 0,
          CurrencyCode: "Not Applicable"
      };
  } catch (error) {
      if (error.response && error.response.status === 401) {
          console.log("Bearer token expired. Please contact finance admin.");
      }
      return {
          status: "Error",
          TotalInvoicedAmount: 0,
          CurrencyCode: "Not Applicable"
      };
  }
}




/**
 * Fetches and processes a SOAP-based Oracle Fusion report.
 * @param {string} bearerToken - Oracle Fusion Bearer Token.
 * @param {string} P_DM_TO_USE - The report parameter value.
 * @param {string} reportAbsolutePath - The absolute path of the report.
 * @returns {Promise<Object[]>} - An array of parsed and formatted records from the report.
 */
 // Jira#OE20-3534, Jira#OE20-3535
async function runReportAndProcessSOAP(bearerToken, P_DM_TO_USE, reportAbsolutePath, P_DataSetName) {
  const soapRequest = `
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:pub="http://xmlns.oracle.com/oxp/service/PublicReportService">
      <soap:Header/>
      <soap:Body>
        <pub:runReport>
          <pub:reportRequest>
            <pub:flattenXML>false</pub:flattenXML>
            <pub:parameterNameValues>
              <pub:item>
                <pub:name>P_DM_TO_USE</pub:name>
                <pub:values>
                  <pub:item>${P_DM_TO_USE}</pub:item>
                </pub:values>
              </pub:item>
            </pub:parameterNameValues>
            <pub:attributeTemplate>Output</pub:attributeTemplate>
            <pub:attributeformat>XML</pub:attributeformat>
            <pub:attributelocale>English</pub:attributelocale>
            <pub:reportAbsolutePath>${reportAbsolutePath}</pub:reportAbsolutePath>
            <pub:sizeOfDataChunkDownload>-1</pub:sizeOfDataChunkDownload>
          </pub:reportRequest>
        </pub:runReport>
      </soap:Body>
    </soap:Envelope>`;

    const config = {
      method: 'post',
      url: `${process.env.oraclepodname}/xmlpserver/services/ExternalReportWSSService`,
      headers: {
        'Content-Type': 'application/soap+xml;charset=UTF-8',
        Authorization: `Bearer ${bearerToken}`,
        'Accept-Encoding': 'br,gzip,deflate',
        Connection: 'keep-alive',
        'Keep-Alive': 'timeout=300'
      },
      timeout: 300000,
      maxRedirects: 0,
      data: soapRequest
    };

  const response = await axios(config);
  
  const [parsedResponse] = await Promise.all([
    parseStringPromise(response.data, { 
      explicitArray: false,
      ignoreAttrs: true,
      trim: true
    }),
    Promise.resolve()
  ]);

  const base64Report = parsedResponse['env:Envelope']['env:Body']['ns2:runReportResponse']['ns2:runReportReturn']['ns2:reportBytes'];
  const decodedReport = atob(base64Report);
  
  const parsedReport = await parseStringPromise(decodedReport, { 
    explicitArray: false,
    ignoreAttrs: true,
    trim: true,
    strict: false
  });

  return extractAndFormatReportData(parsedReport, P_DataSetName);
}



 // Jira#OE20-3760 start 
/**
 * Runs an Oracle report via SOAP and processes the response
 * @param {string} bearerToken - Authentication token for the Oracle service
 * @param {string} P_DM_TO_USE - Parameter for determining the data model
 * @param {string} P_APPROVER_NAME - Name of the approver for the report
 * @param {string} reportAbsolutePath - Absolute path to the Oracle report
 * @param {string} P_DataSetName - Name of the dataset to extract and format
 * @returns {Promise<Object>} Formatted report data extracted from the SOAP response
 */
async function runReportAndProcessSOAP1(bearerToken, P_DM_TO_USE,P_APPROVER_NAME, reportAbsolutePath, P_DataSetName) {
  
  const soapRequest = `
      <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:pub="http://xmlns.oracle.com/oxp/service/PublicReportService">
        <soap:Header/>
        <soap:Body>
          <pub:runReport>
            <pub:reportRequest>
              <pub:flattenXML>false</pub:flattenXML>
              <pub:parameterNameValues>
                <pub:item>
                  <pub:name>P_DM_TO_USE</pub:name>
                  <pub:values>
                    <pub:item>${P_DM_TO_USE}</pub:item>
                  </pub:values>
                </pub:item>
                    <pub:item>
                  <pub:name>P_APPROVER_NAME</pub:name>
                  <pub:values>
                    <pub:item>${P_APPROVER_NAME}</pub:item>
                  </pub:values>
                </pub:item>
              </pub:parameterNameValues>
              <pub:attributeTemplate>Output</pub:attributeTemplate>
              <pub:attributeformat>XML</pub:attributeformat>
              <pub:attributelocale>English</pub:attributelocale>
              <pub:reportAbsolutePath>${reportAbsolutePath}</pub:reportAbsolutePath>
              <pub:sizeOfDataChunkDownload>-1</pub:sizeOfDataChunkDownload>
            </pub:reportRequest>
          </pub:runReport>
        </soap:Body>
      </soap:Envelope>`;
   
 
      
 
  //console.log(soapRequest);
      const config = {
        method: 'post',
        url: `${process.env.oraclepodname}/xmlpserver/services/ExternalReportWSSService`,
        headers: {
          'Content-Type': 'application/soap+xml;charset=UTF-8',
          Authorization: `Bearer ${bearerToken}`,
          'Accept-Encoding': 'br,gzip,deflate',
          Connection: 'keep-alive',
          'Keep-Alive': 'timeout=300'
        },
        timeout: 300000,
        maxRedirects: 0,
        data: soapRequest
      };
  
    const response = await axios(config);
    
    const [parsedResponse] = await Promise.all([
      parseStringPromise(response.data, { 
        explicitArray: false,
        ignoreAttrs: true,
        trim: true
      }),
      Promise.resolve()
    ]);
  
    const base64Report = parsedResponse['env:Envelope']['env:Body']['ns2:runReportResponse']['ns2:runReportReturn']['ns2:reportBytes'];
    const decodedReport = atob(base64Report);
    
    const parsedReport = await parseStringPromise(decodedReport, { 
      explicitArray: false,
      ignoreAttrs: true,
      trim: true,
      strict: false
    });
    return extractAndFormatReportData(parsedReport, P_DataSetName);
  }
   // Jira#OE20-3760 start 
  


const reportFormatters = {
  // Jira#OE20-3535
  'APTAXTEAMALERTDS': (record) => ({
      INVOICE_NUMBER: record.INVOICE_NUMBER || 'Not Applicable',
      SUPPLIER_NAME: record.SUPPLIER_NAME || 'Not Applicable',
      BU_NAME: record.BU_NAME || 'Not Applicable',
      PO_NUMBER: record.PO_NUMBER || 'Not Applicable',
      REQ_REQUESTER_NAME: record.REQ_REQUESTER_NAME || 'Not Applicable', // Default value added
      ITEMS_AMT: formatCurrency(record.ITEMS_AMT || 0), // Default value added
      SHIPPING_HANDLING_AMT: formatCurrency(record.SHIPPING_HANDLING_AMT || 0), // Default value added
      SUMMARY_TAX_LINES: formatCurrency(record.SUMMARY_TAX_LINES || 0), // Default value added
      TOTAL_INVOICE_AMOUNT_USD: formatCurrency(record.TOTAL_INVOICE_AMOUNT_USD || 0), // Default value added
      INV_DEEP_LINK: record.INV_DEEP_LINK || '#',
      showNote: false  // Adding the flag here
  }),
  // Jira#OE20-3535
  'APTAXTEAMALERTDS1': (record) => ({
    INVOICE_NUMBER: record.INVOICE_NUMBER || 'Not Applicable',
    SUPPLIER_NAME: record.SUPPLIER_NAME || 'Not Applicable',
    BU_NAME: record.BU_NAME || 'Not Applicable',
    TOTAL_INVOICE_AMOUNT_USD: formatCurrency(record.TOTAL_INVOICE_AMOUNT_USD || 0), // Default value added
    TOTAL_INVOICE_AMOUNT: formatCurrency(record.TOTAL_INVOICE_AMOUNT || 0), // Default value added
    INVOICE_CURRENCY: record.INVOICE_CURRENCY || 'Not Applicable',
    PAYMENT_DUE_DATE: record.PAYMENT_DUE_DATE || 'Not Applicable',
    INVOICE_APPROVAL_STATUS: record.INVOICE_APPROVAL_STATUS || 'Not Applicable',
    APPROVER_NAME: record.APPROVER_NAME || 'Not Applicable',
    INV_DEEP_LINK: record.INV_DEEP_LINK || '#',
    showNote: true  // Adding the flag here
  }),
  // Jira#OE20-3534
  'GLTAXTEAMALERTDS': (record) => {
    // First ensure record exists
    if (!record) return null;
    
    return {
      BATCH_NAME: record.BATCH_NAME || 'Not Applicable',
      LEDGER_NAME: record.LEDGER_NAME || 'Not Applicable',
      CATERGORY_NAME: record.CATERGORY_NAME || 'Not Applicable',
      JOURNAL_STRING: record.JOURNAL_STRING || 'Not Applicable',
      GL_CURRENCY_CODE: record.GL_CURRENCY_CODE || 'Not Applicable',
      LEDGER_CURRENCY: record.LEDGER_CURRENCY || 'Not Applicable',
      ACCOUNTED_DR: formatCurrency(record.ACCOUNTED_DR) || 0,
      ACCOUNTED_CR: formatCurrency(record.ACCOUNTED_CR) || 0,
      ENTERED_DR: formatCurrency(record.ENTERED_DR) || 0,
      ENTERED_CR: formatCurrency(record.ENTERED_CR) || 0,
      JOURNAL_NAME: record.JOURNAL_NAME || 'Not Applicable',
      JE_DESCRIPTION: record.JE_DESCRIPTION || 'Not Applicable',
      ACCOUNTING_DATE: record.ACCOUNTING_DATE || 'Not Applicable',
      TAG: record.TAG || '#',
      BATCH_URL: record.BATCH_URL || '#',
      JOURNAL_APPROVED_BY: record.JOURNAL_APPROVED_BY || ' ',
      JOURNAL_CREATED_BY: record.JOURNAL_CREATED_BY || 'Not Applicable',
      showNote: false
    };
  },
  // Jira#OE20-3760
     'APPROVALDS': (record) => {
       // First ensure record exists
       if (!record) return null;
       return {
         ...(record.INV_DEEP_LINK && { INV_DEEP_LINK: record.INV_DEEP_LINK }),
         ...(record.INVOICE_NUM && { INVOICE_NUM: record.INVOICE_NUM }),
         ...(record.CURRENT_APPROVER_NAME && { CURRENT_APPROVER_NAME: record.CURRENT_APPROVER_NAME }),
         ...(record.CURRENT_APPROVER_NAME_REQ && { CURRENT_APPROVER_NAME_REQ: record.CURRENT_APPROVER_NAME_REQ }),
         ...(record.REQUISITION_NUMBER && { REQUISITION_NUMBER: record.REQUISITION_NUMBER }),
         ...(record.REQ_DEEP_LINK && { REQ_DEEP_LINK: record.REQ_DEEP_LINK }),
         showNote: false
       };
     }
};

 // Jira#OE20-3534, Jira#OE20-3535
function formatCurrency(value) {
  return parseFloat(value || 0).toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
  });
}
 // Jira#OE20-3534, Jira#OE20-3535
function extractAndFormatReportData(parsedReport, reportSection) {
  // Handle the nested DATA_DS structure
  const dataSet = parsedReport.DATA_DS;
  if (!dataSet || !dataSet[reportSection]) {
    return [];
  }

  const reportData = Array.isArray(dataSet[reportSection]) 
    ? dataSet[reportSection] 
    : [dataSet[reportSection]];

  const formatter = reportFormatters[reportSection];
  if (!formatter) {
    console.log(`No formatter found for section: ${reportSection}`);
    return [];
  }

  console.log(`Processing ${reportData.length} records for ${reportSection}`);
  return reportData.map(formatter);
}




//OE20-3326 end  
  module.exports = {
    getReqheaderDataApi: getReqheaderDataApi,
    getreqlinesDataApi:getreqlinesDataApi,
    getReqApprovalDataApi:getReqApprovalDataApi,
  getPOheaderDataApi:getPOheaderDataApi,
  checkUserRoles:checkUserRoles,
  getPOLifeCycleDetails:getPOLifeCycleDetails,
  getPOLifeCycleInvoices:getPOLifeCycleInvoices,
  runReportAndProcessSOAP:runReportAndProcessSOAP,
  runReportAndProcessSOAP1:runReportAndProcessSOAP1
  };