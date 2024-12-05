// config/dictionaries.ts
export const labelReplacements: { [key: string]: string } = {
    'alphad3level': 'AlphaD3 Level',
    'sampletime': 'Sample Time',
    'calciumlevel': 'Calcium Level',
};

export const colorPalettes = {
    samplelocation: {
        "Ileum": "#D9B19C", // Claro
        "Cecum": "#883D58", // Oscuro
        "Feces": "#98B6A1", // Claro
        colors: ["#295B46", "#D9B19C", "#98B6A1", "#883D58", "#E6D5AF", "#705C91"], // Alternado claro y oscuro
    },
    
    treatment: ["#D9B19C", "#334742", "#6982E0", "#D8BFD8", "#9169E0", "#883D58", "#C8C6B3", "#705C91", "#CCB954", "#A5E069", "#D9B19C", "#5F8168", "#D89B67", "#00263A", "#40679E"],
    // treatment: [
    //     "#F1E0C6", // Claro
    //     "#1A3C40", // Oscuro
    //     "#D8BFD8", // Claro
    //     "#2F4F4F", // Oscuro
    //     "#E0B0FF", // Claro
    //     "#4B0082", // Oscuro
    //     "#F5F5DC", // Claro
    //     "#4B2F4B", // Oscuro
    //     "#FFEB99", // Claro
    //     "#3E5F5F", // Oscuro
    //     "#FFF5EE", // Claro
    //     "#2E4A62", // Oscuro
    //     "#FFE4B5", // Claro
    //     "#5A3D3D", // Oscuro
    //     "#F0E68C", // Claro
    // ]
    
    alphad3level: ["#E6D5AF", "#0C359E", "#8FADD5", "#705C91", "#017319", "#A3AAA1", "#295B46", "#C8C6B3", "#005F87", "#334742", "#8F96A0", "#217172", "#883D58", "#B5B4A9", "#D89B67"],
    sampletime: ["#217172", "#C8C6B3", "#CCB954", "#898989", "#B5B4A9", "#E6D5AF", "#00263A", "#40679E", "#883D58", "#8FADD5", "#017319", "#295B46", "#1F5566", "#98B6A1"],
    diet: ["#E6D5AF", "#705C91", "#A3AAA1", "#883D58", "#5F8168", "#334742", "#217172", "#CCB954", "#898989", "#D89B67", "#B5B4A9", "#8FADD5", "#295B46", "#D9B19C"],
    age: {
        "14": "#E6D5AF", // Claro
        "21": "#334742", // Oscuro
        colors: ["#8FADD5", "#295B46", "#D89B67", "#1F5566", "#98B6A1", "#705C91", "#D9B19C", "#217172"],
    },
    calciumlevel: ["#883D58", "#A5E069",  "#A3AAA1",  "#CCB954", "#334742", "#D9B19C", "#5F8168", "#00263A", "#40679E", "#017319", "#8FADD5", "#D89B67"],
    name: [
        "#D9B19C", // Claro
        "#334742", // Oscuro
        "#E6D5AF", // Claro
        "#217172", // Oscuro
        "#D89B67", // Claro
        "#883D58", // Oscuro
        "#C8C6B3", // Claro
        "#705C91", // Oscuro
        "#CCB954", // Claro
        "#40679E", // Oscuro
        "#B5B4A9", // Claro
        "#00263A", // Oscuro
        "#898989", // Claro
        "#5F8168", // Oscuro
        "#1F5566", // Claro
    ],
    
    identifier: [
        "#295B46", // Oscuro
        "#D9B19C", // Claro
        "#98B6A1", // Oscuro
        "#883D58", // Claro
        "#705C91", // Oscuro
        "#E6D5AF", // Claro
        "#334742", // Oscuro
        "#8FADD5", // Claro
        "#005F87", // Oscuro
        "#B5B4A9", // Claro
        "#C8C6B3", // Oscuro
        "#40679E", // Claro
        "#217172", // Oscuro
        "#D89B67", // Claro
        "#A3AAA1", // Oscuro
    ],
    default: ["#D9B19C", "#334742", "#E6D5AF", "#883D58", "#705C91", "#A3AAA1", "#C8C6B3", "#217172", "#295B46", "#8FADD5", "#D89B67", "#5F8168", "#00263A", "#40679E", "#898989"], // Combinación predeterminada alternada
};

export const order = {
    "SampleLocation": { "Ileum": 2, "Cecum": 1, "Feces": 3 },
    // "Age": { "21": 1, "14": 2 }
};
