"use client"
import Plotly, { Config } from "plotly.js";
import { Button } from "primereact/button";
import React from "react";
import { useState, useEffect } from "react";
import Plot from "react-plotly.js";

const LefsePlot = ({ data, width, group }: { data: any, width: any, group:any }) => {
  const [traces, setTraces] = useState([]);
  const [layout, setLayout] = useState({});
  const plotRef = React.useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const colors = [
    "#092538", // Azul oscuro principal
    "#34675C", // Verde azulado más claro
    "#2E4057", // Azul petróleo oscuro
    
    // Amarillos y naranjas
    "#FEF282", // Amarillo claro principal
    "#F6C324", // Amarillo mostaza
    "#415a55", // Verde azulado oscuro (color adicional que querías incluir)
    "#FFA726", // Naranja
    "#FF7043", // Naranja rojizo
  
    // Grises y neutrales
    "#BFBFBF", // Gris claro
    "#8C8C8C", // Gris medio
    "#616161", // Gris oscuro
    "#424242", // Gris muy oscuro
  
    // Rojos y púrpuras
    "#E53935", // Rojo
    "#D81B60", // Fucsia
    "#8E24AA", // Púrpura
  
    // Verdes y azules
    "#43A047", // Verde
    "#00ACC1", // Cian
    "#1E88E5", // Azul
  
    // Colores adicionales para diversidad
    "#6D4C41", // Marrón
    "#FDD835", // Amarillo dorado
    "#26A69A", // Verde azulado claro
    "#7E57C2", // Lavanda oscuro
    "#EC407A", // Rosa
];
const colorPalettes = {
  samplelocation: ["#074b44", "#017fb1", "#f99b35"],
  treatment: ["#035060", "#f99b35", "#4e8e74"],
  alphad3level: ["#8cdbf4", "#f7927f", "#f7e76d"],
  
};

  // Función para aleatorizar la paleta de colores
  const [colorOrder, setColorOrder] = useState<string[]>([]);

  const shuffleColors = () => {
    let shuffled = colors
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    setColorOrder(shuffled);
  };

  useEffect(() => {
    if (group && colorPalettes[group as keyof typeof colorPalettes]) {
        setColorOrder(colorPalettes[group as keyof typeof colorPalettes]);
    }
console.log(colorOrder)
}, [group]);

  // useEffect(() => {
  //   shuffleColors();  // Aleatoriza los colores al montar y cada vez que cambian los datos
  // }, [data]);

  useEffect(() => {
    const newTraces: ((prevState: never[]) => never[]) | { type: string; orientation: string; x: any; y: any; name: unknown; }[] = [];
    const groups = [...new Set(data?.data?.map((item: any[]) => item[1]))];

    groups.forEach((group, index) => {
      const groupData = data?.data?.filter((item: unknown[]) => item[1] === group);

      // Ordena groupData de mayor a menor según el valor de 'ef_lda' (índice 2)
      const trace = {
        type: 'bar',
        orientation: 'h',
        x: groupData.map((item: any[]) => item[2]),
        y: groupData.map((item: any[]) => item[0]),
        name: group,
        marker: { color: colorOrder[index % colorOrder.length] } 
      };

      newTraces.push(trace);
    });

    function truncateTickLabels(label: string | any[]) {
      const maxLength = 15; // Define la longitud máxima del texto
      return label?.length > maxLength ? `${label.slice(0, maxLength - 3)}...` : label;
    }

    const newLayout = {
      // title: 'LefSe Results',
      xaxis: { title: 'LDA Score' },
      yaxis: {     
        tickvals: data?.data.map((item: any, index: any) => index),
        automargin: true,     tickfont: {
        size: 12,
      },
      ticklen: 5, // Longitud de las líneas de tick (puedes aumentarla si es necesario)
      standoff: 15,
    },
      barmode: 'group',
      margin: { l: 200, r: 20, t: 40, b: 80 },
      height: 900,
      width: width || undefined,
      showlegend: true,
      dragmode: false ,
      legend: {
        x: 0,
        xanchor: 'center',
        y: 1.1,  // Posición Y ligeramente por encima de la parte superior del gráfico
        yanchor: 'top',
        orientation: 'h'  // Orientación horizontal
      }    };

    setTraces(newTraces as never[]);
    setLayout(newLayout);
  }, [isLoaded, data, window.innerWidth, document?.getElementById('plofather')?.offsetWidth]);

  useEffect(() => {
    function handleResize() {
      const screenWidth = window.innerWidth;
      const legendPosition = screenWidth >= 768 && screenWidth <= 1280 ? 'top' : 'right';

      setLayout(prevLayout => ({
        ...prevLayout,
        legend: { orientation: 'h', x: 0, xanchor: 'center', y: 1.1, yanchor: 'top' }
      }));
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Llama inicialmente para configurar

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const config: Partial<Config> = {
    displaylogo: false,
responsive: true,
    modeBarButtonsToRemove: [
      'zoom2d', 'pan2d', 'select2d', 'lasso2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian', 'zoom3d', 
      'pan3d', 'orbitRotation', 'tableRotation', 'resetCameraDefault3d', 'resetCameraLastSave3d', 
      'hoverClosest3d', 'zoomInGeo', 'zoomOutGeo', 'resetGeo', 'hoverClosestGeo', 'sendDataToCloud', 'hoverClosestGl2d', 'hoverClosestPie', 
      'toggleHover', 'toggleSpikelines', 'resetViewMapbox'
    ],
    scrollZoom: false,
    modeBarButtonsToAdd: [],
  };

  // const downloadImage = () => {
  //   if (plotRef.current) {
  //     console.log(plotRef.current)
  //     Plotly.toImage((plotRef?.current?.el as any), {
  //       format: 'png',
  //       height: (layout as { height: number }).height,
  //       width: (layout as { width: number }).width
  //     })
  //     .then(function(url) {
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = 'Differential_abundance_.png'; // Nombre del archivo cuando se decarga
  //       document.body.appendChild(a);
  //       a.click();
  //       document.body.removeChild(a);
  //     })
  //     .catch(err => {
  //       console.error('Error downloading image:', err);
  //     });
  //   }
  // };

  const zoomIn = () => {
    if (plotRef.current) {
      Plotly.relayout(plotRef.current, {
        'xaxis.autorange': false,
        'yaxis.autorange': false,
        'xaxis.range': [0.5, 1.5],
        'yaxis.range': [0.5, 1.5]
      });
    }
  };

  const zoomOut = () => {
    if (plotRef.current) {
      Plotly.relayout(plotRef.current, {
        'xaxis.autorange': true,
        'yaxis.autorange': true
      });
    }
  };

  const resetView = () => {
    if (plotRef.current) {
      Plotly.relayout(plotRef.current, {
        'xaxis.autorange': true,
        'yaxis.autorange': true
      });
    }
  };

  return (


      <Plot
        ref={plotRef}
        data={traces}
        layout={layout}
        style={{ width: '100%', height: '100%' }}
        config={config}
        onInitialized={() => setIsLoaded(true)}
      />

  
  );
};

export default LefsePlot;
