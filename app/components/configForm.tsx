"use client"
import React, { useState, useEffect } from 'react';
import { Steps } from 'primereact/steps';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';

interface VariableCombination {
  column: string;
  values: string[];
  paragraph: string;
  sampleLocation: string;
}

interface FormData {
  columns: string[];
  remove: Record<string, string[]>;
  title: string;
  texts: { id: number; value: string }[];
  image: string;
  combinations: VariableCombination[];
  alpha_diversity: Record<string, Record<string, string>>;
}



const ConfigForm: React.FC<{ onSubmit: (data: FormData) => void, slug: any }> = ({ onSubmit, slug }) => {
  const [formData, setFormData] = useState<FormData>({
    columns: [],
    remove: {},
    title: '',
    texts: [{ id: 1, value: '' }],
    image: '',
    alpha_diversity: {},
    combinations: [{ column: '', values: [], paragraph: '' , sampleLocation: ''}],
  });
  

  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectesValues, setSelectedValues] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [sampleLocationValues, setSampleLocationValues] = useState<string[]>([]);

useEffect(() => {
    const projectId = slug;
    fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/admin/config/${projectId}`)
      .then((response) => response.json())
      .then((data) => {
        const columns = data?.data?.columns;
        const sampleLocations = Array.from(new Set(data?.data?.data.map((row: { [x: string]: any; }) => row[columns.indexOf('samplelocation')]))) as string[];
        setSampleLocationValues(sampleLocations.filter(location => location !== undefined));
        setAvailableColumns(data?.data?.columns);
        setData(data?.data?.data);
      });
}, []);





  const handleSampleLocationChange = (index: number, sampleLocation: string) => {
    const updatedCombinations = [...formData.combinations];
    updatedCombinations[index].sampleLocation = sampleLocation;
    setFormData({ ...formData, combinations: updatedCombinations });
  };
  

  const handleColumnsChange = (column: string) => {
    let selected = [...selectedColumns];
    if (selected.includes(column)) {
      selected = selected.filter((c) => c !== column);
    } else {
      selected.push(column);
    }
    setSelectedColumns(selected);
    setFormData({ ...formData, columns: selected });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string, id?: number) => {
    const { name, value } = e.target;
    if (name === 'title' || name === 'image') {
      setFormData({ ...formData, [name]: value });
    } else if (id !== undefined) {
      setFormData({
        ...formData,
        texts: formData.texts.map((text) => (text.id === id ? { ...text, value } : text)),
      });
    }
  };

  const handleAddField = () => {
    setFormData({
      ...formData,
      texts: [...formData.texts, { id: formData.texts.length + 1, value: '' }],
    });
  };

  const handleRemoveLastField = () => {
    if (formData.texts.length > 1) {
      setFormData({
        ...formData,
        texts: formData.texts.slice(0, -1),
      });
    }
  };

  const combinationExists = (column: string, values: string[], currentIndex: number) => {
    const valuesAsString = values.sort().join(',');
    return formData.combinations.some((comb, index) => 
      index !== currentIndex &&
      comb.column === column && 
      comb.values.sort().join(',') === valuesAsString
    );
  };
  
  
  const handleAddCombination = () => {
    // Solo intentar agregar una nueva combinación si ya hay combinaciones existentes
    if (formData.combinations.length > 0) {
      const lastComb = formData.combinations[formData.combinations.length - 1];
      console.log('Last combination:', lastComb);
      // Asegurar que la última combinación esté completamente llena antes de verificar duplicados
      if (!lastComb.column || !lastComb.values.length || !lastComb.paragraph) {
        alert('Please complete all fields in the last combination (including the paragraph) before adding a new one.');
        return;
      }
      // Verificar si la combinación ya existe en el estado
      if (combinationExists(lastComb.column, lastComb.values, formData.combinations.length - 1)) {
        alert('This combination already exists.');
        return;
      }
    }
    // Agregar una nueva combinación si no es duplicada y la última está completa
    setFormData({
      ...formData,
      combinations: [...formData.combinations, { column: '', values: [], paragraph: '', sampleLocation: ''}],
    });
  };
  
  
  

  const handleRemoveLastCombination = () => {
    if (formData.combinations.length > 1) {
      setFormData({
        ...formData,
        combinations: formData.combinations.slice(0, -1),
      });
    }
  };


  const handleColumnChange = (index: number, column: string) => {
    const updatedCombinations = [...formData.combinations];
    updatedCombinations[index] = { column, values: [], paragraph: '', sampleLocation: ''};
    setFormData({ ...formData, combinations: updatedCombinations });

    // Update available values based on selected column
    setSelectedValues(getUniqueValuesForColumn(column));
};



const getUniqueValuesForColumn = (column: string) => {
    const columnIndex = availableColumns.indexOf(column);
    const uniqueValues = Array.from(new Set(data.map(row => row[columnIndex])));
    return uniqueValues;
};

const handleValueChange = (index: number, values: string[]) => {
    const updatedCombinations = [...formData.combinations];
    updatedCombinations[index].values = values;
    setFormData({ ...formData, combinations: updatedCombinations });
};

const handleParagraphChange = (index: number, paragraph: string) => {
  const updatedCombinations = [...formData.combinations];
  updatedCombinations[index].paragraph = paragraph;
  setFormData({ ...formData, combinations: updatedCombinations });
};


const createCombinationName = (combination: VariableCombination) => {
  const existingNames = new Set(Object.keys(formData.alpha_diversity));
  let baseName = `${combination.column}_${combination.values.join('_')}`;
  let newName = baseName;
  let counter = 1;

  // Crear un nuevo nombre si el baseName ya existe en alpha_diversity
  while (existingNames.has(newName)) {
    newName = `${baseName}_${counter}`;
    counter++;
  }

  return newName;
};


const handleSubmit = () => {
  const alpha_diversity = {};

  formData.combinations.forEach(combination => {
    // Crear el nombre único para la combinación
    const combinationName = createCombinationName(combination);
    // Inicializar el objeto para el sampleLocation si aún no existe
    // if (!alpha_diversity[combination.sampleLocation]) {
    //   alpha_diversity[combination.sampleLocation] = {};
    // }
    // // Agregar la combinación y el párrafo al sampleLocation específico
    // // Verificar si la combinación ya existe para evitar duplicados
    // if (!alpha_diversity[combination.sampleLocation][combinationName]) {
    //   alpha_diversity[combination.sampleLocation][combinationName] = combination.paragraph;
    // }
  });

  const jsonData: FormData = {
    ...formData,
    alpha_diversity,
  };

  onSubmit(jsonData);
};



  const steps = [
    { label: 'Step 1' },
    { label: 'Step 2' },
    { label: 'Step 3' }
  ];

  return (
    <div className="w-1/2 mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">ConfigFile {slug}</h3>
      <Steps model={steps} activeIndex={activeStep} onSelect={(e) => setActiveStep(e.index)} />
      {activeStep === 0 && (
        <div className="mt-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Columns:
            </label>
            {availableColumns?.map((column) => (
              <div key={column} className="flex items-center mb-2">
                <Checkbox
                  inputId={column}
                  value={column}
                  checked={selectedColumns.includes(column)}
                  onChange={() => handleColumnsChange(column)}
                />
                <label htmlFor={column} className="ml-2">
                  {column}
                </label>
              </div>
            ))}
          </div>
          <Button label="Next" onClick={() => setActiveStep(1)} className="w-full mt-4" />
        </div>
      )}
      {activeStep === 1 && (
        <div className="mt-4">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title:
            </label>
            <InputText id="title" name="title" className='w-full' value={formData.title} onChange={(e) => handleChange(e, 'title')} />
          </div>
          {formData.texts.map((text, index) => (
            <div className="mb-4" key={text.id}>
              <label htmlFor={`text${text.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Text {text.id}:
              </label>
              <InputText
                id={`text${text.id}`}
                name={`text${text.id}`}
                value={text.value}
                onChange={(e) => handleChange(e, '', text.id)}
                className='w-full'
              />
              {index === formData.texts.length - 1 && index !== 0 && (
                <Button label="Remove" icon="pi pi-minus" onClick={handleRemoveLastField} className="mt-2" />
              )}
            </div>
          ))}
          
          <Button label="Add Text Field" icon="pi pi-plus" onClick={handleAddField} className="mb-4" />
          <div className="mb-4">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL:
            </label>
            <InputText id="image" className='w-full' name="image" value={formData.image} onChange={(e) => handleChange(e, 'image')} />
          </div>
          <div className="flex justify-between">
            <Button label="Back" onClick={() => setActiveStep(0)} className="w-full mr-2" />
            <Button label="Next" onClick={() => setActiveStep(2)} className="w-full mt-4" />

          </div>
        </div>
      )}{activeStep === 2 && (
        <div className="mt-4">
          {formData.combinations.map((combination, index) => (
            <div key={index} className="mb-4">
              <Dropdown
                value={combination.column}
                options={availableColumns}
                onChange={(e) => handleColumnChange(index, e.value)}
                placeholder="Select a column"
                className="mb-2"
              />
              {combination.column && (
                <MultiSelect
                  value={combination.values}
                  options={getUniqueValuesForColumn(combination.column)}
                  onChange={(e) => handleValueChange(index, e.value)}
                  placeholder="Select values"
                  className="mb-2"
                />
              )}
        <Dropdown
  value={combination.sampleLocation}
  options={sampleLocationValues.map(value => ({ label: value, value }))}
  onChange={(e) => handleSampleLocationChange(index, e.value)}
  placeholder="Select sample location"
  className="mb-2"
/>

              <InputText
                value={combination.paragraph}
                onChange={(e) => handleParagraphChange(index, e.target.value)}
                placeholder="Enter paragraph"
                className='w-full mb-2'
              />
            </div>
          ))}
          <Button label="Add Combination" icon="pi pi-plus" onClick={handleAddCombination} />
          {formData.combinations.length > 1 && (
            <Button label="Remove Combination" icon="pi pi-minus" onClick={handleRemoveLastCombination} className="ml-2 mt-4" />
          )}
          <Button label="Submit" icon="pi pi-check" onClick={handleSubmit} className="w-full" />
        </div>
      )}
    </div>
  );
};

export default ConfigForm;
