const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const XLSX = require("xlsx");
const docx = require("docx");

const ImportSlip = require("../models/importSlip.model");
const ExportSlip = require("../models/exportSlip.model");

// Generate PDF
function generatePDF(slip, type) {
    const doc = new PDFDocument();
    const fileName = `./${type}Slip_${slip[type + "SlipCode"]}.pdf`;
    doc.pipe(fs.createWriteStream(fileName));

    // Đảm bảo đường dẫn đến font tuyệt đối
    const fontPath = path.join(__dirname, 'fonts', 'VnArial.ttf'); // Đảm bảo đường dẫn chính xác

    // Cài font vào PDFKit
    doc.font(fontPath)
        .fontSize(12)
        .text(`${type.toUpperCase()} Slip Code: ${slip[type + "SlipCode"]}`, 100, 100)
        .text(`${type.toUpperCase()} Date: ${slip[type + "SlipDate"]}`, 100, 120)
        .text(`Provider: ${slip.providerId?.providerName || "N/A"}`, 100, 140)
        .text(`Agency: ${slip.agencyId?.agencyName || "N/A"}`, 100, 160)
        .text(`Customer: ${slip.customerId?.customerName || "N/A"}`, 100, 180);

    // Product list
    let yOffset = 200;
    slip.products.forEach((product, index) => {
        const prod = product.productId;
        const name = prod?.productName || "Sản phẩm không tồn tại";
        doc.text(`Product ${index + 1}: ${name}`, 100, yOffset);
        doc.text(`Quantity: ${product.quantity}`, 100, yOffset + 15);
        doc.text(`Discount: ${product.discount}`, 100, yOffset + 30);
        yOffset += 50;
    });

    doc.end();
    return fileName;
}

