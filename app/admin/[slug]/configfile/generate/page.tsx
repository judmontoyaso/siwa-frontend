"use client"
import Layout from '@/app/components/Layout';
import { MultiSelect } from 'primereact/multiselect';
import React, { useState } from 'react';
import ReactJson from 'react-json-view'

export default function Home() {
    const [selectedColumns, setSelectedColumns] = useState([]);
    // Define default columns that are always to be sent but not shown in the select.
    const defaultColumns = ['age', 'treatment', 'samplelocation'];

    const [jsonData, setJsonData] = useState(null);

    const handleColumnChange = (event: { value: React.SetStateAction<never[]>; }) => {
        // Update only the user-selectable columns
        setSelectedColumns(event.value);
    };
        const handleSubmit = async () => {
            // Combine default columns with selected columns for the fetch request
            const columnsToSend = Array.from(new Set([...defaultColumns, ...selectedColumns]));
            const response = await fetch('http://localhost:8000/generate-json/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ column_names: columnsToSend })
            });
            const jsonData = await response.json();
            setJsonData(jsonData);
            console.log(jsonData);
        };

      const columns = [
        { label: 'Timepoint', value: 'timepoint' },
        { label: 'Group', value: 'group' },
        { label: 'Hysto', value: 'hysto' }
      ];
    

  

  return (
    <Layout slug={''} filter={undefined} breadcrumbs={undefined}>
             <div>
        <MultiSelect
            value={selectedColumns}
            options={columns}
            onChange={handleColumnChange}
            placeholder="Select columns"
            display="chip"
        />
        <button onClick={handleSubmit}>Generate JSON</button>
        {jsonData && <ReactJson theme={'monokai'} src={jsonData} />}

    </div>
    </Layout>
   
  );
}
