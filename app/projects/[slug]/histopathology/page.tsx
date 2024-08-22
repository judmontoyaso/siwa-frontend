"use client"
import React, { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, use, useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import Layout from '@/app/components/Layout';
import { SidebarProvider } from '@/app/components/context/sidebarContext';
import GraphicCard from '@/app/components/graphicCard';
import Spinner from '@/app/components/pacmanLoader';
import { BreadCrumb } from 'primereact/breadcrumb';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { ToastContainer } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import { Divider } from 'primereact/divider';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Config } from 'plotly.js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MenuItem } from 'primereact/menuitem';
import { useAuth } from '@/app/components/authContext';

interface DataItem {
  Treatment: string;
  OverallArchitecture: string;
  MucosalIntegrity: string;
  LymphoidImmune: string;
  InflammationSeverity: string;
  MicrobialOrganisms: string;
  AdditiveScore: string;
  [key: string]: string;
}




const ScatterPlot = ({ params }: { params: { slug: string } }) => {
  const [data, setData] = useState<any[]>([]);
  
  const [isLoaded, setIsLoaded] = useState(true);
  const [activeIndexes, setActiveIndexes] = useState([0,1]);
  const [isColorByDisabled, setIsColorByDisabled] = useState(true);
  const [colorBy, setColorBy] = useState<string>('samplelocation');
  const [selectedColorBy, setSelectedColorBy] = useState<string>('samplelocation');
  const [colorByOptions, setColorByOptions] = useState([]);
  const [configFile, setconfigFile] = useState({} as any);
  const [columnOptions, setColumnOptions] = useState<string[]>([]);
  const[filterPeticion, setFilterPetition] = useState(false);
  const [theRealColorByVariable, setTheRealColorByVariable] = useState<string>('Treatment');
  const [theRealColorByVariable2, setTheRealColorByVariable2] = useState<string>('Cecum');
  const { accessToken, isLoading, error } = useAuth();
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [result, setResult] = useState<any>();
  const colors = [
    "#092538", "#34675C", "#2E4057", "#FEF282", "#F6C324", "#415a55", "#FFA726", "#FF7043",
    "#BFBFBF", "#8C8C8C", "#616161", "#424242", "#E53935", "#D81B60", "#8E24AA", "#43A047",
    "#00ACC1", "#1E88E5", "#6D4C41", "#FDD835", "#26A69A", "#7E57C2", "#EC407A"
  ];
  const categories: string[] = ['OverallArchitecture', 'MucosalIntegrity', 'LymphoidImmune', 'InflammationSeverity', 'MicrobialOrganisms'];
const [SampleLocation, setSampleLocation] = useState<any>('Cecum');
  const router = useRouter();

  const items = [
      { label: 'Projects', template: (item:any, option:any) => <Link href={`/`} className="pointer-events-none text-gray-500" aria-disabled={true}>Projects</Link>  },
      { label: params.slug, template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}`}>{item.label}</Link> },
    { label: 'Histopathology', template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}/histopathology`}>{item.label}</Link> },
  ];

  const home = { icon: 'pi pi-home', template: (item:any, option:any) => <Link href={`/`}><i className={home.icon}></i></Link>  };





  useEffect(() => {
    if (!result || !result.data) {
        console.error("No hay datos disponibles en result.");
        return;
    }

    const columns = result?.data.columns;
    const rawData = result?.data.data;


    
    // Filtrar y agrupar datos
    const groupedData: { [key: string]: number[] } = {};
    Object.values(rawData).forEach((row: any) => {
        const group = row[columns.indexOf(theRealColorByVariable)];
        const sampleLocation = row[columns.indexOf("SampleLocation")];

        if (sampleLocation !== SampleLocation || group === undefined) {
            return;
        }

        categories.forEach(category => {
            const categoryValue = row[columns.indexOf(category)];

            if (categoryValue !== undefined) {
                const key = `${group}-${category}-${sampleLocation}`;
                
                if (!groupedData[key]) {
                    groupedData[key] = [];
                }

                groupedData[key].push(categoryValue);
            }
        });
    });

    // Calcular medias
    const meanData = Object.keys(groupedData).map((key: string) => {
        const [treatment, category, sampleLocation] = key.split('-');
        const scores = groupedData[key];
        const mean = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
        return { Treatment: treatment, Category: category, SampleLocation: sampleLocation, Mean: mean };
    });

    setData(meanData);
    console.log("mean data", meanData);
    setIsLoaded(true);
}, [result, theRealColorByVariable, SampleLocation]);


