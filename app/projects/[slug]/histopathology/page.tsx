"use client"
import React, { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, use, useEffect, useRef, useState } from 'react';
import Plot from 'react-plotly.js';
import Layout from '@/app/components/Layout';
import { SidebarProvider } from '@/app/components/context/sidebarContext';
import GraphicCard from '@/app/components/graphicCard';
import Spinner from '@/app/components/pacmanLoader';
import { BreadCrumb } from 'primereact/breadcrumb';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { ToastContainer } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import { Tooltip as PTooltip } from 'primereact/tooltip';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Config } from 'plotly.js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MenuItem } from 'primereact/menuitem';
import { useAuth } from '@/app/components/authContext';
import { Checkbox } from 'primereact/checkbox';

const ScatterPlot = ({ params }: { params: { slug: string } }) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(true);
  const [activeIndexes, setActiveIndexes] = useState([0, 1]);
  const [selectedColorBy, setSelectedColorBy] = useState<string>('samplelocation');
  const [colorByOptions, setColorByOptions] = useState([]);
  const [configFile, setconfigFile] = useState({} as any);
  const [columnOptions, setColumnOptions] = useState<string[]>([]);
  const [filterPeticion, setFilterPetition] = useState(false);
  const [theRealColorByVariable, setTheRealColorByVariable] = useState<string>('Treatment');
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { accessToken, isLoading, error } = useAuth();
  const [result, setResult] = useState<any>();
  const [realcolumn, setRealColumn] = useState<any>('Treatment');
  const prevSelectedValues = useRef<any[]>([]);
  const colors = [
    "#092538", "#34675C", "#2E4057", "#FEF282", "#F6C324", "#415a55", "#FFA726", "#FF7043",
    "#BFBFBF", "#8C8C8C", "#616161", "#424242", "#E53935", "#D81B60", "#8E24AA", "#43A047",
    "#00ACC1", "#1E88E5", "#6D4C41", "#FDD835", "#26A69A", "#7E57C2", "#EC407A"
  ];
  const categories: string[] = ['OverallArchitecture', 'MucosalIntegrity', 'LymphoidImmune', 'InflammationSeverity', 'MicrobialOrganisms'];
  const [SampleLocation, setSampleLocation] = useState<any>('Cecum');
  const router = useRouter();
  const [selectedValuesByTab, setSelectedValuesByTab] = useState<{ [tabId: string]: any[] }>({});
  const [activeTab, setActiveTab] = useState<string>('tab0'); // El valor por defecto es la primera pestaña
  const [selectedValuesByColumn, setSelectedValuesByColumn] = useState<{ [key: string]: any[] }>({});

  const[rawData, setRawData] = useState<any[]>([]);

  const [selectedColumn, setSelectedColumn] = useState<string | null>("Treatment");
  const [uniqueValues, setUniqueValues] = useState<any[]>([]);
  const [selectedValues, setSelectedValues] = useState<any[]>([]);

  const items = [
    { label: 'Projects', template: (item: any, option: any) => <Link href={`/`} className="pointer-events-none text-gray-500" aria-disabled={true}>Projects</Link> },
    { label: params.slug, template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) => <Link href={`/projects/${params.slug}`}>{item.label}</Link> },
    { label: 'Histopathology', template: (item: { label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }, options: any) => <Link href={`/projects/${params.slug}/histopathology`}>{item.label}</Link> },
  ];

  const home = { icon: 'pi pi-home', template: (item: any, option: any) => <Link href={`/`}><i className={home.icon}></i></Link> };

  const fetchAnovaData = async (token: any, category: string | null) => {
    try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/histo-anova/${params.slug}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                colannova: theRealColorByVariable,  // La columna principal para ANOVA
                selected_columns: category ? [category] : categories,  // Categoría seleccionada o todas
                sample_location: SampleLocation,
                selected_column: realcolumn,   // Columna seleccionada para el filtro
                selected_values: selectedValues    // Filtra los valores que estás analizando
            }),
        });

        const anovaResult = await response.json();
        console.log('ANOVA result before filtering:', anovaResult);

        // Asegurarse de que anovaResult y anovaResult.significance existen antes de continuar
        if (anovaResult && anovaResult.significance) {
            const filteredSignificance = Object.entries(anovaResult.significance)
                .filter(([key, value]) => value !== null && value !== undefined && value !== '')
                .reduce((acc: { [key: string]: any }, [key, value]) => {
                    acc[key] = value;
                    return acc;
                }, {});

            console.log('ANOVA result after filtering:', filteredSignificance);
            return { significance: filteredSignificance };
        } else {
            console.error("ANOVA result or significance is undefined or null");
            return { significance: {} };
        }
    } catch (error) {
        console.error("Error al obtener datos de ANOVA:", error);
        return { significance: {} };
    }
};

