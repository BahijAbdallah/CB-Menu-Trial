import { Request, Response } from "express";
import { appendClientReview } from "./google-sheets";

const allowedSources = [
  "Facebook Ads",
  "Instagram Ads",
  "TikTok Ads",
  "Word of Mouth",
  "Billboards",
  "Google",
];

export async function createClientReview(req: Request, res: Response) {
  try {
    const { fullName, phone, source, rating, comment } = req.body;

    if (!phone || !/^(03|70|71|76|78|79|81)\d{6}$/.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone number",
      });
    }

    if (!source || !allowedSources.includes(source)) {
      return res.status(400).json({
        message: "Invalid source of recognition",
      });
    }

    const row = [
      new Date().toLocaleString("en-GB"),
      fullName || "",
      phone,
      source,
      rating || "",
      comment || "",
    ];

    await appendClientReview(row);

    return res.status(201).json({
      message: "Review submitted successfully",
    });
  } catch (error) {
    console.error("Client review error:", error);

    return res.status(500).json({
      message: "Failed to submit review",
    });
  }
}
