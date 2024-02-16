export interface PosReportsInterface {
  grossRevenueTotal: Number;
  netRevenueTotal: Number;
  totalOrder: Number;
  averageOrder: Number;
  averageItemOrder: Number;
  totalDiscountedOffer: Number;
  grossRevenue: [PosReportData];
  netRevenue: [PosReportData];
  orderData: [PosReportData];
  averageOrderValue: [PosReportData];
  averageItemPerOrder: [PosReportData];
  discountedOffers: [PosReportData];
}

export interface PosReportData {
  values: Number;
  label: String;
}
