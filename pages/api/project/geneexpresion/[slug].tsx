// app/api/proxy/geneexpresion/[slug]/route.ts
export const dynamic = 'force-dynamic'; // defaults to auto
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: {
    body: {
        location?: string;
        variable_col?: string;
        group_ref?: string;
    }; query: { slug: string }; headers: { authorization: string };
}, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any }): void; new(): any } } }) => {
    const { slug } = req.query;
    const token = req.headers.authorization;
    const { location, variable_col, group_ref } = req.body;

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/projects/geneexpresion/${slug}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token,
                },
                body: JSON.stringify({
                    location,
                    variable_col,
                    group_ref,
                }),
            }
        );

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export default handler;