// Generate Excel
function generateExcel(slip, type) {
    const ws_data = [
        [`${type.toUpperCase()} Slip Code`, slip[type + "SlipCode"]],
        [`${type.toUpperCase()} Date`, slip[type + "SlipDate"]],
        ["Provider", slip.providerId?.providerName || "N/A"],
        ["Agency", slip.agencyId?.agencyName || "N/A"],
        ["Customer", slip.customerId?.customerName || "N/A"],
        ["", "", ""], // spacing
        ["Product", "Quantity", "Discount"],
        ...slip.products.map((product) => [
            product.productId?.productName || "Sản phẩm không tồn tại",
            product.quantity,
            product.discount,
        ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${type} Slip`);

    const fileName = `./${type}Slip_${slip[type + "SlipCode"]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    return fileName;
}

// Generate Word
function generateWord(slip, type) {
    const { Document, Packer, Paragraph, TextRun } = docx;

    const children = [
        new Paragraph(`${type.toUpperCase()} Slip Code: ${slip[type + "SlipCode"]}`),
        new Paragraph(`${type.toUpperCase()} Date: ${slip[type + "SlipDate"]}`),
        new Paragraph(`Provider: ${slip.providerId?.providerName || "N/A"}`),
        new Paragraph(`Agency: ${slip.agencyId?.agencyName || "N/A"}`),
        new Paragraph(`Customer: ${slip.customerId?.customerName || "N/A"}`),
    ];

    slip.products.forEach((product, index) => {
        const prodName = product.productId?.productName || "Sản phẩm không tồn tại";
        children.push(
            new Paragraph(
                new TextRun(
                    `Product ${index + 1}: ${prodName} | Quantity: ${product.quantity} | Discount: ${product.discount}`
                )
            )
        );
    });

    const doc = new Document({
        sections: [{ children }],
    });

    const fileName = `./${type}Slip_${slip[type + "SlipCode"]}.docx`;
    return new Promise((resolve, reject) => {
        Packer.toBuffer(doc)
            .then((buffer) => {
                fs.writeFileSync(fileName, buffer);
                resolve(fileName);
            })
            .catch((err) => reject(err));
    });
}

// Generate TXT
function generateTXT(slip, type) {
    // Start with slip details
    let textContent = `${type.toUpperCase()} Slip Code: ${slip[type + "SlipCode"]}\n`;
    textContent += `${type.toUpperCase()} Date: ${new Date(slip[type + "SlipDate"]).toLocaleString()}\n`;  // Better formatting of dates
    textContent += `Provider: ${slip.providerId?.providerName || "N/A"}\n`;

    // Only show agency and customer info if present
    if (slip.agencyId && slip.agencyId.agencyName) {
        textContent += `Agency: ${slip.agencyId.agencyName}\n`;
    } else {
        textContent += `Agency: N/A\n`;
    }

    if (slip.customerId && slip.customerId.customerName) {
        textContent += `Customer: ${slip.customerId.customerName}\n`;
    } else {
        textContent += `Customer: N/A\n`;
    }

    // Add additional text
    textContent += "Additional Text: This is the additional information about the export slip.\n\n";

    // Add product details
    slip.products.forEach((product, index) => {
        const prod = product.productId;
        const name = prod?.productName || "Sản phẩm không tồn tại";  // Default name if not found
        textContent += `Product ${index + 1}: ${name}\n`;
        textContent += `Quantity: ${product.quantity}\n`;
        textContent += `Discount: ${product.discount}\n\n`;
    });

    const fileName = `./${type}Slip_${slip[type + "SlipCode"]}.txt`;
    fs.writeFileSync(fileName, textContent);
    return fileName;
}

// Hàm kiểm tra và tạo file
function generateFile(slip, type) {
    const fileName = `./${type}Slip_${slip[type + "SlipCode"]}.txt`;

    try {
        // Giả sử bạn đang tạo file TXT, bạn có thể thay đổi cho phù hợp với loại file bạn cần
        const fileContent = `${type.toUpperCase()} Slip Code: ${slip[type + "SlipCode"]}`;
        fs.writeFileSync(fileName, fileContent); // Tạo file

        console.log("File đã được tạo:", fileName);
        return fileName;
    } catch (error) {
        console.error("Lỗi khi tạo file:", error);
        return null; // Trả về null nếu có lỗi
    }
}

// Controller function
// Controller function
async function downloadSlip(req, res) {
    console.log('Đã nhận yêu cầu tải xuống export slip với params:', req.params);

    try {
        const { id, type } = req.params;
        const fileType = req.query.type || "txt"; // Default to TXT

        const slipModel = type === "import" ? ImportSlip : ExportSlip;
        const slip = await slipModel
            .findById(id)
            .populate("providerId agencyId customerId products.productId");

        if (!slip) {
            return res.status(404).json({ message: "Không tìm thấy phiếu" });
        }

        let fileName;
        let contentType;

        if (fileType === "txt") {
            fileName = generateTXT(slip, type);  // Generate the .txt file
            contentType = "text/plain";
        } else if (fileType === "pdf") {
            fileName = generatePDF(slip, type);  // Generate the .pdf file
            contentType = "application/pdf";
        } else if (fileType === "xlsx") {
            fileName = generateExcel(slip, type);  // Generate the .xlsx file
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        } else if (fileType === "docx") {
            fileName = await generateWord(slip, type);  // Generate the .docx file
            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else {
            return res.status(400).json({ message: "Loại file không hợp lệ" });
        }

        if (!fs.existsSync(fileName)) {
            return res.status(404).json({ message: "File không tồn tại" });
        }

        // Set the appropriate headers to indicate it's a file to be downloaded
        res.setHeader('Cache-Control', 'no-store'); // Disable caching
        res.setHeader("Content-Disposition", `attachment; filename=${path.basename(fileName)}`);
        res.setHeader("Content-Type", contentType);  // Set the correct content type

        console.log("Sending file:", fileName);
        console.log("Content-Type:", res.getHeader('Content-Type'));

        res.download(fileName, (err) => {
            if (err) {
                console.error("Lỗi khi gửi file:", err);
                res.status(500).json({ message: "Không thể tải file" });
            } else {
                // Optionally, delete the temporary file after sending it
                fs.unlinkSync(fileName);
                console.log("File đã được gửi:", fileName);
            }
        });
    } catch (error) {
        console.error("Lỗi khi xuất phiếu:", error);
        res.status(500).json({ message: "Đã có lỗi xảy ra trong quá trình tải file" });
    }
}

module.exports = { downloadSlip };