const [uniqueSampleLocations, setUniqueSampleLocations] = useState<any[]>([]);
const [resultFirst, setResultFirst] = useState<any>();

useEffect(() => {
    if (!result || !result.data) {
        console.error("No hay datos disponibles en result.");
        return;
    }

    const columns = resultFirst?.data.columns;
    const rawData = resultFirst?.data.data;

    // Obtener el índice de la columna "SampleLocation"
    const sampleLocationIndex = columns.indexOf("SampleLocation");
    if (sampleLocationIndex === -1) {
        console.error("La columna 'SampleLocation' no se encontró en los datos.");
        return;
    }

    // Extraer todas las SampleLocations
    const sampleLocations = rawData.map((row:any) => row[sampleLocationIndex]);

    // Filtrar y obtener solo las SampleLocations únicas
    const uniqueLocations = Array.from(new Set(sampleLocations));
    console.log("uniqueLocations", uniqueLocations);
    // Guardar las SampleLocations únicas en el estado
    setUniqueSampleLocations(uniqueLocations);
    setSampleLocation(uniqueLocations[0]);
}, [result]);


const fetchData = async (token: any, columnIndex: number | undefined) => {

  try {
      const response = await fetch(
          `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/projects/histo/${params.slug}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            
            
          //     "samplelocation": selectedLocations,
          //     "column": selectedColumn,
          //     "columnValues": selectedColumn === 'samplelocation' ? selectedLocations : [...selectedValues],
          //     "nickname": user?.nickname,
          //     "colannova": theRealColorByVariable
          }),

      }
      );
      // if (response.status === 500 && accessToken !== undefined) {
      //     toast.warn('The data needs to be loaded again!', {
      //         position: "top-center",
      //         autoClose: 4000,
      //         hideProgressBar: false,
      //         closeOnClick: true,
      //         pauseOnHover: true,
      //         draggable: true,
      //         progress: undefined,
      //         theme: "light",
      //         transition: Bounce,
      //     });
      //     setTimeout(() => { window.location.href = "/"; }, 5000);
      //     throw new Error("Respuesta no válida desde el servidor");
      // }
      const result = await response.json();
      console.log('result:', result);

      if (Array.isArray(result)) {
        setData(result);
      } else {
        console.error("Fetched data is not an array:", result);
      }
      console.log(result);
      setResult(result);
      setIsLoaded(true);
      setResultFirst(result);

   
  } catch (error) {
      console.error("Error al obtener projectIds:", error);
  }
};


const fetchDataFilter = async (token: any, columnIndex: number | undefined) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/projects/histo/${params.slug}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sample_location: SampleLocation,
          selected_column: selectedColumn,
          selected_values: selectedValues,
        }),
      }
    );

    const result = await response.json();
    console.log('result:', result);
    setResult(result);

    setIsLoaded(true);
  } catch (error) {
    console.error("Error al obtener datos filtrados:", error);
  }
};

const [filteredColumns, setFilteredColumns] = useState([]);

    useEffect(() => {
        if (!result || !result.data) {
            console.error("No hay datos disponibles en result.");
            return;
        }

        const columns = result?.data.columns;

        // Columnas a excluir
        const excludedColumns = ["SampleID", "AdditiveScore", "ResearchNumber"];
        const histoColumns = ['OverallArchitecture', 'MucosalIntegrity', 'LymphoidImmune', 'InflammationSeverity', 'MicrobialOrganisms'];

        // Filtrar las columnas
        const filteredColumnsList = columns.filter((col:any) => 
            !excludedColumns.includes(col) && !histoColumns.includes(col)
        );
        console.log("filteredColumnsList", filteredColumnsList);
        setFilteredColumns(filteredColumnsList);
    }, [result]);

useEffect(() => {
fetchData(accessToken, 0);
}, [accessToken]);


useEffect(() => {

      // Calcular alturas de tratamiento para anotaciones
      const treatmentHeights: { [key: string]: number } = {};
      data?.forEach((item: { Treatment: string; Mean: number }) => {
          if (!treatmentHeights[item.Treatment]) {
              treatmentHeights[item.Treatment] = 0;
          }
          treatmentHeights[item.Treatment] += item.Mean;
      });

      const annotations = Object.entries(treatmentHeights).map(([treatment, height]) => ({
          x: treatment,
          y: height + 1,
          text: ['a', 'b', 'ab'][Math.floor(Math.random() * 3)],
          xanchor: 'center',
          yanchor: 'top',
          showarrow: false,
          font: {
              size: 16,
              color: 'black'
          }
      }));

      setAnnotations(annotations);
  

}, [data]);


  



const dropdownOptionsColorby = filteredColumns
  .filter((option: any) => option !== "SampleLocation") // Filtra la columna SampleLocation
  .map((option: any) => ({
      label: (option.charAt(0).toUpperCase() + option.replace('_', ' ').slice(1)),
      value: option
  }));

  const dropdownOptionsSampleLocation = uniqueSampleLocations
  .map((option: any) => ({
      label: (option.charAt(0).toUpperCase() + option.replace('_', ' ').slice(1)),
      value: option
  }));


  const dropdownOptionsColorby2 = [
    { label: 'Cecum', value: 'Cecum' },
    {label:'Treatment', value:'treatment'}, // Opción predeterminada
    ...colorByOptions
      ?.filter(option => columnOptions?.includes(option)) // Filtra y mapea según tus criterios
      .map(option => ({
          label: (option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1),
          value: option
      }))
  ];
  const[rawData, setRawData] = useState<any[]>([]);



  const [selectedColumn, setSelectedColumn] = useState(null);
  const [uniqueValues, setUniqueValues] = useState([]);

  const handleColumnSelect = (option) => {
    setSelectedColumn(option);
  const rawData = resultFirst?.data.data;
    // Encuentra el índice correcto de la columna en result.data.columns
    const columnIndex = result?.data.columns.indexOf(option);
    if (columnIndex !== -1) {
        
        // Mapea los valores de la columna seleccionada en rawData
        const values = rawData.map(row => row[columnIndex]);
        const uniqueVals = [...new Set(values)];
        setUniqueValues(uniqueVals);
        setSelectedValues([]); 
    }
};

const [selectedValues, setSelectedValues] = useState([]);

const handleValueChange = (value) => {
  setSelectedValues((prevValues) =>
      prevValues.includes(value)
          ? prevValues.filter((v) => v !== value) // Eliminar si ya está seleccionado
          : [...prevValues, value] // Agregar si no está seleccionado
  );
};
 

    const onTabChange = (e : any) => {
        setActiveIndexes(e.index);  // Actualiza el estado con los índices activos
    };
const filter = (
  <div className={`flex flex-col w-full rounded-lg  dark:bg-gray-800 `}>
 <Accordion multiple activeIndex={activeIndexes} onTabChange={onTabChange} className="filter">    
    <AccordionTab header="Color by" className="colorby-acordeon" >
  

              <div>

              <Dropdown
    value={theRealColorByVariable}
    options={dropdownOptionsColorby}
    onChange={(e) => setTheRealColorByVariable(e.target.value)}
    optionLabel="label"
    className="w-full"
    />
             <Dropdown
    value={SampleLocation}
    options={dropdownOptionsSampleLocation}
    onChange={(e) => setSampleLocation(e.target.value)}
    optionLabel="label"
    className="w-full"
    />

      

        </div>
        </AccordionTab>
        <AccordionTab header="Filter by" className="filter-acordeon">
            <div className="flex flex-col items-left mt-2 mb-4">
                <h3 className="mb-5 text-lg font-semibold text-gray-700 dark:text-white">
                    Select a Sample Location
                </h3>
            </div>

            <div className="mt-8 mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white my-tooltip whitespace-pre">
                    Filtering options
                    <AiOutlineInfoCircle
                        className="text-sm mb-1 cursor-pointer text-siwa-blue inline-block"
                        data-tip
                        data-for="interpreteTip"
                        id="group"
                    />
                </h3>
                <Tooltip
                    style={{
                        backgroundColor: "#e2e6ea",
                        color: "#000000",
                        zIndex: 50,
                        borderRadius: "12px",
                        padding: "8px",
                        textAlign: "center",
                        fontSize: "16px",
                        fontWeight: "normal",
                        fontFamily: "Roboto, sans-serif",
                        lineHeight: "1.5",
                        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                    }}
                    anchorSelect="#group"
                >
                    <div className={`prose single-column w-28 z-50`}>
                        <p>Select options to include in the plot.</p>
                    </div>
                </Tooltip>

                <ul className="w-full flex flex-wrap items-center content-center justify-around">
                    {filteredColumns
                        .filter(option => option !== "SampleLocation")
                        .map((option, index) => (
                            <li className="w-48 xl:m-2 md:m-0 xl:mb-1 md:mb-2 p-1" key={index}>
                                <input
                                    type="radio"
                                    id={option}
                                    name="filteredColumn"
                                    className="hidden peer"
                                    value={option}
                                    checked={selectedColumn === option}
                                    onChange={() => handleColumnSelect(option)}
                                />
                                <label
                                    htmlFor={option}
                                    className={`flex items-center justify-center w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-siwa-blue peer-checked:text-white cursor-pointer hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
                                >
                                    <div className="block">
                                        <div className="w-full">
                                            {(option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1)}
                                        </div>
                                    </div>
                                </label>
                            </li>
                        ))}
                </ul>
            </div>

            <div className="mt-4">
                {selectedColumn && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-white">
                            Unique Values for {selectedColumn}:
                        </h3>
                        <ul className="mt-2">
                            {uniqueValues.map((value, index) => (
                                <li key={index} className="text-gray-700 dark:text-white">
                                    <input
                                        type="checkbox"
                                        id={`value-${index}`}
                                        name={`value-${index}`}
                                        value={value}
                                        checked={selectedValues.includes(value)}
                                        onChange={() => handleValueChange(value)}
                                        className="mr-2"
                                    />
                                    <label htmlFor={`value-${index}`}>{value}</label>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <Divider className="mt-0" />
            <div className="flex w-full items-center justify-center my-4">
                <Button
 onClick={() => {
  console.log("filter", selectedColumn, selectedValues);
  setFilterPetition(true);
  fetchDataFilter(accessToken, 0);  // Llama a fetchData con los filtros aplicados
}}                    loading={false}
                    iconPos="right"
                    icon="pi pi-check-square"
                    loadingIcon="pi pi-spin pi-spinner"
                    className="max-w-56 justify-center filter-apply p-button-raised bg-siwa-green-1 hover:bg-siwa-green-3 text-white font-bold py-2 px-10 rounded-xl border-none"
                    label="Apply Filters"
                />
            </div>
        </AccordionTab>
          </Accordion>
  </div>
  );

  const config: Partial<Config> = {
    displaylogo: false,
    responsive: true,
    displayModeBar: false,
    modeBarButtonsToRemove: [
      'zoom2d', 'pan2d', 'select2d', 'lasso2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'zoom3d', 
      'pan3d', 'orbitRotation', 'tableRotation', 'resetCameraDefault3d', 'resetCameraLastSave3d', 
      'hoverClosest3d', 'zoomInGeo', 'zoomOutGeo', 'resetGeo', 'hoverClosestGeo', 'sendDataToCloud', 'hoverClosestGl2d', 'hoverClosestPie', 
      'toggleHover', 'toggleSpikelines', 'resetViewMapbox'
    ],
    scrollZoom: false,

    modeBarButtonsToAdd: [],
  };

  return (

    <div className="w-full h-full">
    <SidebarProvider>
    <Layout slug={'PFF24'} filter={""} breadcrumbs={<BreadCrumb model={items as MenuItem[]} home={home}  className="text-sm"/>}>
      {isLoaded ? (
<div className="flex flex-col w-11/12 mx-auto">
<div className="flex flex-row w-full text-center justify-center items-center">
<h1 className="text-3xl my-5 mx-2">Histopathology</h1>

      </div>
    <div className="px-6 py-8">

    <div className={`prose single-column`}>
  <p className="text-gray-700 text-justify text-xl">

We evaluated the physical structures of the intestinal tract tissue to understand the impact of Calcium levels on gastrointestinal inflammation and integrity. We employ a scoring system that allows for semi-quantitative analysis of the integrity and inflammatory status of the gut. A score of 0 indicates a normal, healthy gut with no appearance of damage or aberration. A score of 5 for a given metric indicates extreme damage or aberration in the traits being evaluated. Bars with different letters are significantly different based on Tukey test.

The treatment with recommended levels of Ca (MediumLow) with VitD showed better gastrointestinal tissue health compared to the rest of the groups, particularly those with higher levels of Calcium.
  </p>
</div>


  </div>
<div className="flex">
  <GraphicCard legend={""} filter={filter} title={"Histopathology scores aggregated by Treatment - Cecum"}>

      <div className="w-full flex flex-col content-center text-center items-center">
      <Plot
    data={categories?.map((category, index) => ({
        x: (data as { Treatment: string; Category: string; Mean: number; }[])?.filter(item => item.Category === category).map(item => item.Treatment),
        y: (data as { Treatment: string; Category: string; Mean: number; }[])?.filter(item => item.Category === category).map(item => item.Mean),
        name: category,
        type: 'bar',
        marker: { color: colors[index % colors.length] },
    }))}
    config={config}
    layout={{
        barmode: 'stack',
        showlegend: true,
        legend: {
            orientation: "h",
            x: 0.5,
            xanchor: "center",
            y: 1.1,
            yanchor: "top",
            itemsizing: 'constant',
            font: { size: 11 }
        },
        width: 800,
        height: 600,
        xaxis: { title: 'Treatment', position: -2, tickangle: -45, tickfont: { size: 10 } },
        margin: { l: 50, r: 50, b: 100, t: 0, pad: 4 },
        yaxis: { title: 'Mean Additive Score' },
        dragmode: false,
        annotations: annotations.map(annotation => ({
            ...annotation,
            font: { size: 10, color: 'black' },
            xanchor: 'center' as 'center' | undefined,
            yanchor: 'top' as 'top' | 'auto' | 'middle' | 'bottom' | undefined
        }))
    }}
/>


        <div className="w-full flex flex-row ">
                         
                         <div className="px-6 py-8 w-full" >
                             <div className="grid gap-10" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        
                                       <div  className="col-span-2">
                                         <p className="text-gray-700 m-3 text-justify text-xl">Letters indicate significantly different groups as calculated by Tukey test. There is a significant effect of treatment on the mean additive score: MedLow+VitD has the lowest score, indicating the lowest level of abnormality or damage.</p>
                                       </div>
                              
                             </div>
                             <div className="prose flex flex-row flex-wrap">
                                 {Object.entries(configFile?.betadiversity?.graph || {}).map(([key, value]) => {
                                     if (key === selectedColorBy && key !== "samplelocation") {
                                         if (typeof value === 'string' && value !== null) {
                                             return (  <div key={key} className="col-span-2">
                                             <p className="text-gray-700 m-3 text-justify text-xl">{value}</p>
                                           </div>);
                                         } 
                                     }
                                     return null;
                                 })}
                             </div>
                         </div>
                     </div>
      </div>
   
  </GraphicCard>
</div>


</div>

      ) : (
        <div className="w-full h-full"><Spinner/></div>
        )}
      <ToastContainer />
    </Layout>
    </SidebarProvider>
  </div>





    // <Layout slug={''} filter={undefined} breadcrumbs={undefined}>
   
    // </Layout>

  );
};

export default ScatterPlot
