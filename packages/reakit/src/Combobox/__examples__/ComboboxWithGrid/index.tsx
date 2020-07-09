import * as React from "react";
import {
  unstable_useComboboxState as useComboboxState,
  unstable_Combobox as Combobox,
  unstable_ComboboxGrid as ComboboxGrid,
  unstable_ComboboxGridRow as ComboboxGridRow,
  unstable_ComboboxGridCell as ComboboxGridCell,
} from "reakit/Combobox";

function chunk<T>(array: T[], size: number) {
  const arr: T[] = [];
  for (let i = 0, j = array.length; i < j; i += size) {
    arr.push(array.slice(i, i + size));
  }
  return arr;
}

const initialValues = [
  "AliceBlue",
  "AntiqueWhite",
  "Aqua",
  "Aquamarine",
  "Azure",
  "Beige",
  "Bisque",
  "Black",
  "BlanchedAlmond",
  "Blue",
  "BlueViolet",
  "Brown",
  "BurlyWood",
  "CadetBlue",
  "Chartreuse",
  "Chocolate",
  "Coral",
  "CornflowerBlue",
  "Cornsilk",
  "Crimson",
  "Cyan",
  "DarkBlue",
  "DarkCyan",
  "DarkGoldenRod",
  "DarkGray",
  "DarkGrey",
  "DarkGreen",
  "DarkKhaki",
  "DarkMagenta",
  "DarkOliveGreen",
  "DarkOrange",
  "DarkOrchid",
  "DarkRed",
  "DarkSalmon",
  "DarkSeaGreen",
  "DarkSlateBlue",
  "DarkSlateGray",
  "DarkSlateGrey",
  "DarkTurquoise",
  "DarkViolet",
  "DeepPink",
  "DeepSkyBlue",
  "DimGray",
  "DimGrey",
  "DodgerBlue",
  "FireBrick",
  "FloralWhite",
  "ForestGreen",
  "Fuchsia",
  "Gainsboro",
  "GhostWhite",
  "Gold",
  "GoldenRod",
  "Gray",
  "Grey",
  "Green",
  "GreenYellow",
  "HoneyDew",
  "HotPink",
  "IndianRed",
  "Indigo",
  "Ivory",
  "Khaki",
  "Lavender",
  "LavenderBlush",
  "LawnGreen",
  "LemonChiffon",
  "LightBlue",
  "LightCoral",
  "LightCyan",
  "LightGoldenRodYellow",
  "LightGray",
  "LightGrey",
  "LightGreen",
  "LightPink",
  "LightSalmon",
  "LightSeaGreen",
  "LightSkyBlue",
  "LightSlateGray",
  "LightSlateGrey",
  "LightSteelBlue",
  "LightYellow",
  "Lime",
  "LimeGreen",
  "Linen",
  "Magenta",
  "Maroon",
  "MediumAquaMarine",
  "MediumBlue",
  "MediumOrchid",
  "MediumPurple",
  "MediumSeaGreen",
  "MediumSlateBlue",
  "MediumSpringGreen",
  "MediumTurquoise",
  "MediumVioletRed",
  "MidnightBlue",
  "MintCream",
  "MistyRose",
  "Moccasin",
  "NavajoWhite",
  "Navy",
  "OldLace",
  "Olive",
  "OliveDrab",
  "Orange",
  "OrangeRed",
  "Orchid",
  "PaleGoldenRod",
  "PaleGreen",
  "PaleTurquoise",
  "PaleVioletRed",
  "PapayaWhip",
  "PeachPuff",
  "Peru",
  "Pink",
  "Plum",
  "PowderBlue",
  "Purple",
  "RebeccaPurple",
  "Red",
  "RosyBrown",
  "RoyalBlue",
  "SaddleBrown",
  "Salmon",
  "SandyBrown",
  "SeaGreen",
  "SeaShell",
  "Sienna",
  "Silver",
  "SkyBlue",
  "SlateBlue",
  "SlateGray",
  "SlateGrey",
  "Snow",
  "SpringGreen",
  "SteelBlue",
  "Tan",
  "Teal",
  "Thistle",
  "Tomato",
  "Turquoise",
  "Violet",
  "Wheat",
  "White",
  "WhiteSmoke",
  "Yellow",
  "YellowGreen",
];

const style = {
  display: "inline-flex",
  width: 150,
  height: 150,
  alignItems: "center",
  padding: 8,
  border: "1px solid #aaa",
};

export default function ComboboxWithGrid() {
  const combobox = useComboboxState({ unstable_angular: true });
  const [values, setValues] = React.useState<string[][]>([]);

  React.useEffect(() => {
    if (!combobox.state) {
      setValues([]);
      return;
    }
    setValues(
      chunk(
        initialValues.filter((value) =>
          value.toLowerCase().includes(combobox.state.toLowerCase())
        ),
        3
      ).slice(0, 4)
    );
  }, [combobox.state]);

  return (
    <>
      <label htmlFor={combobox.baseId}>Type something</label>
      <br />
      <Combobox {...combobox} />
      <ComboboxGrid {...combobox}>
        {values.map((row, i) => (
          <ComboboxGridRow {...combobox} key={i}>
            {row.map((cell) => (
              <ComboboxGridCell
                {...combobox}
                key={cell}
                id={cell}
                as="div"
                style={style}
              >
                {cell}
              </ComboboxGridCell>
            ))}
          </ComboboxGridRow>
        ))}
      </ComboboxGrid>
    </>
  );
}
