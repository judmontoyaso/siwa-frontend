"use client"

import Layout from "@/app/components/Layout";
import ConfigForm from "@/app/components/configForm";

const Home: React.FC<{ params: { slug: string } }> = ({ params }) => {
  const handleSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    // Aquí puedes hacer algo con el JSON, como enviarlo a una API.
  };

  return (
    <Layout  slug={params.slug} filter={undefined} breadcrumbs={undefined}>
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-semibold mb-4">ConfigFile Form</h1>
      <ConfigForm onSubmit={handleSubmit as (data: any) => void} slug={params.slug} />
    </div>
    </Layout>
  );
};

export default Home;
