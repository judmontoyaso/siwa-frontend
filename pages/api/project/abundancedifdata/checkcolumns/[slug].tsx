// app/api/proxy/[slug]/route.ts
export const dynamic = 'force-dynamic' // defaults to auto
import type { NextApiRequest, NextApiResponse } from 'next'

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

    const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/projects/checkcolumns/${slug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token || '',
      } , // Explicitly define the type of headers
      body: JSON.stringify({
        "nickname": nickname,
    }),
    });
    if (!response.ok) {
      const errorBody = await response.text(); // Get response as text to log it
      console.error(`Error Response: ${errorBody}`); // Log the full error response
      throw new Error(`API call failed with status: ${response.status}, Body: ${errorBody}`);
    }
    const data = await response.json();

    res.status(200).json(data);
} catch (error: any) {
    console.error(`Catch Error: ${error.message}`); // Log the error message
    res.status(500).json({ error: error.message });}
}
export default handler