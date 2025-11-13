export const runtime = "nodejs";

import nodemailer from "nodemailer";
// import { generateInvoicePDF } from "@/lib/pdf";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const status = searchParams.get("status");
  const price = searchParams.get("price");
  const name = searchParams.get("name") || "Valued Customer"; // Optional name param


  if (!email || !status) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }


  if (status === "decline") {
    return new NextResponse(
      `<html><body style="font-family:Arial; text-align:center; padding:50px;">
         <h2 style="color:red;">❌ Registration Declined</h2>
         <p>The registration for <b>${email}</b> has been declined.</p>
       </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  try {
    // Prepare invoice price and generate PDF
    // const invoicePrice = price ? Number(price) : 0;
    // const pdfBuffer = await generateInvoicePDF(name, email, invoicePrice, addOn );

    //Configure mail transporter (Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const date = new Date().toLocaleDateString("en-IN");
    const time = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const dateTime = `${date} — ${time}`;

    await transporter.sendMail({
      from: `"TirthGhumo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your TirthGhumo One-Day Trek Booking is Confirmed! ",
      html: `
        <div style="font-family:Arial, sans-serif; line-height:1.6; padding:20px;">
          <h2 style="color:#ff6600;">Hey ${name} 🌿</h2>
          <p>
            Great news — your booking for the <b>1Day Adventure Trek</b> with TirthGhumo is <b>confirmed!</b> 

          </p>
          <pYour payment has been received successfully on <b>Date:</b> ${dateTime}</p> 
          <p>
            All essential trip details, including timings and instructions, will be shared shortly on WhatsApp.
            Please make sure you’ve requested to join the WhatsApp group, as all updates will be shared there.
            </br>
            If you need any help or have questions, feel free to contact us at <b>6260499299</b>.
            </br>
            Get ready for an exciting adventure and a day full of unforgettable memories!
            </br>
            Warm regards,
            Team TirthGhumo
          </p>
          <p>Thank you for choosing <b>TirthGhumo</b> — Aastha Bhi, Suvidha Bhi 🌄</p>
        </div>
      `,
      
    });

    //Confirmation page for admin
    return new NextResponse(
      `<html><body style="font-family:Arial; text-align:center; padding:50px;">
        <h2 style="color:green;">...Approved Successfully!</h2>
        <p>Invoice of <b>${price}</b> has been sent to <b>${email}</b>.</p>
        <p>Thank you for confirming this registration.</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (error) {
    console.error("❌ Error sending invoice:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
