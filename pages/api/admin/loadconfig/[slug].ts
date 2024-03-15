

// app/api/proxy/[slug]/route.ts
export const dynamic = 'force-dynamic' // defaults to auto
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: {
    body: any; query: { slug: any; }; headers: { authorization: any; }; 
}, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: any; }): void; new(): any; }; }; }) => {
    const { slug } = req.query;
    const token = req.headers.authorization;
    const body =  req.body;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/admin/uploadconfigfile/${slug}`, {
        method: 'POST',
        headers: {
            // Incluye el token de Auth0 en los encabezados de la solicitud
            'Authorization': token
        },
        body: body,
    });
    
console.log(response)
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    const data = await response.json();

    res.status(200).json(data);
} catch (error: any) {
    res.status(500).json({ error: error.message });
}
}
export default handler