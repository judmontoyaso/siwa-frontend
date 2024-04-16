"use client"
import { useState, useEffect } from "react";
import Plot from "react-plotly.js";

const LefsePlot = ({ data, width }: { data: any, width: any }) => {
  const [traces, setTraces] = useState([]);
  const [layout, setLayout] = useState({});


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
    shuffleColors();  // Aleatoriza los colores al montar y cada vez que cambian los datos
  }, [data]);

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

    const newLayout = {
      // title: 'LefSe Results',
      xaxis: { title: 'LDA Score' },
      // yaxis: { title: 'Features'},
      barmode: 'group',
      margin: { l: 200, r: 20, t: 40, b: 80 },
      height: 900,
      width: width || undefined,
      showlegend: true, // Asegura que la leyenda se muestre siempre
    };

    setTraces(newTraces as never[]);
    setLayout(newLayout);
  }, [data, width, colorOrder]);

  useEffect(() => {
    function handleResize() {
      const screenWidth = window.innerWidth;
      const legendPosition = screenWidth >= 768 && screenWidth <= 1280 ? 'top' : 'right';

      setLayout(prevLayout => ({
        ...prevLayout,
        legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: 1.1, yanchor: 'top' }
      }));
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Llama inicialmente para configurar

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  return (
    <Plot
      data={traces}
      layout={layout}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default LefsePlot;
