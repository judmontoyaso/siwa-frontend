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
    treatment: ["#D9B19C", "#334742", "#E6D5AF", "#217172", "#D89B67", "#883D58", "#C8C6B3", "#705C91", "#CCB954", "#898989", "#D9B19C", "#5F8168", "#D89B67", "#00263A", "#40679E"],
    alphad3level: ["#E6D5AF", "#0C359E", "#8FADD5", "#705C91", "#017319", "#A3AAA1", "#295B46", "#C8C6B3", "#005F87", "#334742", "#8F96A0", "#217172", "#883D58", "#B5B4A9", "#D89B67"],
    sampletime: ["#D9B19C", "#898989", "#C8C6B3", "#CCB954", "#705C91", "#B5B4A9", "#E6D5AF", "#00263A", "#40679E", "#883D58", "#8FADD5", "#017319", "#295B46", "#1F5566", "#98B6A1"],
    diet: ["#E6D5AF", "#705C91", "#C8C6B3", "#883D58", "#5F8168", "#334742", "#A3AAA1", "#217172", "#CCB954", "#898989", "#D89B67", "#B5B4A9", "#8FADD5", "#295B46", "#D9B19C"],
    age: {
        "14": "#E6D5AF", // Claro
        "21": "#334742", // Oscuro
        colors: ["#8FADD5", "#295B46", "#D89B67", "#1F5566", "#98B6A1", "#705C91", "#D9B19C", "#217172"],
    },
    calciumlevel: ["#E6D5AF", "#883D58", "#C8C6B3", "#705C91", "#A3AAA1", "#B5B4A9", "#CCB954", "#334742", "#D9B19C", "#5F8168", "#00263A", "#40679E", "#017319", "#8FADD5", "#D89B67"],
    default: ["#D9B19C", "#334742", "#E6D5AF", "#883D58", "#705C91", "#A3AAA1", "#C8C6B3", "#217172", "#295B46", "#8FADD5", "#D89B67", "#5F8168", "#00263A", "#40679E", "#898989"], // Combinación predeterminada alternada
};

export const order = {
    "SampleLocation": { "Ileum": 1, "Cecum": 2, "Feces": 3 },
    // "Age": { "21": 1, "14": 2 }
};
