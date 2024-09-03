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

const GeneExpresionPlot = ({ params }: { params: { slug: string } }) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { accessToken } = useAuth();
  const [result, setResult] = useState<any>();
  const [SampleLocation, setSampleLocation] = useState<string | null>(null);
  const [uniqueSampleLocations, setUniqueSampleLocations] = useState<string[]>(
    []
  );
  const [selectedGene, setSelectedGene] = useState<string>("il10");
  const [isRQSelected, setIsRQSelected] = useState<boolean>(true);
  const [uniqueTreatments, setUniqueTreatments] = useState<string[]>([]);
  const [groupByColumn, setGroupByColumn] = useState<string>("Treatment");
  const [isInitialized, setIsInitialized] = useState(false);
  const [resultFirst, setResultFirst] =  useState<any>();
  const genes = [
    { label: "IL10", value: "il10" },
    { label: "IL1B", value: "il1b" },
    { label: "MUC2", value: "muc2" },
  ];

  const fetchGeneExpresionData = async (token: any) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/projects/geneexpresion/${params.slug}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );

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

  useEffect(() => {
    if (resultFirst && resultFirst.data && !isInitialized) {  // Agrega un estado isInitialized
      const columns = resultFirst.data.columns;
      const rawData = resultFirst.data.data;
  
      const sampleLocationIndex = columns.indexOf("SampleLocation");
      const treatmentIndex = columns.indexOf("Treatment");
  
      if (sampleLocationIndex === -1 || treatmentIndex === -1) {
        console.error("Required columns not found in data.");
        return;
      }
  
      const sampleLocations = rawData.map((row: any) => row[sampleLocationIndex]);
      const uniqueLocations = Array.from(new Set(sampleLocations));
      setUniqueSampleLocations(uniqueLocations);
      setSampleLocation(uniqueLocations[0]);
  
      const treatments = rawData.map((row: any) => row[treatmentIndex]);
      const uniqueTreatments = Array.from(new Set(treatments));
      setUniqueTreatments(uniqueTreatments);
  
      setIsInitialized(true); // Marca como inicializado
  
      // Genera los datos de la gráfica para la carga inicial
      generatePlotData(rawData, treatmentIndex, columns);
    }
  }, [resultFirst]);
  

  useEffect(() => {
    const fetchFilteredData = async () => {
      if (accessToken && SampleLocation) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/projects/geneexpresion/${params.slug}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ location: SampleLocation }),
            }
          );
  
          const result = await response.json();
          const columns = result.data.columns;
          const rawData = result.data.data;
          const treatmentIndex = columns.indexOf("Treatment");
        setResultFirst(result);
    
        } catch (error) {
          console.error("Error fetching filtered gene expression data:", error);
        }
      }
    };
  
    fetchFilteredData();
  }, [SampleLocation]);
  

  const generatePlotData = (rawData: any[], treatmentIndex: number, columns: string[]) => {
    const category = `${isRQSelected ? "RQ" : "DD"}_${selectedGene}`;
    const categoryIndex = columns.indexOf(category);
    console.log("category", category);
    const plotData = uniqueTreatments.map((treatment) => {
      const filteredData = rawData.filter(
        (row: any) => row[treatmentIndex] === treatment
      );
      return {
        type: "violin",
        x: filteredData.map(() => treatment),
        y: filteredData.map((row) => row[categoryIndex]),
        name: treatment,
        points: "all",
        jitter: 0.3,
        pointpos: -1.5,
        scalemode: "width",
        line: {
          color: "rgba(31,119,180,0.6)",
        },
        meanline: {
          visible: true,
        },
        marker: {
          opacity: 0.6,
        },
      };
    });

    setData(plotData);
  };

  useEffect(() => {
    setResult(resultFirst);
    }, [resultFirst]);

  useEffect(() => {
    if (result && result.data) {
      const columns = result.data.columns;
      const rawData = result.data.data;
      const treatmentIndex = columns.indexOf("Treatment");

      generatePlotData(rawData, treatmentIndex, columns);
    }
  }, [result,  selectedGene, isRQSelected, SampleLocation]);

  const dropdownOptionsSampleLocation = uniqueSampleLocations.map((option) => ({
    label: option,
    value: option,
  }));

  const dropdownOptionsGroupBy = [
    { label: "Treatment", value: "Treatment" },
    { label: "SampleLocation", value: "SampleLocation" },
    // Add more options as necessary
  ];

  const visualizationSettings = (
    <Accordion multiple activeIndex={[0]} className="filter">
      <AccordionTab header="Group by">
        <div className="flex flex-col items-start m-2">
          <h3 className="mb-2 text-base font-medium text-gray-700 dark:text-white">
            Select a Sample Location:
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
          <h3 className="mb-2 text-base font-medium text-gray-700 dark:text-white">
            Select a Gene:
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
          <h3 className="mb-2 text-base font-medium text-gray-700 dark:text-white">
            Select a ref:
          </h3>
          <div className="flex items-center mb-4">
            <label className="mr-2">DD</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={isRQSelected}
                onChange={() => setIsRQSelected(!isRQSelected)}
              />
              <span className="slider round" style={{ backgroundColor: isRQSelected ? "#4CAF50" : "#FF5722" }}></span>
            </label>
            <label className="ml-2">RQ</label>
          </div>
        </div>

        <div className="flex flex-col items-start m-2">
          <h3 className="mb-2 text-base font-medium text-gray-700 dark:text-white">
            Group by:
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
            <div className="flex flex-col w-11/12 mx-auto">
              <GraphicCard
                legend={""}
                title={`Gene Expression Analysis - ${SampleLocation}`}
                filter={visualizationSettings}
              >
                <Plot
                  data={data}
                  layout={{
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
                    xaxis: { title: 'Treatment' },
                    yaxis: {
                      title: `Expression Levels of ${isRQSelected ? "RQ" : "DD"}_${selectedGene}`,
                    },
                    violingap: 0.3,
                    violingroupgap: 0.5,
                    violinmode: "group",
                  }}

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
