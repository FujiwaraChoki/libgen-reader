import generateImage from '../../lib/generateImage';

import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: 'Prompt is required',
            });
        }

        try {
            const response = await generateImage(prompt);

            if (!response.success) {
                return res.status(400).json({
                    success: false,
                    message: response.message,
                });
            }

            return res.status(200).json({
                success: true,
                data: response.data,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate image',
            });
        }
    }

    return res.status(405).json({
        success: false,
        message: 'Method Not Allowed',
    });
};

export default handler;
