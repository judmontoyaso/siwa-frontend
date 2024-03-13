"use client"
import React, { useState, useEffect } from 'react';


  
const TagsInput = ({ data, selectedGroup }: { data: any, selectedGroup: any }) => {
const [tags, setTags] = useState<any[]>([]);
const [availableTags, setAvailableTags] = useState<any[]>([]);
const [activeTags, setActiveTags] = useState({});


const getValuesForColumn = (data: { columns: string | any[]; data: any[]; }, columnName: any) => {
  

    if (!data || !columnName) return [];
  
    const columnIndex = data.columns.indexOf(columnName);
    if (columnIndex === -1) return [];
  
    const uniqueValues = new Set(data?.data.map((row: { [x: string]: any; }) => row[columnIndex]));
    return Array.from(uniqueValues);
  };
  
  const getAllTagsForColumn = (data: { columns: string | any[]; data: any[]; }, columnName: any) => {
    if (!data || !columnName) return [];
  
    const columnIndex = data?.columns?.indexOf(columnName);
    if (columnIndex === -1) return [];
  
    const allTags = new Set(data?.data?.map((row: { [x: string]: any; }) => row[columnIndex]));
    return Array.from(allTags);
  };

    useEffect(() => {
        const allTags = getAllTagsForColumn(data?.data, selectedGroup); // Utiliza la función definida en el Paso 1
        const activeTagsForColumn = (activeTags as { [key: string]: any })[selectedGroup] || [];
    
        const missingTags = allTags.filter(tag => !activeTagsForColumn.includes(tag));
        setAvailableTags(missingTags);
    }, [data?.data, selectedGroup, activeTags]);
    

useEffect(() => {
        const newTags = getValuesForColumn(data, selectedGroup);
        setTags(newTags);
}, [data, selectedGroup]);

const removeTag = (index: number) => {
    setTags((currentTags) => currentTags.filter((_, i) => i !== index));
};

const updateTags = (columnName: string | number, tag: any, remove = false) => {
    setActiveTags((currentTags) => {
    const updatedTags: { [key: string]: any[] } = { ...currentTags };
    // Si la columna no existe, la inicializa con un array vacío
    if (!updatedTags[columnName]) {
        updatedTags[columnName] = [];
    }

    if (remove) {
        // Elimina el tag si 'remove' es true
        updatedTags[columnName] = updatedTags[columnName].filter((t: any) => t !== tag);
    } else {
        // Añade el tag si no está presente
        if (!updatedTags[columnName].includes(tag)) {
            updatedTags[columnName].push(tag);
        }
    }
  
      return updatedTags;
    });
  };
  

  return (
    <div>
    <div className="flex flex-wrap">
      {tags.map((tag, index) => (
        <div key={index} className="flex items-center bg-blue-500 text-white text-xs font-bold mr-2 px-2.5 py-0.5 rounded m-1">
          {tag}
          <button onClick={() => removeTag(index)} className="ml-2 cursor-pointer text-lg">&times;</button>
        </div>
      ))}
    </div>
     <div>
     <h3>Tags faltantes para {selectedGroup}:</h3>
     <div className="tags-container">
       {availableTags.map((tag, index) => (
         <button key={index} className="tag" onClick={() => updateTags(selectedGroup, tag)}>
           {tag} (+)
         </button>
       ))}
     </div>
   </div>
   </div>
  );
};

export default TagsInput;

