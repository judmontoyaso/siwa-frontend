// app/api/proxy/modules/[projectId]/route.ts
export const dynamic = 'force-dynamic' // defaults to auto
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { slug } = req.query;
      const token = req.headers.authorization;
  try {
    // Realiza la solicitud al endpoint de estadísticas de módulos
    const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/modules/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token || "",
      },
    });

    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export default handler;
