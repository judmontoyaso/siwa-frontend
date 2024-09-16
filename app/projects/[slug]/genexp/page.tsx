"use client";
import React, { use, useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Layout from "@/app/components/Layout";
import { SidebarProvider } from "@/app/components/context/sidebarContext";
import GraphicCard from "@/app/components/graphicCard";
import Spinner from "@/app/components/pacmanLoader";
import { BreadCrumb } from "primereact/breadcrumb";
import { Dropdown } from "primereact/dropdown";
import { useAuth } from "@/app/components/authContext";
import Link from "next/link";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip as PTooltip } from "primereact/tooltip";

const GeneExpresionPlot = ({ params }: { params: { slug: string } }) => {
  const [layout, setLayout] = useState<any>({});
  const [data, setData] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { accessToken } = useAuth();
  const [result, setResult] = useState<any>();
  const [SampleLocation, setSampleLocation] = useState<string | null>(null);
  const [uniqueSampleLocations, setUniqueSampleLocations] = useState<string[]>([]);
  const [selectedGene, setSelectedGene] = useState<string>("il10");
  const [isRQSelected, setIsRQSelected] = useState<boolean>(true);
  const [uniqueTreatments, setUniqueTreatments] = useState<string[]>([]);
  const [groupByColumn, setGroupByColumn] = useState<any>("Treatment");
  const [isInitialized, setIsInitialized] = useState(false);
  const [resultFirst, setResultFirst] = useState<any>();
  const [selectedFilterColumn, setSelectedFilterColumn] = useState<string | null>(null);
  const [uniqueFilterValues, setUniqueFilterValues] = useState<string[]>([]);
  const [anotations, setAnnotations] = useState<any[]>([]);
  const [selectedFilterValues, setSelectedFilterValues] = useState<string[]>([]);
  const [selectedReferenceColumn, setSelectedReferenceColumn] = useState<string | null>(null);
  const [selectedReferenceValue, setSelectedReferenceValue] = useState<string | null>(null);
  const [referenceValues, setReferenceValues] = useState<string[]>([]);
  const [referenceDetails, setReferenceDetails] = useState<{ column: string | null; value: string | null }>({
    column: null,
    value: null,
  });

  const colorPalettes: any= {
    Treatment: ["#34675C", "#FF7043", "#8E24AA", "#F6C324", "#43A047"],
    AlphaD3Level: ["#FF5722", "#673AB7", "#4CAF50", "#FFC107", "#E91E63"],
  };
  
  

  const handleFilterColumnSelect = (column: string | null) => {
    setSelectedFilterColumn(column);
    if (column && resultFirst) {
      const columnIndex = resultFirst.data.columns.indexOf(column);
      const values = resultFirst.data.data.map((row: any) => row[columnIndex]);
      const uniqueVals: string[] = Array.from(new Set(values));
      setUniqueFilterValues(uniqueVals);
    }
  };

  const handleReferenceColumnSelect = (column: string | null) => {
    setSelectedReferenceColumn(column);
    if (column && resultFirst) {
      const columnIndex = resultFirst.data.columns.indexOf(column);
      const values = resultFirst.data.data
        .map((row: any) => row[columnIndex])
        .filter((value: any) => value !== null && value !== undefined);
      const uniqueVals: string[] = Array.from(new Set(values));
      setReferenceValues(uniqueVals);
    }
  };

  const handleReferenceValueChange = (value: string) => {
    setSelectedReferenceValue(value);
  };

  const handleFilterValueChange = (value: string) => {
    if (selectedFilterValues.includes(value)) {
      setSelectedFilterValues(selectedFilterValues.filter((val) => val !== value));
    } else {
      setSelectedFilterValues([...selectedFilterValues, value]);
    }
  };

  const genes = [
    { label: "IL10", value: "il10" },
    { label: "IL1B", value: "il1b" },
    { label: "MUC2", value: "muc2" },
  ];

  const fetchGeneExpresionData = async (token: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/geneexpresion/${params.slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();
      setResultFirst(result);
      setIsLoaded(true);
    } catch (error) {
      console.error("Error fetching gene expression data:", error);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchGeneExpresionData(accessToken);
    }
  }, [accessToken]);

  const fetchAnovaData = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/geneexpresion-anova/${params.slug}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            selected_gene: selectedGene,
            group_by: groupByColumn,
            sample_location: SampleLocation,
          }),
        }
      );
      
      const anovaResult = await response.json();
      console.log("ANOVA result:", anovaResult);
      return anovaResult.significance;
    } catch (error) {
      console.error("Error fetching ANOVA data:", error);
    }
  };

  
  const generateAnnotations = (anovaData: any, plotData: any[]) => {
    const annotations =  Object.entries(anovaData)
    .filter(([group, significance]) => group !== null || group !== undefined || group !== 'null') // Filtrar los valores nulos o undefined
    .map(([group, significance]) => {
      // Encontrar el valor máximo para cada grupo, incluyendo valores negativos
      const yMax = Math.max(...plotData.filter(d => d.name === group).map(d => Math.max(...d.y)));
      const annotationPosition = yMax < 10 
      ? yMax + 4  // Si es menor que 10, agregar 2 unidades
      : yMax + Math.abs(yMax) * 0.2; // Si es mayor, agregar un 20% del valor

      return {
        x: group,
        y: annotationPosition, // Ajustar la posición de la anotación dinámicamente
        text: significance,
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
  };
  

  useEffect(() => {
    const yMaxTotal = Math.max(...data.map(d => Math.max(...d.y)));
    const yMinTotal = Math.min(...data.map(d => Math.min(...d.y)));
    console.log("yMaxTotal:", yMaxTotal);
    updateLayout(yMinTotal, yMaxTotal); // Actualiza el layout con el nuevo valor máximo
  }, [result, selectedGene, groupByColumn, SampleLocation, isRQSelected, anotations]);
  
  
  useEffect(() => {
    if (result && result.data) {
      const rawData = result.data.data;
      const columns = result.data.columns;
  
      const plotData = generatePlotData(rawData, columns);
      setData(plotData); // Establece los datos generados
  
      const fetchAnovaDataAndUpdate = async () => {
        const anovaData = await fetchAnovaData(accessToken);
        if (anovaData) {
          generateAnnotations(anovaData, plotData); // Genera las anotaciones y actualiza el layout
        }
      };
  
      fetchAnovaDataAndUpdate();
    }
  }, [result, selectedGene, groupByColumn, SampleLocation, isRQSelected]);
  
 

  

  useEffect(() => {
    if (resultFirst && resultFirst.data && !isInitialized) {
      const columns = resultFirst.data.columns;
      const rawData = resultFirst.data.data;

      const sampleLocationIndex = columns.indexOf("SampleLocation");
      const treatmentIndex = columns.indexOf("Treatment");

      if (sampleLocationIndex === -1 || treatmentIndex === -1) {
        console.error("Required columns not found in data.");
        return;
      }

      const sampleLocations = rawData.map((row: any) => row[sampleLocationIndex]);
      
      const uniqueLocations: string[] = Array.from(new Set(sampleLocations));
      setUniqueSampleLocations(uniqueLocations);

      const treatments = rawData.map((row: any) => row[treatmentIndex]);
      const uniqueTreatments: string[] = Array.from(new Set(treatments));
      setUniqueTreatments(uniqueTreatments);

      setIsInitialized(true);
    }
  }, [resultFirst]);

  useEffect(() => {
    setSampleLocation(uniqueSampleLocations[0]);
  }, [uniqueSampleLocations]);

  useEffect(() => {
    const fetchFilteredData = async () => {
      if (accessToken && SampleLocation) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/geneexpresion/${params.slug}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ location: SampleLocation }),
          });

          const result = await response.json();
          setResult(result);

          // Guardar la referencia en los detalles
          setReferenceDetails({
            column: result?.data?.reference?.columna || null,
            value: result?.data?.reference?.valor || null,
          });
        } catch (error) {
          console.error("Error fetching filtered gene expression data:", error);
        }
      }
    };

    fetchFilteredData();
  }, [SampleLocation]);

  const generatePlotData = (rawData: any[], columns: string[]) => {
    if (!rawData || rawData.length === 0 || !columns || columns.length === 0) {
      return []; // Devuelve un array vacío si no hay datos
    }
  
    const category = `${isRQSelected ? "RQ" : "DD"}_${selectedGene}`;
    const categoryIndex = columns.indexOf(category);
    const groupByIndex = columns.indexOf(groupByColumn);
  
    if (groupByIndex === -1 || categoryIndex === -1) {
      console.error("Required columns not found in data.");
      return [];
    }
  
    const uniqueGroups = Array.from(new Set(rawData.map((row) => row[groupByIndex])));
  
    let allYValues: number[] = []; // Para almacenar todos los valores de Y
  
    const plotData = uniqueGroups.map((group, index) => {
      const filteredData = rawData.filter((row: any) => row[groupByIndex] === group);
      const colorPalette: any = colorPalettes[groupByColumn] || colorPalettes['Treatment'];
  
      const yValues = filteredData.map((row) => row[categoryIndex]);
      allYValues = allYValues.concat(yValues); // Acumular los valores de Y para ajustar la escala
  
      return {
        type: "violin",
        x: filteredData.map(() => group),
        y: yValues,
        name: group,
        points: "all",
        jitter: 0.3,
        pointpos: 0,
        scalemode: "width",
        line: {
          color: colorPalette[index % colorPalette.length],
        },
        meanline: {
          visible: true,
        },
        marker: {
          opacity: 0.6,
        },
      };
    });
  
    return plotData;
  };
  
  const updateLayout = (yMin: number, yMax: number) => {
    const adjustedYMin = yMin === 0 ? yMin - 5 : (yMin > 0 && yMin < 2 ? yMin - 5 : yMin * 1.2);
    const adjustedYMax = yMax > 0 && yMax <= 2 
      ? yMax + 5 
      : yMax > 2 && yMax <= 10 
        ? yMax + 10 
        : yMax * 1.2;
  
    // Calcular el número total de muestras procesadas
    const totalSamples = data.reduce((acc, groupData) => acc + groupData.y.length, 0);
  
    console.log("adjustedYMin:", adjustedYMin);
    console.log("adjustedYMax:", adjustedYMax);
  
    const newLayout = {
      showlegend: true,
      legend: {
        orientation: "h",
        x: 0.5,
        xanchor: "center",
        y: 1.1,
        yanchor: "top",
      },
      width: 800,
      height: 600,
      xaxis: { title: groupByColumn },
      yaxis: {
        title: `Expression Levels of ${!isRQSelected ? "RQ" : "DD"}_${selectedGene}`,
        range: [adjustedYMin, adjustedYMax], // Usar el valor mínimo y máximo ajustado
        autorange: false,
      },
      shapes: !isRQSelected
        ? [
            {
              type: 'line',
              x0: 0,
              x1: 1,
              y0: 1,
              y1: 1,
              xref: 'paper',
              yref: 'y',
              line: {
                color: 'red',
                width: 2,
                dash: 'dot', // Define que la línea sea punteada
              },
            },
          ]
        : [],
      annotations: [
        ...(referenceDetails.column && referenceDetails.value
          ? [
              {
                text: `Reference Column: ${referenceDetails.column}, Reference Group: ${referenceDetails.value}, n = ${totalSamples}`,  // Agregar número total de muestras
                xref: 'paper',
                yref: 'paper',
                x: 0.5,
                y: 1.2,
                showarrow: false,
                font: {
                  size: 12,
                  color: 'black',
                },
                align: 'center',
              },
            ]
          : []),
        ...anotations, // Otras anotaciones generadas dinámicamente
      ],
    };
  
    setLayout(newLayout);
  };
  
  
  
  useEffect(() => {
    setResult(resultFirst);
  }, [resultFirst]);



  const applyFilter = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH0_BASE_URL}/api/project/geneexpresion/${params.slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          variable_col: selectedReferenceColumn,
          group_ref: selectedReferenceValue,
          location: SampleLocation,
        }),
      });

      const result = await response.json();
      setResult(result);

      // Actualizar los detalles de la referencia
      setReferenceDetails({
        column: result?.data.reference?.columna || null,
        value: result?.data.reference?.valor || null,
      });
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const dropdownOptionsSampleLocation = uniqueSampleLocations.map((option) => ({
    label: option,
    value: option,
  }));

  const dropdownOptionsGroupBy = [
    { label: "Treatment", value: "Treatment" },
    { label: "AlphaD3Level", value: "AlphaD3Level" },
    // Add more options as necessary
  ];

  const dropdownOptionsReference = [
    { label: "Treatment", value: "Treatment" },
    { label: "KitID", value: "KitID" },
    { label: "AlphaD3Level", value: "AlphaD3Level" },
    // Add more columns for reference here
  ];

  const filters = (
    <Accordion multiple activeIndex={[0, 1]} className="filter">
      <AccordionTab header="Group by">
        {/* Group by logic */}
        <div className="flex flex-col items-start m-2">
          <h3 className="mb-2 text-base font-medium text-gray-700 dark:text-white flex items-center">
            Select a Sample Location: 
            <span className="ml-2">
              <i
                className="pi pi-info-circle text-siwa-blue"
                data-pr-tooltip="Please select a sample location prior to selecting a grouping variable."
                data-pr-position="top"
                id="sampleLocationTooltip"
              />
              <PTooltip target="#sampleLocationTooltip" />
            </span>
          </h3>
          <Dropdown
            value={SampleLocation}
            options={dropdownOptionsSampleLocation}
            onChange={(e) => setSampleLocation(e.value)}
            className="w-full mb-4"
            placeholder="Choose a location"
          />
        </div>
  
        <div className="flex flex-col items-start m-2">
          <h3 className="mb-2 text-base font-medium text-gray-700 dark:text-white flex items-center">
            Select a Gene: 
            <span className="ml-2">
              <i
                className="pi pi-info-circle text-siwa-blue"
                data-pr-tooltip="Choose a gene to display expression data."
                data-pr-position="top"
                id="geneTooltip"
              />
              <PTooltip target="#geneTooltip" />
            </span>
          </h3>
          <Dropdown
            value={selectedGene}
            options={genes}
            onChange={(e) => setSelectedGene(e.value)}
            className="w-full mb-4"
            placeholder="Select a gene"
          />
        </div>
  
        <div className="flex flex-col items-start m-2">
          <h3 className="mb-2 text-base font-medium text-gray-700 dark:text-white flex items-center">
            RQ / DD: 
            <span className="ml-2">
              <i
                className="pi pi-info-circle text-siwa-blue"
                data-pr-tooltip="Toggle between RQ and DD expression values."
                data-pr-position="top"
                id="rqDdTooltip"
              />
              <PTooltip target="#rqDdTooltip" />
            </span>
          </h3>
          <div className="flex items-center mb-4">
            <label className="mr-2">RQ</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={isRQSelected}
                onChange={() => setIsRQSelected(!isRQSelected)}
              />
              <span
                className="slider round"
                style={{ backgroundColor: isRQSelected ? "#4CAF50" : "#FF5722" }}
              ></span>
            </label>
            <label className="ml-2">DD</label>
          </div>
        </div>
  
        <div className="flex flex-col items-start m-2">
          <h3 className="mb-2 text-base font-medium text-gray-700 dark:text-white flex items-center">
            Group by: 
            <span className="ml-2">
              <i
                className="pi pi-info-circle text-siwa-blue"
                data-pr-tooltip="Select a column to group the data by."
                data-pr-position="top"
                id="groupByTooltip"
              />
              <PTooltip target="#groupByTooltip" />
            </span>
          </h3>
          <Dropdown
            value={groupByColumn}
            options={dropdownOptionsGroupBy}
            onChange={(e) => setGroupByColumn(e.value)}
            className="w-full mb-4"
            placeholder="Select a group by column"
          />
        </div>
      </AccordionTab>
  
      <AccordionTab header="Reference">
        <div className="mt-4">
          <h3 className="text-base font-medium text-gray-700 dark:text-white"></h3>
          <div className="flex flex-col items-start m-2">
            <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-white flex items-center">
              Select a column for reference: 
              <span className="ml-2">
                <i
                  className="pi pi-info-circle text-siwa-blue"
                  data-pr-tooltip="Choose a column to use as a reference for comparisons."
                  data-pr-position="top"
                  id="referenceColumnTooltip"
                />
                <PTooltip target="#referenceColumnTooltip" />
              </span>
            </h4>
            <Dropdown
              value={selectedReferenceColumn}
              options={dropdownOptionsReference}
              onChange={(e) => handleReferenceColumnSelect(e.value)}
              className="w-full mb-4"
              placeholder="Select a reference column"
            />
          </div>
  
          <div className="flex flex-col items-start m-2">
            <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-white flex items-center">
              Select reference value: 
              <span className="ml-2">
                <i
                  className="pi pi-info-circle text-siwa-blue"
                  data-pr-tooltip="Choose a specific value within the reference column."
                  data-pr-position="top"
                  id="referenceValueTooltip"
                />
                <PTooltip target="#referenceValueTooltip" />
              </span>
            </h4>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow-inner flex flex-col items-start">
              {selectedReferenceColumn && (
                <div>
                  <ul className="mt-2">
                    {referenceValues.map((value, index) => (
                      <li key={index} className="text-gray-700 dark:text-white flex items-center">
                        <input
                          type="radio"
                          id={`reference-value-${index}`}
                          name="reference-value"
                          value={value}
                          checked={selectedReferenceValue === value}
                          onChange={() => handleReferenceValueChange(value)}
                          className="mr-2"
                        />
                        <label htmlFor={`reference-value-${index}`} className="ml-2">
                          {value}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
  
        <div className="flex w-full items-center justify-center my-4">
          <Button
            onClick={() => {
              applyFilter();
            }}
            loading={false}
            iconPos="right"
            icon="pi pi-check-square"
            loadingIcon="pi pi-spin pi-spinner"
            className="max-w-56 justify-center filter-apply p-button-raised bg-siwa-green-1 hover:bg-siwa-green-3 text-white font-bold py-2 px-10 rounded-xl border-none"
            label="Update"
          />
        </div>
      </AccordionTab>
    </Accordion>
  );
  
  return (
    <div className="w-full h-full">
      <SidebarProvider>
        <Layout
          slug={params.slug}
          filter={""}
          breadcrumbs={
            <BreadCrumb
              model={[
                { label: "Projects", template: (item: any) => <Link href={`/`} className="pointer-events-none text-gray-500">Projects</Link> },
                { label: params.slug, template: (item: any) => <Link href={`/projects/${params.slug}`}>{item.label}</Link> },
                { label: "Gene Expression", template: (item: any) => <Link href={`/projects/geneexpresion/${params.slug}`}>{item.label}</Link> },
              ]}
            />
          }
        >
          {isLoaded ? (
            <div className="flex flex-col w-11/12 mx             auto">
            <GraphicCard
              legend={""}
              title={`Gene Expression Analysis - ${SampleLocation}`}
              filter={filters}
            >
<Plot
  data={data}
  layout={layout} // Si layout es undefined, usar un layout predeterminado
  config={{
    displaylogo: false,
    responsive: true,
    displayModeBar: false,
  }}
/>




            </GraphicCard>
          </div>
        ) : (
          <div className="w-full h-full">
            <Spinner />
          </div>
        )}
      </Layout>
    </SidebarProvider>
  </div>
);
};

export default GeneExpresionPlot;

