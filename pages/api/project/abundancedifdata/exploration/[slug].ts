// app/api/proxy/[slug]/route.ts
export const dynamic = 'force-dynamic'; // defaults to auto
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: {
    body: {
        column: { column: any; };
        group: { group: any; };
        taxa_rank: { taxa_rank: any; }; 
        columnValues: { columnValues: any; };
        nickname: { nickname: any; };
        samplelocation: { selectedLocations: any; }; selectedLocations: any; selectedColumn: any; 
    }; query: { slug: any; }; headers: { authorization: any; };
}, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any; }): void; new(): any; }; }; }) => {    const { slug } = req.query;
    const token = req.headers.authorization;
    const nickname  = req.body.nickname;

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/projects/abundancedifdata/${slug}/checktempfile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token || '', // Ensure Authorization header is not undefined
            },
            body: JSON.stringify({
                "nickname": nickname,
            }),

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
