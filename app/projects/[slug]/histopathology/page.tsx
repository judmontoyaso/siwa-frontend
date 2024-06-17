"use client"
import React, { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react';
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
  const [theRealColorByVariable, setTheRealColorByVariable] = useState<string>('samplelocation');
  const [theRealColorByVariable2, setTheRealColorByVariable2] = useState<string>('Cecum');

  const colors = [
    "#092538", "#34675C", "#2E4057", "#FEF282", "#F6C324", "#415a55", "#FFA726", "#FF7043",
    "#BFBFBF", "#8C8C8C", "#616161", "#424242", "#E53935", "#D81B60", "#8E24AA", "#43A047",
    "#00ACC1", "#1E88E5", "#6D4C41", "#FDD835", "#26A69A", "#7E57C2", "#EC407A"
  ];

  const router = useRouter();

  const items = [
      { label: 'Projects', template: (item:any, option:any) => <Link href={`/`} className="pointer-events-none text-gray-500" aria-disabled={true}>Projects</Link>  },
      { label: params.slug, template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}`}>{item.label}</Link> },
    { label: 'Histopathology', template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) =>   <Link href={`/projects/${params.slug}/histopathology`}>{item.label}</Link> },
  ];

  const home = { icon: 'pi pi-home', template: (item:any, option:any) => <Link href={`/`}><i className={home.icon}></i></Link>  };





  useEffect(() => {
    async function fetchData() {
        const response = await fetch('/full_samples_table.csv');
        const text = await response.text();
        const result = Papa.parse(text, { header: true });

        const originalAllowedTreatments = ['HighCa', 'HighCa+MediumAlphaD3', 'LowCa', 'LowCa+HighAlphaD3',
            'MediumHighCa', 'MediumHighCa+MediumAlphaD3', 'MediumLowCa', 'MediumLowCa+HighAlphaD3'];

        const allowedTreatments = originalAllowedTreatments.flatMap(treatment => [
            treatment.replace(/MediumAlphaD3|HighAlphaD3/g, 'VitD'),
            treatment
        ]);

        const rank: { [key: string]: number } = { Low: 1, Medium: 2, High: 3 };

        const filteredData = result.data.filter((row: { SampleLocation: string; Treatment: string; }) => {
            if (row.SampleLocation !== 'C') {
                return false;
            }
            const modifiedTreatment = row.Treatment.replace(/MediumAlphaD3|HighAlphaD3/g, 'VitD');
            if (!allowedTreatments.includes(modifiedTreatment)) {
                return false;
            }
            row.Treatment = modifiedTreatment;
            return true;
        }).sort((a: { Treatment: string; }, b: { Treatment: string; }) => {
            const getRank = (treatment: string): number => {
                const match = treatment.match(/Low|Medium|High/);
                if (match && match[0] in rank) {
                    return rank[match[0]];
                }
                return 0;
            };

            const rankA = getRank(a.Treatment);
            const rankB = getRank(b.Treatment);

            return rankA - rankB;
        });


        // Agrupar datos por tratamiento y categoría
        const groupedData: any = {};
                filteredData.forEach((item: DataItem) => {
            categories.forEach(category => {
                const key = `${item.Treatment}-${category}`;
                if (!groupedData[key]) {
                    groupedData[key] = [];
                }
                groupedData[key].push(parseFloat(item[category]));
            });
        });

        // Calcular medias
        const meanData = Object.keys(groupedData).map(key => {
            const [treatment, category] = key.split('-');
            const scores = groupedData[key];
            const mean = scores.reduce((sum: any, score: any) => sum + score, 0) / scores.length;
            return { Treatment: treatment, Category: category, Mean: mean };
        });

        setData(meanData);
        setIsLoaded(true);
    }

    fetchData();
}, []);




  const categories: string[] = ['OverallArchitecture', 'MucosalIntegrity', 'LymphoidImmune', 'InflammationSeverity', 'MicrobialOrganisms'];
      // Calcular alturas de tratamiento para anotaciones
      const treatmentHeights: { [key: string]: number } = {};
      data.forEach((item: { Treatment: string; Mean: number }) => {
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
  

  useEffect(() => {console.log(annotations);}, [annotations]);


  const dropdownOptionsColorby = [
    { label: 'Sample Location', value: 'samplelocation' },
    {label:'Treatment', value:'treatment'}, // Opción predeterminada
    ...colorByOptions
      ?.filter(option => columnOptions?.includes(option)) // Filtra y mapea según tus criterios
      .map(option => ({
          label: (option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1),
          value: option
      }))
  ];


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
    // onChange={(e) => handleGroupChange(e.target.value)}
    optionLabel="label"
    className="w-full"
    />


      

        </div>
        </AccordionTab>
              <AccordionTab header="Filter by"  className="filter-acordeon" >
      <div className="flex flex-col items-left  mt-2 mb-4">

      <h3 className="mb-5 text-lg font-semibold text-gray-700 dark:text-white">Select a Sample Location</h3>
   
        

      <Dropdown
    value={theRealColorByVariable2}
    options={dropdownOptionsColorby2}
    // onChange={(e) => handleGroupChange(e.target.value)}
    optionLabel="label"
    className="w-full"
    />
      </div>  
    
      <div className=" mt-8 mb-4">

     
    <h3 className="text-lg font-semibold text-gray-700 dark:text-white my-tooltip whitespace-pre">
      Filtering <span>options <AiOutlineInfoCircle className="text-sm mb-1 cursor-pointer text-siwa-blue inline-block" data-tip data-for="interpreteTip" id="group" /></span>
    </h3>     
                                  <Tooltip
                                      style={{ backgroundColor: "#e2e6ea", color: "#000000", zIndex: 50, borderRadius: "12px", padding: "8px", textAlign: "center", fontSize: "16px", fontWeight: "normal", fontFamily: "Roboto, sans-serif", lineHeight: "1.5", boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" }}
                                      anchorSelect="#group">
                                      <div className={`prose single-column w-28 z-50`}>
                                          <p>Select options to include in the plot.</p>
                                       
                                      </div>
                                  </Tooltip>
                                  
                                           <ul className="w-full flex flex-wrap items-center content-center justify-around">
          <li className="w-48 xl:m-2 md:m-0 xl:mb-1 md:mb-2 p-1">
            <input type="radio" id="samplelocation" name="samplelocation" value="samplelocation" className="hidden peer" required checked={isColorByDisabled ? true : colorBy === 'samplelocation'}
            //   onChange={handleLocationChangeColorby}
              disabled={isColorByDisabled} />
            <label htmlFor="samplelocation" className={`flex items-center justify-center w-full p-1 text-center text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700  dark:peer-checked:text-white peer-checked:border-siwa-blue peer-checked:text-white  ${colorBy === selectedColorBy ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"} ${isColorByDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'}  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
              <div className="block">
                <div className="w-full text-center flex justify-center">Sample location</div>
              </div>
            </label>
          </li>
          <li className="w-48 xl:m-2 md:m-0 xl:mb-1 md:mb-2 p-1">
            <input type="radio" id="treatment" name="treatment" value="treatment" className="hidden peer" checked={isColorByDisabled ? false : colorBy === 'treatment'}
            //   onChange={handleLocationChangeColorby}
              disabled={isColorByDisabled} />
            <label htmlFor="treatment" className={`flex items-center justify-center w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-white peer-checked:border-siwa-blue peer-checked:text-white ${colorBy === selectedColorBy ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"} ${isColorByDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'}  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
              <div className="block">
                <div className="w-full">Treatment</div>
              </div>
            </label>
          </li>
         { columnOptions?.includes("age" as never) && (
          <li className="w-48 xl:m-2 md:m-0 xl:mb-1 md:mb-2 p-1">
          <input type="radio" id="age" name="age" value="age" className="hidden peer" checked={isColorByDisabled ? false : colorBy === 'age'}
            //   onChange={handleLocationChangeColorby} 
              />
            <label htmlFor="age" className={`flex items-center justify-center w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400  peer-checked:border-siwa-blue peer-checked:text-white ${colorBy === selectedColorBy ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"}  cursor-pointer hover:text-gray-600 hover:bg-gray-100  dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}>
              <div className="block">
                <div className="w-full">Age</div>
              </div>
            </label>
          </li>)}
          {colorByOptions?.map((option, index) => (
            <li className="w-48 xl:m-2 md:m-0 xl:mb-1 md:mb-2 p-1" key={index}>
              <input
                type="radio"
                id={option}
                name={option}
                className="hidden peer"
                value={option}
                checked={isColorByDisabled ? false : colorBy === option}
                // onChange={handleLocationChangeColorby}
                disabled={isColorByDisabled}
              />
              <label
                htmlFor={option}
                className={`flex items-center justify-center ${isColorByDisabled
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer hover:text-gray-600 hover:bg-gray-100'
                  } w-full p-1 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-siwa-blue peer-checked:text-white ${colorBy === selectedColorBy ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"} dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
              >
                <div className="block">
                  <div className="w-full">{(option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1)}</div>
                </div>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div>

 
      <div className=" mt-4">
      {/* {valueChecks} */}

      </div>
   
        </div>
        <Divider className="mt-0"/>
              <div className="flex w-full items-center margin-0 justify-center my-4">
        <Button
        //   onClick={applyFilters}
          loading={filterPeticion}
          iconPos="right"
          icon="pi pi-check-square "
          loadingIcon="pi pi-spin pi-spinner" 
          className=" max-w-56  justify-center filter-apply p-button-raised bg-siwa-green-1 hover:bg-siwa-green-3 text-white font-bold py-2 px-10 rounded-xl border-none"
          label="Update"
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
    <Layout slug={''} filter={""} breadcrumbs={<BreadCrumb model={items as MenuItem[]} home={home}  className="text-sm"/>}>
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
    data={categories.map((category, index) => ({
        x: (data as { Treatment: string; Category: string; Mean: number; }[]).filter(item => item.Category === category).map(item => item.Treatment),
        y: (data as { Treatment: string; Category: string; Mean: number; }[]).filter(item => item.Category === category).map(item => item.Mean),
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
