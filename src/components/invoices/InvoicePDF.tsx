import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// IMPORTANT: Only use built-in PDF fonts (Helvetica, Helvetica-Bold, Times-Roman).
// Do NOT register or use Syne — it causes a fontkit crash on Vercel Linux.

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#3D2E1E",
    padding: 48,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  companyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    color: "#2D4A35",
    marginBottom: 4,
  },
  companyDetail: {
    fontSize: 9,
    color: "#7A6045",
    lineHeight: 1.5,
  },
  invoiceLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: "#3D2E1E",
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 11,
    color: "#7A6045",
    textAlign: "right",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#A89070",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  billTo: {
    fontSize: 10,
    color: "#3D2E1E",
    lineHeight: 1.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0D8CA",
    marginVertical: 16,
  },
  datesRow: {
    flexDirection: "row",
    gap: 32,
    marginBottom: 24,
  },
  dateBlock: {
    flex: 1,
  },
  dateLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#A89070",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 10,
    color: "#3D2E1E",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#D4C9B0",
    padding: "6 8",
  },
  tableHeaderText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#7A6045",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: "row",
    padding: "6 8",
    borderBottom: "1px solid #E0D8CA",
  },
  tableCell: {
    fontSize: 9,
    color: "#3D2E1E",
  },
  col_desc: { flex: 3 },
  col_qty: { flex: 1, textAlign: "right" },
  col_rate: { flex: 1, textAlign: "right" },
  col_amount: { flex: 1, textAlign: "right" },
  totalsSection: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginBottom: 4,
    minWidth: 200,
  },
  totalLabel: {
    fontSize: 9,
    color: "#7A6045",
    textAlign: "right",
    width: 100,
  },
  totalValue: {
    fontSize: 9,
    color: "#3D2E1E",
    textAlign: "right",
    width: 80,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 6,
    paddingTop: 6,
    borderTop: "1px solid #3D2E1E",
    minWidth: 200,
  },
  grandTotalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#3D2E1E",
    textAlign: "right",
    width: 100,
  },
  grandTotalValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#2D4A35",
    textAlign: "right",
    width: 80,
  },
  notes: {
    marginTop: 32,
    padding: 12,
    backgroundColor: "#F5F1E8",
    borderRadius: 4,
  },
  notesLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#A89070",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: "#7A6045",
    lineHeight: 1.5,
  },
});

export interface InvoicePDFData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  notes: string | null;
  subtotal: string;
  taxAmount: string;
  taxName: string;
  total: string;
  paidAmount: string;
  clientName: string;
  clientAddress: string | null;
  clientEmail: string | null;
  companyName: string;
  companyAddress: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  lineItems: {
    id: string;
    description: string;
    quantity: string;
    rate: string;
    amount: string;
  }[];
}

export function InvoicePDF({ data }: { data: InvoicePDFData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{data.companyName}</Text>
            {data.companyAddress && (
              <Text style={styles.companyDetail}>{data.companyAddress}</Text>
            )}
            {data.companyEmail && (
              <Text style={styles.companyDetail}>{data.companyEmail}</Text>
            )}
            {data.companyPhone && (
              <Text style={styles.companyDetail}>{data.companyPhone}</Text>
            )}
          </View>
          <View>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Dates */}
        <View style={styles.datesRow}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateLabel}>Bill To</Text>
            <Text style={styles.billTo}>{data.clientName}</Text>
            {data.clientAddress && (
              <Text style={[styles.billTo, { color: "#7A6045" }]}>
                {data.clientAddress}
              </Text>
            )}
            {data.clientEmail && (
              <Text style={[styles.billTo, { color: "#7A6045" }]}>
                {data.clientEmail}
              </Text>
            )}
          </View>
          <View style={styles.dateBlock}>
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.dateLabel}>Issue Date</Text>
              <Text style={styles.dateValue}>{data.issueDate}</Text>
            </View>
            <View>
              <Text style={styles.dateLabel}>Due Date</Text>
              <Text style={styles.dateValue}>{data.dueDate}</Text>
            </View>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.col_desc]}>Description</Text>
          <Text style={[styles.tableHeaderText, styles.col_qty]}>Qty</Text>
          <Text style={[styles.tableHeaderText, styles.col_rate]}>Rate</Text>
          <Text style={[styles.tableHeaderText, styles.col_amount]}>Amount</Text>
        </View>
        {data.lineItems.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.col_desc]}>{item.description}</Text>
            <Text style={[styles.tableCell, styles.col_qty]}>{Number(item.quantity).toFixed(2)}</Text>
            <Text style={[styles.tableCell, styles.col_rate]}>${Number(item.rate).toFixed(2)}</Text>
            <Text style={[styles.tableCell, styles.col_amount]}>${Number(item.amount).toFixed(2)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${Number(data.subtotal).toFixed(2)}</Text>
          </View>
          {Number(data.taxAmount) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{data.taxName}</Text>
              <Text style={styles.totalValue}>${Number(data.taxAmount).toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>${Number(data.total).toFixed(2)}</Text>
          </View>
          {Number(data.paidAmount) > 0 && (
            <>
              <View style={[styles.totalRow, { marginTop: 4 }]}>
                <Text style={styles.totalLabel}>Amount Paid</Text>
                <Text style={styles.totalValue}>${Number(data.paidAmount).toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: "#A63D3D" }]}>Balance Due</Text>
                <Text style={[styles.totalValue, { color: "#A63D3D" }]}>
                  ${(Number(data.total) - Number(data.paidAmount)).toFixed(2)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
