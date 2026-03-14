import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const data = await req.json();

    // 1. Path to the template
    const templatePath = path.join(process.cwd(), "templates", "cctv-letter.html");
    
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    let htmlContent = fs.readFileSync(templatePath, "utf8");

    // 2. Replace placeholders
    const placeholders = [
      "date", "receiver_name", "organization", "address", "phone",
      "officer_name", "officer_address", "court_name", "court_location",
      "cctv_date", "cctv_time", "cctv_location", "mobile", "email"
    ];

    placeholders.forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, data[key] || "________________");
    });

    // 3. Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set content and wait for it to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // 4. Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();

    // 5. Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=CCTV_Request_${data.officer_name || 'Letter'}.pdf`
      },
    });

  } catch (err) {
    console.error("PDF Generation Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
