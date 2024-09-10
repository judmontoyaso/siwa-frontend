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
    const category = `${isRQSelected ? "RQ" : "DD"}_${selectedGene}`;
    const categoryIndex = columns.indexOf(category);
    const groupByIndex = columns.indexOf(groupByColumn);
  
    if (groupByIndex === -1 || categoryIndex === -1) {
      console.error("Required columns not found in data.");
      return;
    }
  
    const uniqueGroups = Array.from(new Set(rawData.map((row) => row[groupByIndex])));
  
    const plotData = uniqueGroups.map((group, index) => {
      const filteredData = rawData.filter((row: any) => row[groupByIndex] === group);
      const colorPalette: any = colorPalettes[groupByColumn] || colorPalettes['Treatment'];      return {
        type: "violin",  // O "box" si estás utilizando boxplot
        x: filteredData.map(() => group),
        y: filteredData.map((row) => row[categoryIndex]),
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
  
    setData(plotData);
  };
  
  useEffect(() => {
    setResult(resultFirst);
  }, [resultFirst]);

  useEffect(() => {
    if (result && result.data) {
      const columns = result?.data?.columns;
      const rawData = result?.data?.data;
      generatePlotData(rawData, columns);
    }
  }, [result, selectedGene, isRQSelected, SampleLocation, groupByColumn]);

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
          <h3 className="mb-2 text-base font-medium text-gray-700 dark:text-white">Select a Sample Location:</h3>
          <Dropdown
            value={SampleLocation}
            options={dropdownOptionsSampleLocation}
            onChange={(e) => setSampleLocation(e.value)}
            className="w-full mb-4"
            placeholder="Choose a location"
          />
        </div>

        <div className="flex flex-col items-start m-2">
          <h3 className="mb-2 text-base font-medium text-gray-700 dark:text-white">Select a Gene:</h3>
          <Dropdown
            value={selectedGene}
            options={genes}
            onChange={(e) => setSelectedGene(e.value)}
            className="w-full mb-4"
            placeholder="Select a gene"
          />
        </div>

        <div className="flex flex-col items-start m-2">
          <h3 className="mb-2 text-base font-medium text-gray-700 dark:text-white">RQ / DD:</h3>
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
          <h3 className="mb-2 text-base font-medium text-gray-700 dark:text-white">Group by:</h3>
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
        {/* <div className="mt-2 ml-2 mb-4">
          <div className="flex items-center">
            <h3 className="text-base font-medium text-gray-700 dark:text-white flex items-center">
              Filtering options:
              <AiOutlineInfoCircle
                className="ml-2 text-siwa-blue xl:text-lg text-lg mb-1 cursor-pointer"
                id="filteringTip"
              />
              <PTooltip target="#filteringTip" position="top">
                Select a variable and specify the values you want to include in the filtered dataset.
              </PTooltip>
            </h3>
          </div>

          <ul className="w-full flex flex-wrap items-center content-center justify-start mt-2">
            {dropdownOptionsGroupBy
              .filter((option) => option.value !== "SampleLocation")
              .map((option, index) => (
                <li key={index} className="p-1 w-full md:w-full lg:w-full xl:w-48 2xl:w-1/2">
                  <input
                    type="radio"
                    id={option.value}
                    name="filteredColumn"
                    className="hidden peer"
                    value={option.value}
                    checked={selectedFilterColumn === option.value}
                    onChange={() => handleFilterColumnSelect(option.value)}
                  />
                  <label
                    htmlFor={option.value}
                    className={`flex items-center justify-center cursor-pointer hover:text-gray-600 hover:bg-gray-100 w-full p-2 text-gray-500 bg-white border border-gray-200 rounded-xl dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-custom-green-400 peer-checked:border-siwa-blue peer-checked:text-white ${
                      selectedFilterColumn === option.value
                        ? "peer-checked:bg-navy-600"
                        : "peer-checked:bg-navy-500"
                    } dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700`}
                  >
                    <div className="block">
                      <div className="w-full text-base">{option.label}</div>
                    </div>
                  </label>
                </li>
              ))}
          </ul>
        </div>

        <div className="mt-4">
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow-inner flex flex-col items-start">
            {selectedFilterColumn && (
              <div>
                <ul className="mt-2">
                  {uniqueFilterValues.map((value, index) => (
                    <li key={index} className="text-gray-700 dark:text-white flex items-center">
                      <Checkbox
                        inputId={`value-${index}`}
                        name={`value-${index}`}
                        value={value}
                        checked={selectedFilterValues.includes(value)}
                        onChange={() => handleFilterValueChange(value)}
                        className="mr-2"
                      />
                      <label htmlFor={`value-${index}`} className="ml-2">
                        {value}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div> */}

        <div className="mt-4">
          <h3 className="text-base font-medium text-gray-700 dark:text-white"></h3>
          <div className="flex flex-col items-start m-2">
            <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
              Select a column for reference:
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
            <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-white">
              Select reference value:
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
                  xaxis: { title: groupByColumn },
                  yaxis: {
                    title: `Expression Levels of ${isRQSelected ? "RQ" : "DD"}_${selectedGene}`,
                  },
                  annotations: referenceDetails.column && referenceDetails.value
                    ? [
                        {
                          text: `Reference Column: ${referenceDetails.column}, Reference Group: ${referenceDetails.value}`,
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
                    : [] ,
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