useEffect(() => {
    const loadDataAndAnnotations = async () => {
      if (!result || !result.data) {
        console.error("No hay datos disponibles en result.");
        return;
      }
  
      const anovaResult = await fetchAnovaData(accessToken, selectedCategory); // Llama al endpoint de ANOVA con la categoría seleccionada
  
      const columns = result?.data.columns;
      const rawData = result?.data.data;
  
      const groupedData: { [key: string]: number[] } = {};
      Object.values(rawData).forEach((row: any) => {
        const group = row[columns.indexOf(theRealColorByVariable)];
        const sampleLocation = row[columns.indexOf("SampleLocation")];
  
        if (sampleLocation !== SampleLocation || group === undefined) {
          return;
        }
  
        const categoriesToUse = selectedCategory ? [selectedCategory] : categories; // Si hay categoría seleccionada, usar esa, si no, todas

        categoriesToUse.forEach(category => {
          const categoryValue = selectedCategory 
            ? row[columns.indexOf(category)]  // Si se selecciona una categoría, usar su valor
            : row[columns.indexOf("AdditiveScore")]; // Si no, usar el "Additive Score"
        
          if (categoryValue !== undefined) {
            const key = `${group}-${category}-${sampleLocation}`; // Agrupa por tratamiento, categoría y ubicación
            if (!groupedData[key]) {
              groupedData[key] = [];
            }
            groupedData[key].push(categoryValue); // Añade el valor de la categoría (o del Additive Score) al grupo
          }
        });
        
        


      });
      const meanData = Object.keys(groupedData).map((key: string) => {
        const [treatment, category, sampleLocation] = key.split('-');
        const scores = groupedData[key]; // Los valores de la categoría o del Additive Score
        const mean = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length; // Cálculo del promedio
        return { Treatment: treatment, Category: category, SampleLocation: sampleLocation, Mean: mean };
      });
      
  
      // Generar las anotaciones basadas en los resultados de ANOVA
      const maxMean = Math.max(...meanData.map(item => item.Mean)); // Encontrar el valor máximo de mean
      const offsetFactor = maxMean * 0.05; // El 5% del valor máximo se usa como offset
      
      const annotations = Object.entries(anovaResult?.significance).map(([key, value]) => {
        console.log("group", key);
        console.log("significance", value);
      
        // Sumar todas las medias para las categorías correspondientes a un mismo tratamiento
        const totalMean = meanData
          .filter(item => item?.Treatment === key)
          .reduce((sum, item) => sum + item.Mean, 0);
      
        // Ajuste dinámico del offset basado en la escala de 'mean'
        const offset = totalMean * 0.05 || offsetFactor;  // Si no se puede calcular el 5%, usar un valor fijo basado en el máximo de las medias
      
        return {
          x: key,
          y: totalMean + offset, // Posición ajustada en y usando el offset dinámico
          text: value,
          xanchor: 'center',
          yanchor: 'top',
          showarrow: false,
          font: {
            size: 16,
            color: 'black',
          },
        };
      });
      
  
      setAnnotations(annotations);
      console.log("anovaResult", anovaResult);
      console.log("annotations", annotations);
      setData(meanData);
      setIsLoaded(true);
    };
  
    loadDataAndAnnotations();
  }, [result, theRealColorByVariable, SampleLocation, selectedCategory, accessToken, realcolumn]);
  
  // Este otro useEffect se asegura de actualizar el ANOVA cuando se cambia la columna de agrupamiento
  useEffect(() => {
    if (theRealColorByVariable) {
      fetchAnovaData(accessToken, selectedCategory).then(anovaResult => {
        console.log('ANOVA recalculado:', anovaResult);
      });
    }
  }, [theRealColorByVariable, selectedCategory, SampleLocation]);
  
  const [uniqueSampleLocations, setUniqueSampleLocations] = useState<any[]>([]);
  const [resultFirst, setResultFirst] = useState<any>();

  useEffect(() => {
    if (!result || !result.data) {
      console.error("No hay datos disponibles en result.");
      return;
    }

    const columns = resultFirst?.data.columns;
    const rawData = resultFirst?.data.data;

    const sampleLocationIndex = columns.indexOf("SampleLocation");
    if (sampleLocationIndex === -1) {
      console.error("La columna 'SampleLocation' no se encontró en los datos.");
      return;
    }

    const sampleLocations = rawData.map((row:any) => row[sampleLocationIndex]);

    const uniqueLocations = Array.from(new Set(sampleLocations));
    console.log("uniqueLocations", uniqueLocations);
    setUniqueSampleLocations(uniqueLocations);
    setSampleLocation(uniqueLocations[0]);
  }, [resultFirst]);

  const fetchData = async (token: any) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/histo/${params.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

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

  const fetchDataFilter = async (token: any) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/histo/${params.slug}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sample_location: SampleLocation,
            selected_column: selectedColumn,
            selected_values: selectedValuesByColumn[selectedColumn || ''] || [],  // Solo enviar valores de la columna actual
          }),
        }
      );
  
      const result = await response.json();
      console.log('result:', result);
      setResult(result);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error al obtener datos filtrados:', error);
    }
  };
  

  const [filteredColumns, setFilteredColumns] = useState([]);

  useEffect(() => {
    if (!result || !result.data) {
      console.error("No hay datos disponibles en result.");
      return;
    }

    const columns = result?.data.columns;

    const excludedColumns = ["SampleID", "AdditiveScore", "ResearchNumber"];
    const histoColumns = ['OverallArchitecture', 'MucosalIntegrity', 'LymphoidImmune', 'InflammationSeverity', 'MicrobialOrganisms'];

    const filteredColumnsList = columns.filter((col: any) => {
      if (excludedColumns.includes(col) || histoColumns.includes(col)) return false;
      
      const columnIndex = resultFirst?.data?.columns.indexOf(col);
      const uniqueVals = Array.from(new Set(resultFirst?.data?.data.map((row: any) => row[columnIndex])));
      
      return uniqueVals.length > 1;
    });

    console.log("filteredColumnsList", filteredColumnsList);
    setFilteredColumns(filteredColumnsList);
  }, [resultFirst]);

  useEffect(() => {
    fetchData(accessToken);
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && (SampleLocation || theRealColorByVariable)) {
        setFilterPetition(true);
        fetchDataFilter(accessToken);
    }
}, [SampleLocation, theRealColorByVariable, accessToken]);


    const dropdownOptionsColorby = filteredColumns
    .filter((option: any) => option !== "SampleLocation")
    .map((option: any) => ({
      label: (option.charAt(0).toUpperCase() + option.replace('_', ' ').slice(1)),
      value: option
    }));

  const dropdownOptionsSampleLocation = uniqueSampleLocations
    .map((option: any) => ({
      label: (option.charAt(0).toUpperCase() + option.replace('_', ' ').slice(1)),
      value: option
    }));

  const dropdownOptionsCategory = [
    { label: 'All categories', value: null },
    ...categories.map(category => ({
      label: category,
      value: category,
    })),
  ];
