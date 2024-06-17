"use client";

import Layout from "@/app/components/Layout";
import { Checkbox } from "primereact/checkbox";
import { Message } from "primereact/message";
import { MultiSelect } from "primereact/multiselect";
import { OrderList } from "primereact/orderlist";
import { useEffect, useState } from "react";
import ReactJson from "react-json-view";


const Home: React.FC<{ params: { slug: string } }> = ({ params }) => {
    const [defaultColumns, setDefaultColumns] = useState<string[]>([]);
    const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "SampleLocation",  // Asegúrate de ponerlo siempre al inicio
    ...defaultColumns.filter(c => c !== "SampleLocation"),
]);
const [jsonData, setJsonData] = useState<any>(null);
const [columnsToRemove, setColumnsToRemove] = useState<string[]>([]);
const [columns, setColumns] = useState<string[]>([]);
const [includeHysto, setIncludeHysto] = useState(false);
const [includeGeneExpression, setIncludeGeneExpression] = useState(false);
const [options, setOptions] = useState([

  ]);

  const handleRemoveColumns = (event: { value: string[] }) => {
    const newColumnsToRemove = event.value;
    setColumnsToRemove(newColumnsToRemove);

    // Encuentra las columnas que fueron eliminadas del filtro de eliminación
    const removedFromFilter = columnsToRemove.filter(col => !newColumnsToRemove.includes(col));

    // Actualiza las columnas seleccionadas, añadiendo las que se eliminaron del filtro
    setSelectedColumns(prevColumns => {
        // Filtra para evitar duplicados y asegura que 'samplelocation' se mantenga al inicio
        const filteredColumns = prevColumns.filter(col => !newColumnsToRemove.includes(col));
        const newSelectedColumns = [...filteredColumns, ...removedFromFilter].filter((v, i, a) => a.indexOf(v) === i);
        // Garantiza que 'samplelocation' siempre esté al principio si aún es relevante
        return newSelectedColumns.includes('SampleLocation')
            ? ['SampleLocation', ...newSelectedColumns.filter(col => col !== 'SampleLocation')]
            : newSelectedColumns;
    });
};


useEffect(() => {
    // Función para cargar las columnas desde el backend
    const fetchColumns = async () => {
    try {
        const response = await fetch('http://localhost:8000/unique-value-columns'); // Asegúrate de que esta URL es correcta
        const data = await response.json();
        if (data.columns_with_multiple_unique_values) {
// Filtrar para evitar duplicados con las que ya están por defecto
        const newColumns = data.columns_with_multiple_unique_values

  // Actualizar las opciones con las nuevas columnas
        const newOptions = newColumns.map((col: string) => ({
        label: col.charAt(0).toUpperCase() + col.slice(1),  // Capitalizar la etiqueta
        value: col
  }));

  // Agregar nuevas opciones al estado de opciones
        setOptions(newOptions);
  
  // Actualizar el estado de las columnas seleccionadas, manteniendo 'samplelocation' al inicio
  setSelectedColumns(prevColumns => [
    'SampleLocation',  // Aseguramos que 'SampleLocation' siempre esté al inicio
    ...defaultColumns.filter(col => col !== 'SampleLocation'),  // Eliminamos 'SampleLocation' si ya estaba
    ...newColumns
  ]);
};            console.log(data.columns_with_multiple_unique_values);
        } 
    catch (error) {
        console.error('Error al cargar las columnas:', error);
    }
    };

    fetchColumns();
}, [defaultColumns]);




useEffect(() => {
    // Función para cargar las columnas desde el backend
    const fetchColumns = async () => {
    try {
        const response = await fetch('http://localhost:8000/unique-value-columns-default'); 
        const data = await response.json();
           console.log(data.columns_with_multiple_unique_values);
           setDefaultColumns(data.columns_with_multiple_unique_values);
        } 
    catch (error) {
        console.error('Error al cargar las columnas:', error);
    }
    };

    fetchColumns();
}, []);


const handleSubmit = async () => {


    const columnsToSend = selectedColumns.filter(c => c !== "SampleLocation");
    if (selectedColumns.includes("SampleLocation")) {
    columnsToSend.push("SampleLocation");
    }
    const response = await fetch("http://localhost:8000/generate-json/", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ columns: {column_names: columnsToSend},  include_hysto: {hysto:includeHysto}, include_gene_expression: {gene_expression:includeGeneExpression}}),
    });
    const jsonData = await response.json();
    setJsonData(jsonData);
};

const itemTemplate = (item: string) => {
    // Modificar visualmente samplelocation para indicar que no se puede mover
    return (
    <div className={`flex items-center ${item === "SampleLocation" ? "no-move" : ""}`}>
        {item}
    </div>
    );
};

const downloadJson = () => {
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.json";
    link.click();
};

return (
    <Layout  slug={""} filter={undefined} breadcrumbs={undefined}>
    <div className="p-8">
    <h2 className="text-3xl font-bold mb-4">ConfigFile Generator {params.slug }</h2>
<p className="text-lg text-gray-700 mt-4 mb-4">Generates a JSON with the chosen configuration, which you can download once generated.</p>

    <div className="mb-4 mt-4 flex flex-col text-start justify-start content-start">
    <Message severity="info" text="Select the columns you want to remove from the report. 'Sample Location', 'Age', and 'Treatment' are included by default and do not appear in this list. Only columns with more than one unique value are displayed as options. 'Age' and 'Treatment' are included in the JSON only if they have more than one unique value." />

        <MultiSelect
        value={columnsToRemove}
        options={options}
        onChange={handleRemoveColumns}
        placeholder="Columns to Remove"
        display="chip"
        className="w-auto mx-auto mb-4 mt-4"
        optionLabel="label"
        />
    </div>
    <div className="flex items-center mb-4">
        <Checkbox
            inputId="includeHysto"
            onChange={e => setIncludeHysto(e.checked ?? false)}
            checked={includeHysto}
        />
        <label htmlFor="includeHysto" className="ml-2">Incluir Hysto</label>
    </div>

            <div className="flex items-center mb-4">
                <Checkbox
                    inputId="includeGeneExpression"
                    onChange={e => setIncludeGeneExpression(e.checked ?? false)}
                    checked={includeGeneExpression}
                />
                <label htmlFor="includeGeneExpression" className="ml-2">Incluir Gene Expression</label>
            </div>

    <div className="mb-4 mt-4 flex flex-col text-start justify-start content-start">

    <Message severity="info" className="mt-4 mb-4" text="Here you can modify the order of the columns as you wish. 'Sample Location' will always be at the beginning and cannot be moved." />
</div>
    <OrderList
        value={selectedColumns}
        itemTemplate={itemTemplate}
        header="Selected Columns"
        listStyle={{ maxHeight: "250px" }}
        dragdrop
        dataKey="value"
        onChange={(e) => {
            const newColumns = e.value.filter((c: string) => c !== "SampleLocation");
            if (!newColumns.includes("SampleLocation")) {
            newColumns.unshift("SampleLocation");
            }
            setSelectedColumns(newColumns);
        }}        className="mb-4"
    />

    <button
        onClick={handleSubmit}
        className="mt-4 mb-4 p-2 bg-blue-500 text-white rounded"
    >
        Generate JSON
    </button>

    {jsonData && (
        <div className="mt-4 mb-4">
        <ReactJson src={jsonData} theme="monokai" />
        <button
            onClick={downloadJson}
            className="mt-4 mb-4 p-2 bg-green-500 text-white rounded"
        >
            Download JSON
        </button>
        </div>
    )}
    </div>
    </Layout>
);
}



export default Home;