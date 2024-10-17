// app/api/proxy/[slug]/route.ts
export const dynamic = 'force-dynamic'; // defaults to auto
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { slug } = req.query;
    const token = req.headers.authorization;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/admin/projects/`, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: token || '',
            },
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export default handler;