// Función para manejar la selección de columnas
const handleColumnSelect = (option: string | null) => {
  console.log('Columna seleccionada:', option); // Verificar la columna seleccionada
  setSelectedColumn(option);

  const rawData = resultFirst?.data.data;
  const columnIndex = resultFirst?.data.columns.indexOf(option);

  if (columnIndex !== -1) {
    const values = rawData.map((row: { [x: string]: any }) => row[columnIndex]);
    const uniqueVals = Array.from(new Set(values)).filter(val => values.filter((v: any) => v === val).length > 1);

    setUniqueValues(uniqueVals);
    console.log('Valores únicos para la columna seleccionada:', uniqueVals); // Verificar los valores únicos

    // Cargar los valores previamente seleccionados para esta columna, si existen
    const previouslySelectedValues = selectedValuesByColumn[option || ''] || [];
    setSelectedValues(previouslySelectedValues);
    console.log('Valores previamente seleccionados para la columna:', previouslySelectedValues); // Verificar los valores previos
  } else {
    setUniqueValues([]);
    setSelectedValues([]);
    console.log('No se encontraron valores únicos o la columna no es válida'); // Si no hay valores válidos
  }
};

  useEffect(() => {  
    const rawData = resultFirst?.data?.data;
    
    const columnIndex = resultFirst?.data?.columns.indexOf(selectedColumn);
    if (columnIndex !== -1) {
      const values = rawData?.map((row: { [x: string]: any; }) => row[columnIndex]);
      const uniqueVals = Array.from(new Set(values)).filter(val => values.filter((v: any) => v === val).length > 1);
      setUniqueValues(uniqueVals);
             setSelectedValues(uniqueVals);
    }}, [resultFirst]);

    useEffect(() => {
        // Guardar los valores anteriores seleccionados en un ref para evitar reiniciar los valores seleccionados
        prevSelectedValues.current = selectedValues;
      }, [selectedValues]);

      // Verificar el estado completo de las selecciones de columnas y valores al cambiar de columna
