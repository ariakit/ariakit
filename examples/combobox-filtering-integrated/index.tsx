import { Combobox, ComboboxEmpty, ComboboxItem } from "./combobox.jsx";

export default function Example() {
  return (
    <Combobox autoSelect placeholder="Search food">
      <ComboboxEmpty>No results found</ComboboxEmpty>
      <ComboboxItem value="Apple" />
      <ComboboxItem value="Bacon" />
      <ComboboxItem value="Banana" />
      <ComboboxItem value="Broccoli" />
      <ComboboxItem value="Burger" />
      <ComboboxItem value="Cake" />
      <ComboboxItem value="Candy" />
      <ComboboxItem value="Carrot" />
      <ComboboxItem value="Cherry" />
      <ComboboxItem value="Chicken" />
      <ComboboxItem value="Chocolate" />
      <ComboboxItem value="Cookie" />
      <ComboboxItem value="Donut" />
      <ComboboxItem value="Egg" />
      <ComboboxItem value="Fish" />
      <ComboboxItem value="Fries" />
      <ComboboxItem value="Grapes" />
      <ComboboxItem value="Ice cream" />
      <ComboboxItem value="Lemon" />
      <ComboboxItem value="Meat" />
      <ComboboxItem value="Milk" />
      <ComboboxItem value="Orange" />
      <ComboboxItem value="Pasta" />
      <ComboboxItem value="Peach" />
      <ComboboxItem value="Pineapple" />
      <ComboboxItem value="Pizza" />
      <ComboboxItem value="Rice" />
      <ComboboxItem value="Salad" />
      <ComboboxItem value="Sandwich" />
      <ComboboxItem value="Sausage" />
      <ComboboxItem value="Steak" />
      <ComboboxItem value="Strawberry" />
      <ComboboxItem value="Sushi" />
      <ComboboxItem value="Tomato" />
      <ComboboxItem value="Waffle" />
      <ComboboxItem value="Watermelon" />
      <ComboboxItem value="Yogurt" />
    </Combobox>
  );
}
