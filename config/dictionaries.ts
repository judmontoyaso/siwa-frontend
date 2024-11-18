// config/dictionaries.ts
export const labelReplacements: { [key: string]: string } = {
    'alphad3level': 'AlphaD3 Level',
    'sampletime': 'Sample Time',
    'calciumlevel': 'Calcium Level',
};

export const colorPalettes = {
    samplelocation: ["#CCB954", "#88823E", "#D9B19C", "#D89B67", "#00263A", "#40679E", "#0C359E", "#8FADD5", "#017319", "#1F5566", "#295B46", "#98B6A1", "#E6D5AF", "#8F96A0", "#005F87"],
    treatment: ["#334742", "#5F8168", "#217172", "#883D58", "#705C91", "#898989", "#B5B4A9", "#C8C6B3", "#CCB954", "#88823E", "#D9B19C", "#D89B67", "#00263A", "#40679E"],
    alphad3level: ["#0C359E", "#8FADD5", "#017319", "#1F5566", "#295B46", "#98B6A1", "#E6D5AF", "#8F96A0", "#005F87", "#334742", "#5F8168", "#217172", "#883D58", "#705C91", "#A3AAA1"],
    sampletime: ["#898989", "#B5B4A9", "#C8C6B3", "#CCB954", "#88823E", "#D9B19C", "#D89B67", "#00263A", "#40679E", "#0C359E", "#8FADD5", "#017319", "#1F5566", "#295B46", "#98B6A1"],
    diet: ["#E6D5AF", "#8F96A0", "#005F87", "#334742", "#5F8168", "#217172", "#883D58", "#705C91", "#A3AAA1", "#898989", "#B5B4A9", "#C8C6B3", "#CCB954", "#88823E", "#D9B19C"],
    age: ["#8FADD5", "#00263A", "#40679E", "#0C359E", "#D89B67", "#017319", "#1F5566", "#295B46", "#98B6A1", "#E6D5AF", "#8F96A0", "#005F87", "#334742", "#5F8168", "#217172"],
    calciumlevel: ["#883D58", "#705C91", "#A3AAA1", "#898989", "#B5B4A9", "#C8C6B3", "#CCB954", "#88823E", "#D9B19C", "#D89B67", "#00263A", "#40679E", "#0C359E", "#8FADD5", "#017319"],
};

export const order = {
    "SampleLocation": {"Ileum":2, "Cecum":1, "Feces":3},
    "Age" : {"21":1, "14":2}
}