useEffect(() => {
  console.log('Estado actual de selectedValuesByColumn:', selectedValuesByColumn);
}, [selectedValuesByColumn]);

useEffect(() => {
  console.log('Columna actual:', selectedColumn, 'Valores seleccionados:', selectedValues);
}, [selectedColumn, selectedValues]);

const handleValueChange = (value: any) => {
  const updatedValues = selectedValues.includes(value)
    ? selectedValues.filter((v) => v !== value) // Si ya está seleccionado, lo elimina
    : [...selectedValues, value]; // Si no está seleccionado, lo agrega

  setSelectedValues(updatedValues);

  // Guardar los valores seleccionados en el estado específico de la columna
  setSelectedValuesByColumn((prevValues) => ({
    ...prevValues,
    [selectedColumn || '']: updatedValues, // Guardar los valores para la columna seleccionada
  }));
};
      const onTabChange = (e: any) => {
        const newTab = `tab${e.index}`; // Identifica la nueva pestaña en base al índice
        setActiveTab(newTab); // Actualiza la pestaña activa
      };
      
      const renderUniqueValues = () => {
        return uniqueValues.map((value, index) => (
          <li key={index} className="text-gray-700 dark:text-white flex items-center">
            <Checkbox
              inputId={`value-${index}`}
              name={`value-${index}`}
              value={value}
              checked={selectedValues.includes(value)} // Aquí reflejamos correctamente si el valor está seleccionado
              onChange={() => handleValueChange(value)}
              className="mr-2"
            />
            <label htmlFor={`value-${index}`} className="ml-2">
              {value}
            </label>
          </li>
        ));
      };

  const filter = (
    <div className="flex flex-col w-full rounded-lg dark:bg-gray-800">
      <Accordion multiple activeIndex={activeIndexes} onTabChange={onTabChange} className="filter">
        <AccordionTab className="colorby-acordeon" header="Group by">
          <div className="flex flex-col items-start m-2">
            <h3 className="mb-2 text-base font-medium text-gray-700 dark:text-white flex items-center">
              Select a Sample Location:
              <span className="ml-2">
                <i
                  className="pi pi-info-circle text-siwa-blue"
                  data-pr-tooltip="Please select a sample location prior to selected a grouping variable."
                  data-pr-position="top"
                  id="sampleLocationTooltip"
                />
                <PTooltip target="#sampleLocationTooltip" />
              </span>
            </h3>
            <Dropdown
              value={SampleLocation}
              options={dropdownOptionsSampleLocation}
              onChange={(e) => setSampleLocation(e.target.value)}
              className="w-full mb-6 text-sm"
              placeholder="Choose a location"
            />
          </div>
      
          <div className="flex flex-col items-start mt-2 m-2">
            <div className="flex items-center mb-2">
              <h3 className="text-base font-medium text-gray-700 dark:text-white">
                Select a variable to group:
              </h3>
              <span className="ml-2">
                <i
                  className="pi pi-info-circle text-siwa-blue"
                  data-pr-tooltip="Only available when a specific location is selected.  Select a grouping variable within a sample location."
                  data-pr-position="top"
                  id="groupByTooltip"
                />
                <PTooltip target="#groupByTooltip" />
              </span>
            </div>
            <Dropdown
              value={theRealColorByVariable}
              options={dropdownOptionsColorby}
              onChange={(e) => setTheRealColorByVariable(e.target.value)}
              optionLabel="label"
              className="w-full text-sm filtercolorby"
              id="colorby"
              placeholder="Select a color category"
            />
          </div>

          <div className="flex flex-col items-start mt-2 m-2">
            <div className="flex items-center mb-2">
              <h3 className="text-base font-medium text-gray-700 dark:text-white">
                Select a histo category:
              </h3>
              <span className="ml-2">
                <i
                  className="pi pi-info-circle text-siwa-blue"
                  data-pr-tooltip="Choose a histopathology category for the analysis."
                  data-pr-position="top"
                  id="categoryTooltip"
                />
                <PTooltip target="#categoryTooltip" />
              </span>
            </div>
            <Dropdown
              value={selectedCategory}
              options={dropdownOptionsCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              optionLabel="label"
              className="w-full text-sm filtercategory"
              id="category"
              placeholder="All categories"
            />
          </div>
        </AccordionTab>
      
        <AccordionTab className="filter-acordeon" header="Filter by">
          <div className="mt-2 ml-2 mb-4">
            <div className="flex items-center">
              <h3 className="text-base font-medium text-gray-700 dark:text-white flex items-center">
                Filtering options:
                <AiOutlineInfoCircle
                  className="ml-2 text-siwa-blue xl:text-lg text-lg mb-1 cursor-pointer"
                  id="filteringTip"
                />
                <PTooltip target="#filteringTip" position="top">
                Select a variable and specify the groups you want to include in the filtered dataset.                </PTooltip>
              </h3>
            </div>
      
            <ul className="w-full flex flex-wrap items-center content-center justify-start mt-2">
              {filteredColumns
                .filter(option => option !== "SampleLocation")
                .map((option, index) => (
                  <li key={index} className="p-1 w-full md:w-full lg:w-full xl:w-48 2xl:w-1/2">
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
                      className={`flex items-center justify-center cursor-pointer hover:text-gray-600 hover:bg-gray-100 w-full p-2 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-siwa-blue peer-checked:text-white ${
                        selectedColumn === option ? "peer-checked:bg-navy-600" : "peer-checked:bg-navy-500"
                      } dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
                    >
                      <div className="block">
                        <div className="w-full text-base">
                          {(option as string).charAt(0).toUpperCase() + (option as string).replace('_', ' ').slice(1)}
                        </div>
                      </div>
                    </label>
                  </li>
                ))}
            </ul>
          </div>
      
          <div className="mt-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow-inner flex flex-col items-start">
              {selectedColumn && (
                <div>
                <ul className="mt-2">
  {renderUniqueValues()}
</ul>

                </div>
              )}
            </div>
          </div>
      
          <div className="flex w-full items-center justify-center my-4">
            <Button
              onClick={() => {
                console.log("filter", selectedColumn, selectedValues);
                setFilterPetition(true);
                setRealColumn(selectedColumn);
                fetchDataFilter(accessToken); // Llama a fetchData con los filtros aplicados
              }}
              loading={false}
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
        <Layout slug={params.slug} filter={""} breadcrumbs={<BreadCrumb model={items as MenuItem[]} home={home} className="text-sm"/>}>
          {isLoaded ? (
            <div className="flex flex-col w-11/12 mx-auto">
              <div className="flex flex-row w-full text-center justify-center items-center">
                <h1 className="text-3xl my-5 mx-2">Histopathology - {selectedCategory || "All Categories"} - {selectedColumn}</h1>
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
                <GraphicCard legend={""} filter={filter} title={`Histopathology scores aggregated by ${selectedCategory || "All Categories"} - ${SampleLocation}`}>
                  <div className="w-full flex flex-col content-center text-center items-center">
                  <Plot
  data={(selectedCategory ? [selectedCategory] : categories)?.map((category, index) => ({
    x: (data as { Treatment: string; Category: string; Mean: number; }[])?.filter(item => item.Category === category).map(item => item.Treatment),
    y: (data as { Treatment: string; Category: string; Mean: number; }[])?.filter(item => item.Category === category).map(item => item.Mean),
    name: category,
    type: 'bar',
    marker: { color: colors[index % colors.length] },
  }))}
  layout={{
    barmode: 'stack',  // Mantener las barras apiladas
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
    xaxis: { 
      title: {
        text: theRealColorByVariable.charAt(0).toUpperCase() + theRealColorByVariable.slice(1).replace('_', ' '), // El título del eje X basado en la variable de agrupación
      },
      tickangle: -45,
      tickfont: { size: 10 }
    },
    margin: { l: 50, r: 50, b: 100, t: 0, pad: 4 },
    yaxis: { title: selectedCategory ? 'Mean Score' : 'Mean Additive Score' }, // Cambiar el título del eje Y dinámicamente
    dragmode: false,
    annotations: annotations.map(annotation => ({
      ...annotation,
      font: { size: 10, color: 'black' },
      xanchor: 'center',
      yanchor: 'top'
    }))
  }}
/>





                    <div className="w-full flex flex-row ">
                      <div className="px-6 py-8 w-full" >
                        <div className="grid gap-10" style={{ gridTemplateColumns: '1fr 1fr' }}>
                          <div className="col-span-2">
                            <p className="text-gray-700 m-3 text-justify text-xl">
                              Letters indicate significantly different groups as calculated by Tukey test. There is a significant effect of treatment on the mean score: MedLow+VitD has the lowest score, indicating the lowest level of abnormality or damage.
                            </p>
                          </div>
                        </div>
                        <div className="prose flex flex-row flex-wrap">
                          {Object.entries(configFile?.betadiversity?.graph || {}).map(([key, value]) => {
                            if (key === selectedColorBy && key !== "samplelocation") {
                              if (typeof value === 'string' && value !== null) {
                                return (  
                                  <div key={key} className="col-span-2">
                                    <p className="text-gray-700 m-3 text-justify text-xl">{value}</p>
                                  </div>
                                );
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
  );
};

export default ScatterPlot;
