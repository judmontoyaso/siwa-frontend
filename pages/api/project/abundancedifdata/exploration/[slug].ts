// app/api/proxy/[slug]/route.ts
export const dynamic = 'force-dynamic'; // defaults to auto
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { slug } = req.query;
    const token = req.headers.authorization;

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/projects/abundancedifdata/${slug}/checktempfile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token || '', // Ensure Authorization header is not undefined
            },
        });

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

        const data = await response.json();
        res.status(200).json(data);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export default handler;
