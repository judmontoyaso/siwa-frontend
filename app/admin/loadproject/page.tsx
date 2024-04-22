"use client";
import Layout from '@/app/components/Layout';
import { SidebarProvider } from '@/app/components/context/sidebarContext';
import Link from 'next/link';
import React from 'react';

const Page = () => {
  const proyectos = [
    { id: 'E335', estado: 'Activo' },
    { id: 'E346', estado: 'Inactivo' }
  ];

  return (
    <div>
      <SidebarProvider>
        <Layout slug={''} filter={undefined}  breadcrumbs={""}>

          <div className="p-5">
            <h1 className="text-2xl font-bold mb-5">Proyectos</h1>
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">ID del Proyecto</th>
                  <th className="px-4 py-2 border">Estado</th>
                </tr>
              </thead>
              <tbody>
                {proyectos.map((proyecto, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">                <Link href={`/admin/loadproject/${proyecto.id}`}>
                      {proyecto.id}
                    </Link></td>
                    <td className="border px-4 py-2">
                      <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold text-white ${proyecto.estado === 'Activo' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {proyecto.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Layout>
      </SidebarProvider>
    </div>
  );
}

export default Page;
