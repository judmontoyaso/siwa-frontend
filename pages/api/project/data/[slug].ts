// app/api/proxy/[slug]/route.ts
export const dynamic = 'force-dynamic'; // defaults to auto
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (
  req: { query: { slug: any }; headers: { authorization: any }; body: string },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { error: any }): void; new (): any };
    };
  }
) => {
  const { slug } = req.query;
  const token = req.headers.authorization;
  const animaltype  = req.body; // Get animaltype from the request body
  console.log('________');
  console.log(animaltype);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/projects/${slug}`, {
      method: 'POST', // If you're sending a body, it should be POST
      headers: {
        'Content-Type': 'application/json', // Ensure content type is set to JSON
        Authorization: token,
      },
      body: JSON.stringify({
        animaltype, // Include animaltype in the body
      }),
    });

    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export default handler;
