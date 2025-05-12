const teamConfigs = {
    // Jira#OE20-3535
    ApTaxTeamAlert: {
        headerText: "Ashburn, VA Invoices with Tax",
        getPayloadItems: (row) => [
            {
                key: "Invoice Number",
                value: `<${row.INV_DEEP_LINK}|${row.INVOICE_NUMBER}>`,
                short: true
            },
            {
                key: "Supplier",
                value: row.SUPPLIER_NAME,
                short: true
            },
            {
                key: "Business Unit",
                value: row.BU_NAME,
                short: true
            },
            {
                key: "PO Number",
                value: row.PO_NUMBER,
                short: true
            },
            {
                key: "PR Requestor (Email)",
                value: row.REQ_REQUESTER_NAME,
                short: true
            },
            {
                key: "Items Amount (USD Accounted Currency)",
                value: `${row.ITEMS_AMT} USD`,
                short: true
            },
            {
                key: "Shipping Amount (USD Accounted Currency)",
                value: `${row.SHIPPING_HANDLING_AMT} USD`,
                short: true
            },
            {
                key: "Tax Amount (USD Accounted Currency)",
                value: `${row.SUMMARY_TAX_LINES} USD`,
                short: true
            },
            {
                key: "Invoice Amount (USD Accounted Currency)",
                value: `${row.TOTAL_INVOICE_AMOUNT_USD} USD`,
                short: true
            }
        ],
        showNote: false
       
        
    },
    // Jira#OE20-3535
    ApTaxTeamAlert1: {
        headerText: "Unpaid Tax Payment Notification",
        getPayloadItems: (row) => [
            {
                key: "Invoice Number",
                value: `<${row.INV_DEEP_LINK}|${row.INVOICE_NUMBER}>`,
                short: true
            },
            {
                key: "Supplier Name",
                value: row.SUPPLIER_NAME,
                short: true
            },
            {
                key: "Business Unit",
                value: row.BU_NAME,
                short: true
            },
            {
                key: "Invoice Amount (Entered)",
                value: `${row.TOTAL_INVOICE_AMOUNT} ${row.INVOICE_CURRENCY}`,
                short: true
            },
            {
                key: "Invoice Amount (USD)",
                value: `${row.TOTAL_INVOICE_AMOUNT_USD} USD`,
                short: true
            },
            {
                key: "Due Date",
                value: row.PAYMENT_DUE_DATE,
                short: true
            },
            {
                key: "Approval Status - Oracle",
                value: row.INVOICE_APPROVAL_STATUS,
                short: true
            },
            {
                key: "Approver Name",
                value: row.APPROVER_NAME,
                short: true
            }
        ],
        showNote: true
    }, // Jira#OE20-3534
    /**
     * Defines the configuration for the "GLTaxTeamFYAlert" alert, which displays information about journal entries hitting income tax accounts.
     * The `getPayloadItems` function generates an array of objects with key-value pairs to be displayed in the alert.
     * The `headerText` property sets the title of the alert.
     * The `showNote` property determines whether a note should be displayed in the alert.
     */
    GLTaxTeamFYAlert: {
        headerText: "JEs hitting Income Tax Accounts",
        getPayloadItems: (row) => [
            {
                key: "Journal Batch Name",
                value: `<${row.BATCH_URL}|${row.BATCH_NAME.replace(/_/g, '\\_')}>`,
                short: true
            },
            {
                key: "Journal Name",
                value: row.JOURNAL_NAME.replace(/_/g, '\\_'),
                short: true
            },
            {
                key: "Ledger",
                value: row.LEDGER_NAME.replace(/_/g, '\\_'),  // Escape underscores
                short: true
            },
            {
                key: "Journal Category",
                value: row.CATERGORY_NAME,
                short: true
            },
            {
                key: " Journal Description",
                value: row.JE_DESCRIPTION.replace(/_/g, '\\_'),
                short: true
            },
            {
                key: "Journal String",
                value: row.JOURNAL_STRING,
                short: true
            },
            {
                key: "Entered Cr (GL Currency)",
                value: `${row.ENTERED_CR} ${row.GL_CURRENCY_CODE}`,
                short: true
            },
            {
                key: "Entered Dr (GL Currency)",
                value: `${row.ENTERED_DR} ${row.GL_CURRENCY_CODE}`,
                short: true
            },
            {
                key: "Accounted Cr (Ledger Currency)",
                value: `${row.ACCOUNTED_CR} ${row.LEDGER_CURRENCY}`,
                short: true
            },
            {
                key: "Accounted Dr (Ledger Currency)",
                value: `${row.ACCOUNTED_DR} ${row.LEDGER_CURRENCY}`,
                short: true
            },
            {
                key: "Journal Submitter/Preparer",
                value: row.JOURNAL_CREATED_BY,
                short: true
            },
            {
                key: "Journal Approval Group",
                value: row.JOURNAL_APPROVED_BY,
                short: true
            } ,
            {
                key: "Accounting Date",
                value: row.ACCOUNTING_DATE,
                short: true
            }
        ],
        showNote: false
       
        
    } 
};

module.exports = teamConfigs;


