import { OrderType, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

type DocType =
  | "INVOICE"
  | "PACKING_LIST"
  | "CUSTOMS_DECLARATION"
  | "CERTIFICATE_OF_ORIGIN"
  | "BL_AWB"
  | "QUARANTINE_CERT"
  | "QUALITY_CERT"
  | "TAX_PAYMENT_RECEIPT"
  | "SPECIALIZED_INSPECTION"
  | "PHYTOSANITARY_CERT"
  | "FUMIGATION_CERT"
  | "PAYMENT_CONFIRMATION"
  | "OTHER";

type DocStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
type FinancialType =
  | "IMPORT_TAX"
  | "VAT"
  | "CUSTOMS_FEE"
  | "INSPECTION_FEE"
  | "FREIGHT"
  | "INSURANCE"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_SENT"
  | "OTHER";
type Currency = "USD" | "CNY" | "VND";
type AlertType = "STAGE_OVERDUE" | "DOCUMENT_MISSING" | "PAYMENT_DUE" | "INSPECTION_EXPIRY" | "CUSTOM_ALERT";
type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive seed...");

  // Clear existing data in correct order (respecting foreign key constraints)
  await prisma.$transaction(async (tx) => {
    await tx.alert.deleteMany();
    await tx.stageLog.deleteMany();
    await tx.financial.deleteMany();
    await tx.document.deleteMany();
    await tx.orderPartner.deleteMany();
    await tx.order.deleteMany();
    await tx.contract.deleteMany();
    await tx.exchangeRate.deleteMany();
    await tx.sLAConfig.deleteMany();
    await tx.partner.deleteMany();
    await tx.user.deleteMany();
  });

  console.log("✓ Cleared existing data");

  // Create Users
  const users = await prisma.$transaction([
    prisma.user.create({
      data: {
        username: "admin",
        email: "admin@tradeflow.com",
        passwordHash: await bcrypt.hash("Admin@123", 10),
        fullName: "System Admin",
        role: "ADMIN",
      },
    }),
    prisma.user.create({
      data: {
        username: "manager",
        email: "manager@tradeflow.com",
        passwordHash: await bcrypt.hash("Manager@123", 10),
        fullName: "Nguyễn Thị Hương",
        role: "MANAGER",
      },
    }),
    prisma.user.create({
      data: {
        username: "operator1",
        email: "operator1@tradeflow.com",
        passwordHash: await bcrypt.hash("Operator@123", 10),
        fullName: "Trần Văn Minh",
        role: "OPERATOR",
      },
    }),
    prisma.user.create({
      data: {
        username: "viewer",
        email: "viewer@tradeflow.com",
        passwordHash: await bcrypt.hash("Viewer@123", 10),
        fullName: "Lê Thị Lan",
        role: "VIEWER",
      },
    }),
  ]);

  console.log("✓ Created 4 users");

  // Create Partners
  const partners = await prisma.$transaction([
    prisma.partner.create({
      data: {
        name: "Công ty TNHH Nông sản Mekong Delta",
        type: "SUPPLIER",
        country: "VN",
        contactPerson: "Nguyễn Văn Hùng",
        phone: "+84 292 3700100",
        email: "contact@mekongdelta.vn",
        taxCode: "0312345678",
        licenseNumber: "0312345678",
        rating: 4,
        notes: "Chuyên cung cấp nông sản tươi sống",
      },
    }),
    prisma.partner.create({
      data: {
        name: "Guangxi Youyi Trading Co., Ltd",
        type: "BUYER",
        country: "CN",
        contactPerson: "Wang Ming",
        phone: "+86 771 5123456",
        email: "contact@youitrading.cn",
        taxCode: "91450100MA5KQCQ62W",
        licenseNumber: "91450100MA5KQCQ62W",
        rating: 5,
        notes: "Đối tác lâu năm, uy tín cao",
      },
    }),
    prisma.partner.create({
      data: {
        name: "Yunnan Import-Export Corp",
        type: "BUYER",
        country: "CN",
        contactPerson: "Li Wei",
        phone: "+86 871 6312789",
        email: "sales@yunnanimpexp.com",
        taxCode: "91530100MA6K7D0X3F",
        licenseNumber: "91530100MA6K7D0X3F",
        rating: 4,
        notes: "Nhà mua hàng lớn từ Yunnan",
      },
    }),
    prisma.partner.create({
      data: {
        name: "Công ty CP XNK Hải Phòng",
        type: "SUPPLIER",
        country: "VN",
        contactPerson: "Phạm Thị Hoa",
        phone: "+84 225 3847300",
        email: "export@haiphongxnk.vn",
        taxCode: "0201345678",
        licenseNumber: "0201345678",
        rating: 4,
        notes: "Chuyên xuất khẩu hải sản và nông sản",
      },
    }),
    prisma.partner.create({
      data: {
        name: "Logistics Biên Giới Lạng Sơn",
        type: "FREIGHT_FORWARDER",
        country: "VN",
        contactPerson: "Trần Anh Tuấn",
        phone: "+84 243 3838899",
        email: "logistics@langsontransport.vn",
        taxCode: "0123345678",
        licenseNumber: "0123345678",
        rating: 5,
        notes: "Dịch vụ vận chuyển biên giới chuyên nghiệp",
      },
    }),
    prisma.partner.create({
      data: {
        name: "Hải quan Quốc tế ABC",
        type: "CUSTOMS_BROKER",
        country: "VN",
        contactPerson: "Võ Hồng Phúc",
        phone: "+84 24 3936 1234",
        email: "customs@abc-international.vn",
        taxCode: "0105456789",
        licenseNumber: "HQ-ABC-2022",
        rating: 5,
        notes: "Môi giới hải quan với kinh nghiệm 15 năm",
      },
    }),
    prisma.partner.create({
      data: {
        name: "SGS Vietnam",
        type: "INSPECTION_AGENCY",
        country: "VN",
        contactPerson: "Dương Minh Quân",
        phone: "+84 28 3910 5555",
        email: "vietnam@sgsgroup.com",
        taxCode: "0300568910",
        licenseNumber: "SGS-VN-2020",
        rating: 5,
        notes: "Cơ quan kiểm định quốc tế uy tín",
      },
    }),
    prisma.partner.create({
      data: {
        name: "Công ty TNHH Thuỷ sản Cà Mau",
        type: "SUPPLIER",
        country: "VN",
        contactPerson: "Huỳnh Văn Sơn",
        phone: "+84 297 3822288",
        email: "seafood@camausea.vn",
        taxCode: "0311567890",
        licenseNumber: "0311567890",
        rating: 4,
        notes: "Nhà cung cấp hàng đầu về thuỷ sản chất lượng cao",
      },
    }),
  ]);

  console.log("✓ Created 8 partners");

  // Create Contracts
  const contracts = await prisma.$transaction([
    prisma.contract.create({
      data: {
        contractNumber: "CTR-2026-001",
        type: "EXPORT",
        buyerId: partners[1].id,
        sellerId: partners[0].id,
        signedDate: new Date("2026-01-15"),
        paymentMethod: "TT",
        paymentTerms: "30 days after shipment",
        paymentDueDays: 30,
        totalValue: 50000,
        currency: "USD",
      },
    }),
    prisma.contract.create({
      data: {
        contractNumber: "CTR-2026-002",
        type: "IMPORT",
        buyerId: partners[0].id,
        sellerId: partners[2].id,
        signedDate: new Date("2026-02-01"),
        paymentMethod: "LC",
        paymentTerms: "LC at sight",
        paymentDueDays: 0,
        totalValue: 75000,
        currency: "USD",
      },
    }),
    prisma.contract.create({
      data: {
        contractNumber: "CTR-2026-003",
        type: "EXPORT",
        buyerId: partners[2].id,
        sellerId: partners[3].id,
        signedDate: new Date("2026-02-10"),
        paymentMethod: "DA",
        paymentTerms: "2/10 net 30",
        paymentDueDays: 30,
        totalValue: 120000,
        currency: "USD",
      },
    }),
    prisma.contract.create({
      data: {
        contractNumber: "CTR-2026-004",
        type: "EXPORT",
        buyerId: partners[1].id,
        sellerId: partners[7].id,
        signedDate: new Date("2026-03-01"),
        paymentMethod: "TT",
        paymentTerms: "50% advance, 50% on shipment",
        paymentDueDays: 15,
        totalValue: 85000,
        currency: "USD",
      },
    }),
  ]);

  console.log("✓ Created 4 contracts");

  // Create Orders
  const baseDate = new Date("2026-03-01");
  const orders = await prisma.$transaction([
    // EXPORT Orders
    prisma.order.create({
      data: {
        orderCode: "EXP-2603-0001",
        type: "EXPORT",
        pipelineStage: 1,
        stageEnteredAt: new Date("2026-03-25"),
        stageDeadline: new Date("2026-03-31"),
        status: "ACTIVE",
        contractId: contracts[0].id,
        productDescription: "Thanh long (Dragon Fruit) tươi - Red Pitaya",
        hsCode: "0810.40.00",
        quantity: 50000,
        unit: "kg",
        totalValue: 50000,
        currency: "USD",
        incoterms: "FOB",
        borderGate: "Tân Thanh",
        transportMode: "ROAD",
        createdById: users[1].id,
      },
    }),
    prisma.order.create({
      data: {
        orderCode: "EXP-2603-0002",
        type: "EXPORT",
        pipelineStage: 3,
        stageEnteredAt: new Date("2026-03-20"),
        stageDeadline: new Date("2026-03-27"),
        status: "ACTIVE",
        contractId: contracts[2].id,
        productDescription: "Cà phê hạt Arabica - Coffee beans specialty",
        hsCode: "0901.21.10",
        quantity: 30000,
        unit: "kg",
        totalValue: 90000,
        currency: "USD",
        incoterms: "CIF",
        borderGate: "Hữu Nghị",
        transportMode: "ROAD",
        createdById: users[1].id,
      },
    }),
    prisma.order.create({
      data: {
        orderCode: "EXP-2603-0003",
        type: "EXPORT",
        pipelineStage: 6,
        stageEnteredAt: new Date("2026-03-10"),
        stageDeadline: new Date("2026-03-23"),
        status: "ACTIVE",
        contractId: contracts[3].id,
        productDescription: "Tôm sú tươi đông lạnh - Black Tiger Shrimp",
        hsCode: "0306.36.00",
        quantity: 25000,
        unit: "kg",
        totalValue: 85000,
        currency: "USD",
        incoterms: "FOB",
        borderGate: "Móng Cái",
        transportMode: "SEA",
        createdById: users[1].id,
      },
    }),
    prisma.order.create({
      data: {
        orderCode: "EXP-2603-0004",
        type: "EXPORT",
        pipelineStage: 10,
        stageEnteredAt: new Date("2026-02-01"),
        stageDeadline: new Date("2026-03-15"),
        status: "COMPLETED",
        contractId: contracts[0].id,
        productDescription: "Gạo Jasmine chất lượng cao - Premium Jasmine Rice",
        hsCode: "1006.30.20",
        quantity: 100000,
        unit: "kg",
        totalValue: 45000,
        currency: "USD",
        incoterms: "FOB",
        borderGate: "Tân Thanh",
        transportMode: "ROAD",
        createdById: users[1].id,
      },
    }),
    // IMPORT Orders
    prisma.order.create({
      data: {
        orderCode: "IMP-2603-0001",
        type: "IMPORT",
        pipelineStage: 2,
        stageEnteredAt: new Date("2026-03-23"),
        stageDeadline: new Date("2026-03-29"),
        status: "ACTIVE",
        contractId: contracts[1].id,
        productDescription: "Máy móc nông nghiệp - Agricultural machinery parts",
        hsCode: "8432.90.00",
        quantity: 500,
        unit: "set",
        totalValue: 75000,
        currency: "USD",
        incoterms: "CIF",
        borderGate: "Lào Cai",
        transportMode: "ROAD",
        createdById: users[2].id,
      },
    }),
    prisma.order.create({
      data: {
        orderCode: "IMP-2603-0002",
        type: "IMPORT",
        pipelineStage: 4,
        stageEnteredAt: new Date("2026-03-15"),
        stageDeadline: new Date("2026-03-28"),
        status: "ACTIVE",
        productDescription: "Vải cotton từ Quảng Đông - Cotton fabric raw material",
        hsCode: "5208.11.00",
        quantity: 50000,
        unit: "meter",
        totalValue: 95000,
        currency: "USD",
        incoterms: "CIF",
        borderGate: "Hữu Nghị",
        transportMode: "ROAD",
        createdById: users[2].id,
      },
    }),
    prisma.order.create({
      data: {
        orderCode: "IMP-2603-0003",
        type: "IMPORT",
        pipelineStage: 7,
        stageEnteredAt: new Date("2026-03-05"),
        stageDeadline: new Date("2026-03-25"),
        status: "ACTIVE",
        productDescription: "Phân bón sinh học - Organic fertilizer",
        hsCode: "3105.10.00",
        quantity: 200000,
        unit: "kg",
        totalValue: 55000,
        currency: "USD",
        incoterms: "FOB",
        borderGate: "Móng Cái",
        transportMode: "ROAD",
        createdById: users[2].id,
      },
    }),
    prisma.order.create({
      data: {
        orderCode: "IMP-2603-0004",
        type: "IMPORT",
        pipelineStage: 9,
        stageEnteredAt: new Date("2026-02-15"),
        stageDeadline: new Date("2026-03-20"),
        status: "ACTIVE",
        productDescription: "Linh kiện điện tử - Electronic components",
        hsCode: "8542.31.10",
        quantity: 100000,
        unit: "piece",
        totalValue: 120000,
        currency: "USD",
        incoterms: "CIF",
        borderGate: "Lào Cai",
        transportMode: "AIR",
        createdById: users[2].id,
      },
    }),
    // Mixed Orders
    prisma.order.create({
      data: {
        orderCode: "EXP-2603-0005",
        type: "EXPORT",
        pipelineStage: 2,
        stageEnteredAt: new Date("2026-03-27"),
        stageDeadline: new Date("2026-03-30"),
        status: "ACTIVE",
        productDescription: "Tinh bột sắn - Cassava starch",
        hsCode: "1108.13.00",
        quantity: 80000,
        unit: "kg",
        totalValue: 28000,
        currency: "USD",
        incoterms: "FOB",
        borderGate: "Tân Thanh",
        transportMode: "ROAD",
        createdById: users[1].id,
      },
    }),
    prisma.order.create({
      data: {
        orderCode: "IMP-2603-0005",
        type: "IMPORT",
        pipelineStage: 5,
        stageEnteredAt: new Date("2026-03-18"),
        stageDeadline: new Date("2026-03-31"),
        status: "ON_HOLD",
        productDescription: "Xe tải nhỏ - Light commercial vehicles",
        hsCode: "8704.10.00",
        quantity: 15,
        unit: "unit",
        totalValue: 250000,
        currency: "USD",
        incoterms: "CIF",
        borderGate: "Lào Cai",
        transportMode: "ROAD",
        createdById: users[2].id,
      },
    }),
    prisma.order.create({
      data: {
        orderCode: "EXP-2603-0006",
        type: "EXPORT",
        pipelineStage: 8,
        stageEnteredAt: new Date("2026-02-25"),
        stageDeadline: new Date("2026-03-19"),
        status: "COMPLETED",
        productDescription: "Mủ cao su tự nhiên - Natural rubber latex",
        hsCode: "4001.29.00",
        quantity: 60000,
        unit: "kg",
        totalValue: 72000,
        currency: "USD",
        incoterms: "FOB",
        borderGate: "Hữu Nghị",
        transportMode: "ROAD",
        createdById: users[1].id,
      },
    }),
    prisma.order.create({
      data: {
        orderCode: "IMP-2603-0006",
        type: "IMPORT",
        pipelineStage: 3,
        stageEnteredAt: new Date("2026-03-21"),
        stageDeadline: new Date("2026-03-28"),
        status: "ACTIVE",
        productDescription: "Thiết bị công nghiệp - Industrial equipment",
        hsCode: "8479.90.00",
        quantity: 25,
        unit: "set",
        totalValue: 180000,
        currency: "USD",
        incoterms: "CIF",
        borderGate: "Móng Cái",
        transportMode: "SEA",
        createdById: users[2].id,
      },
    }),
  ]);

  console.log("✓ Created 12 orders");

  // Create OrderPartners
  const orderPartnerData: Array<{
    orderId: string;
    partnerId: string;
    role: "BUYER" | "SUPPLIER" | "FREIGHT_FORWARDER" | "CUSTOMS_BROKER" | "INSPECTION_AGENCY" | "OTHER";
  }> = [
    { orderId: orders[0].id, partnerId: partners[1].id, role: "BUYER" },
    { orderId: orders[0].id, partnerId: partners[4].id, role: "FREIGHT_FORWARDER" },
    { orderId: orders[1].id, partnerId: partners[2].id, role: "BUYER" },
    { orderId: orders[1].id, partnerId: partners[5].id, role: "CUSTOMS_BROKER" },
    { orderId: orders[2].id, partnerId: partners[1].id, role: "BUYER" },
    { orderId: orders[2].id, partnerId: partners[6].id, role: "INSPECTION_AGENCY" },
    { orderId: orders[3].id, partnerId: partners[1].id, role: "BUYER" },
    { orderId: orders[4].id, partnerId: partners[0].id, role: "SUPPLIER" },
    { orderId: orders[4].id, partnerId: partners[5].id, role: "CUSTOMS_BROKER" },
    { orderId: orders[5].id, partnerId: partners[3].id, role: "SUPPLIER" },
    { orderId: orders[5].id, partnerId: partners[4].id, role: "FREIGHT_FORWARDER" },
    { orderId: orders[6].id, partnerId: partners[2].id, role: "SUPPLIER" },
    { orderId: orders[7].id, partnerId: partners[2].id, role: "SUPPLIER" },
    { orderId: orders[8].id, partnerId: partners[2].id, role: "BUYER" },
    { orderId: orders[9].id, partnerId: partners[0].id, role: "SUPPLIER" },
    { orderId: orders[10].id, partnerId: partners[0].id, role: "SUPPLIER" },
    { orderId: orders[10].id, partnerId: partners[6].id, role: "INSPECTION_AGENCY" },
    { orderId: orders[11].id, partnerId: partners[2].id, role: "SUPPLIER" },
  ];

  await prisma.$transaction(
    orderPartnerData.map((data) =>
      prisma.orderPartner.create({
        data,
      })
    )
  );

  console.log("✓ Created order partners");

  // Create Documents (30+)
  const documentTypes: Array<{
    type: DocType;
    statuses: DocStatus[];
  }> = [
    { type: "INVOICE", statuses: ["SUBMITTED", "APPROVED"] },
    { type: "PACKING_LIST", statuses: ["SUBMITTED", "APPROVED", "PENDING"] },
    { type: "CUSTOMS_DECLARATION", statuses: ["PENDING", "SUBMITTED", "APPROVED"] },
    { type: "CERTIFICATE_OF_ORIGIN", statuses: ["SUBMITTED", "APPROVED", "REJECTED"] },
    { type: "BL_AWB", statuses: ["SUBMITTED", "APPROVED"] },
    { type: "QUARANTINE_CERT", statuses: ["PENDING", "SUBMITTED", "APPROVED"] },
    { type: "QUALITY_CERT", statuses: ["SUBMITTED", "APPROVED"] },
    { type: "PHYTOSANITARY_CERT", statuses: ["SUBMITTED", "APPROVED"] },
  ];

  const documents: Array<{
    orderId: string;
    docType: DocType;
    docNumber: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate: Date;
    status: DocStatus;
    notes: string;
  }> = [];
  let docCounter = 1;

  for (let i = 0; i < orders.length; i++) {
    const orderId = orders[i].id;
    const numDocs = 2 + Math.floor(Math.random() * 3);

    for (let j = 0; j < numDocs; j++) {
      const docType = documentTypes[j % documentTypes.length];
      const status = docType.statuses[Math.floor(Math.random() * docType.statuses.length)];
      const issuedDate = new Date(baseDate);
      issuedDate.setDate(issuedDate.getDate() - Math.floor(Math.random() * 15));

      documents.push({
        orderId,
        docType: docType.type,
        docNumber: `DOC-${String(docCounter).padStart(6, "0")}`,
        issuedBy: "Issuing Authority",
        issuedDate,
        expiryDate: new Date(issuedDate.getTime() + 365 * 24 * 60 * 60 * 1000),
        status,
        notes: `Document ${docCounter} for order`,
      });
      docCounter++;
    }
  }

  await prisma.$transaction(
    documents.map((doc) =>
      prisma.document.create({
        data: doc,
      })
    )
  );

  console.log(`✓ Created ${documents.length} documents`);

  // Create Financial Records (20+)
  const financialRecords: Array<{
    orderId: string;
    type: FinancialType;
    amount: number;
    currency: Currency;
    exchangeRate: number;
    amountVnd: number | null;
    paidAt: Date | null;
    paymentRef: string | null;
    notes: string;
  }> = [];
  const financialTypes: FinancialType[] = [
    "IMPORT_TAX",
    "VAT",
    "CUSTOMS_FEE",
    "FREIGHT",
    "INSURANCE",
    "PAYMENT_RECEIVED",
    "PAYMENT_SENT",
  ];

  for (let i = 0; i < orders.length; i++) {
    const orderId = orders[i].id;
    const numFinancials = 2 + Math.floor(Math.random() * 3);

    for (let j = 0; j < numFinancials; j++) {
      const finType = financialTypes[j % financialTypes.length];
      let amount = 0;
      let currency: Currency = "USD";

      if (finType === "FREIGHT") {
        amount = 500 + Math.random() * 5000;
        currency = "USD";
      } else if (finType === "INSURANCE") {
        amount = 200 + Math.random() * 2000;
        currency = "USD";
      } else if (finType === "CUSTOMS_FEE" || finType === "IMPORT_TAX" || finType === "VAT") {
        amount = 1000 + Math.random() * 10000;
        currency = "VND";
      } else {
        amount = (orders[i].totalValue?.toNumber() || 50000) * (0.5 + Math.random() * 0.5);
        currency = orders[i].currency;
      }

      const paidDate = j < Math.floor(numFinancials / 2) ? new Date(baseDate) : null;
      if (paidDate) {
        paidDate.setDate(paidDate.getDate() - Math.floor(Math.random() * 10));
      }

      financialRecords.push({
        orderId,
        type: finType,
        amount: parseFloat(amount.toFixed(2)),
        currency,
        exchangeRate: currency === "VND" ? 24500 : currency === "CNY" ? 7.2 : 1,
        amountVnd: currency === "VND" ? parseFloat(amount.toFixed(2)) : null,
        paidAt: paidDate,
        paymentRef: finType.includes("PAYMENT") ? `PAY-${String(Math.floor(Math.random() * 10000)).padStart(5, "0")}` : null,
        notes: `${finType} for order`,
      });
    }
  }

  await prisma.$transaction(
    financialRecords.map((record) =>
      prisma.financial.create({
        data: record,
      })
    )
  );

  console.log(`✓ Created ${financialRecords.length} financial records`);

  // Create StageLogs (25+)
  const stageLogs: Array<{
    orderId: string;
    fromStage: number;
    toStage: number;
    changedById: string;
    changedAt: Date;
    notes: string;
  }> = [];
  const stageProgressions = [[1, 2, 3], [1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [1, 2, 3, 4, 5, 6, 7, 8], [1, 2], [1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6, 7], [1, 2, 3, 4, 5, 6, 7, 8, 9]];

  for (let i = 0; i < Math.min(orders.length, stageProgressions.length); i++) {
    const orderId = orders[i].id;
    const stages = stageProgressions[i];

    let currentDate = new Date(baseDate);
    currentDate.setDate(currentDate.getDate() - stages.length * 3);

    for (let j = 0; j < stages.length - 1; j++) {
      stageLogs.push({
        orderId,
        fromStage: stages[j],
        toStage: stages[j + 1],
        changedById: Math.random() > 0.5 ? users[1].id : users[2].id,
        changedAt: currentDate,
        notes: `Order moved from stage ${stages[j]} to ${stages[j + 1]}`,
      });

      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 3);
    }
  }

  await prisma.$transaction(
    stageLogs.map((log) =>
      prisma.stageLog.create({
        data: log,
      })
    )
  );

  console.log(`✓ Created ${stageLogs.length} stage logs`);

  // Create Alerts (15+)
  const alertMessages = [
    "Hạn chót giai đoạn sắp tới - Stage deadline approaching",
    "Tài liệu còn thiếu để xử lý hải quan - Missing documents required",
    "Thanh toán quá hạn - Payment overdue",
    "Chứng chỉ kiểm định sắp hết hạn - Inspection certificate expiring",
    "Cần bổ sung thông tin về sản phẩm - Additional product information needed",
    "Chứng chỉ xuất xứ chưa được chấp thuận - CoO not yet approved",
    "Vật tư quá hạn nhập kho - Goods overdue in warehouse",
    "Cần kiểm tra lại hóa đơn - Invoice verification needed",
  ];

  const alerts: Array<{
    orderId: string;
    alertType: AlertType;
    severity: AlertSeverity;
    message: string;
    isRead: boolean;
    createdAt: Date;
  }> = [];
  const alertTypes: AlertType[] = ["STAGE_OVERDUE", "DOCUMENT_MISSING", "PAYMENT_DUE", "INSPECTION_EXPIRY"];

  for (let i = 0; i < Math.min(orders.length, 5); i++) {
    for (let j = 0; j < 3; j++) {
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const severity: AlertSeverity = Math.random() > 0.6 ? "CRITICAL" : Math.random() > 0.5 ? "WARNING" : "INFO";

      alerts.push({
        orderId: orders[i].id,
        alertType,
        severity,
        message: alertMessages[Math.floor(Math.random() * alertMessages.length)],
        isRead: Math.random() > 0.4,
        createdAt: new Date(baseDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
    }
  }

  await prisma.$transaction(
    alerts.map((alert) =>
      prisma.alert.create({
        data: alert,
      })
    )
  );

  console.log(`✓ Created ${alerts.length} alerts`);

  // Create SLA Configs
  const slaConfigs: Array<{ orderType: "EXPORT" | "IMPORT"; stage: number; targetHours: number; warningHours: number }> = [
    { orderType: "EXPORT", stage: 1, targetHours: 24, warningHours: 18 },
    { orderType: "EXPORT", stage: 2, targetHours: 48, warningHours: 36 },
    { orderType: "EXPORT", stage: 3, targetHours: 72, warningHours: 54 },
    { orderType: "EXPORT", stage: 4, targetHours: 96, warningHours: 72 },
    { orderType: "EXPORT", stage: 5, targetHours: 120, warningHours: 90 },
    { orderType: "EXPORT", stage: 6, targetHours: 144, warningHours: 108 },
    { orderType: "EXPORT", stage: 7, targetHours: 168, warningHours: 126 },
    { orderType: "EXPORT", stage: 8, targetHours: 192, warningHours: 144 },
    { orderType: "EXPORT", stage: 9, targetHours: 216, warningHours: 162 },
    { orderType: "EXPORT", stage: 10, targetHours: 240, warningHours: 180 },
    { orderType: "IMPORT", stage: 1, targetHours: 24, warningHours: 18 },
    { orderType: "IMPORT", stage: 2, targetHours: 48, warningHours: 36 },
    { orderType: "IMPORT", stage: 3, targetHours: 72, warningHours: 54 },
    { orderType: "IMPORT", stage: 4, targetHours: 96, warningHours: 72 },
    { orderType: "IMPORT", stage: 5, targetHours: 120, warningHours: 90 },
    { orderType: "IMPORT", stage: 6, targetHours: 144, warningHours: 108 },
    { orderType: "IMPORT", stage: 7, targetHours: 168, warningHours: 126 },
    { orderType: "IMPORT", stage: 8, targetHours: 192, warningHours: 144 },
    { orderType: "IMPORT", stage: 9, targetHours: 216, warningHours: 162 },
  ];

  await prisma.$transaction(
    slaConfigs.map((config) =>
      prisma.sLAConfig.upsert({
        where: { orderType_stage: { orderType: config.orderType, stage: config.stage } },
        update: config,
        create: config,
      })
    )
  );

  console.log("✓ Created SLA configs");

  // Create Exchange Rates
  const exchangeRates = [
    { currency: "USD" as const, rateToVnd: 24500, date: new Date("2026-03-31") },
    { currency: "USD" as const, rateToVnd: 24480, date: new Date("2026-03-30") },
    { currency: "USD" as const, rateToVnd: 24510, date: new Date("2026-03-29") },
    { currency: "CNY" as const, rateToVnd: 3450, date: new Date("2026-03-31") },
    { currency: "CNY" as const, rateToVnd: 3445, date: new Date("2026-03-30") },
    { currency: "CNY" as const, rateToVnd: 3455, date: new Date("2026-03-29") },
  ];

  await prisma.$transaction(
    exchangeRates.map((rate) =>
      prisma.exchangeRate.upsert({
        where: { currency_date: { currency: rate.currency, date: rate.date } },
        update: rate,
        create: rate,
      })
    )
  );

  console.log("✓ Created exchange rates");

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
