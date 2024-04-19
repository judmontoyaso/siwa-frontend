
// app/api/proxy/[slug]/route.ts
export const dynamic = 'force-dynamic' // defaults to auto
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: {
    body: {
        column: { column: any; };
        columnValues: { columnValues: any; };
        samplelocation: { selectedLocations: any; }; nickname:any; colannova:any; selectedLocations: any; selectedColumn: any;
    }; query: { slug: any; }; headers: { authorization: any; };
}, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any; }): void; new(): any; }; }; }) => {
    const { slug } = req.query;
    const token = req.headers.authorization;
    const selectedLocations = req.body.samplelocation;
    const column = req.body.column;
    const columnValues = req.body.columnValues;
    const nickname = req.body.nickname;
    const colannova = req.body.colannova;
    console.log("________")
    console.log(req.body.samplelocation, token)
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/projects/process_anova/${slug}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify({
                "samplelocation": selectedLocations,
                "column": column,
                "columnValues": columnValues,
                "nickname": nickname,
                "colannova": colannova
            }),

        }
        );

        console.log(response)
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
export default handler