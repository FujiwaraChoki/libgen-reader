import fetchBooks from "../../lib/fetchBooks";

import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { bookName } = req.body;

    if (!bookName) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

    const books = await fetchBooks(bookName);

    return res.status(200).json({
      success: true,
      data: { books },
    });
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
};

export default handler;
