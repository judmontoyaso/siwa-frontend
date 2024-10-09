export const dynamic = 'force-dynamic'; // defaults to auto
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (
  req: { query: { email: string }; headers: { authorization: string } },
  res: NextApiResponse
) => {
  const { email } = req.query; // Obtener el email de los query params
  const token = req.headers.authorization; // Obtener el token de los headers
  
  try {
    // Hacer la solicitud a la API original
    const response = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/projects_by_email/${email}`, {
      method: 'GET', // Método GET
      headers: {
        'Content-Type': 'application/json', // Cabecera necesaria para JSON
        Authorization: token, // Pasar el token a la API
      },
    });

    if (!response.ok) throw new Error(`Error: ${response.statusText}`);

    const data = await response.json(); // Parsear la respuesta de la API original
    res.status(200).json(data); // Enviar la respuesta al cliente
  } catch (error: any) {
    res.status(500).json({ error: error.message }); // Manejo de errores
  }
};

export default handler;
