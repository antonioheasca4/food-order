// Date de test pentru opțiunile produselor
// Acest fișier ar putea fi folosit pentru a simula date de backend

const productOptionsData = {
  // Exemple pentru diferite categorii de produse
  
  // Salate
  "salad_options": [
    {
      type: "dressing",
      name: "Dressing",
      selectMultiple: false,
      items: [
        { id: "ranch", name: "Ranch", price: 2 },
        { id: "caesar", name: "Caesar", price: 2 },
        { id: "vinaigrette", name: "Vinaigrette", price: 2 },
        { id: "olive_oil", name: "Ulei de măsline", price: 0 }
      ]
    },
    {
      type: "extra_ingredients",
      name: "Ingrediente extra",
      selectMultiple: true,
      items: [
        { id: "cheese", name: "Brânză extra", price: 3 },
        { id: "croutons", name: "Crutoane", price: 1 },
        { id: "nuts", name: "Nuci", price: 4 },
        { id: "avocado", name: "Avocado", price: 5 }
      ]
    }
  ],
  
  // Deserturi
  "dessert_options": [
    {
      type: "topping",
      name: "Topping",
      selectMultiple: true,
      items: [
        { id: "chocolate", name: "Ciocolată", price: 2 },
        { id: "caramel", name: "Caramel", price: 2 },
        { id: "fruits", name: "Fructe", price: 3 },
        { id: "nuts", name: "Nuci", price: 3 }
      ]
    },
    {
      type: "extra",
      name: "Extra",
      selectMultiple: false,
      items: [
        { id: "ice_cream", name: "Înghețată", price: 5 },
        { id: "whipped_cream", name: "Frișcă", price: 3 }
      ]
    }
  ],
  
  // Pizza
  "pizza_options": [
    {
      type: "crust",
      name: "Tip blat",
      selectMultiple: false,
      items: [
        { id: "thin", name: "Subțire", price: 0 },
        { id: "thick", name: "Pufos", price: 3 },
        { id: "stuffed", name: "Umplut cu brânză", price: 5 }
      ]
    },
    {
      type: "extra_toppings",
      name: "Topping extra",
      selectMultiple: true,
      items: [
        { id: "cheese", name: "Brânză extra", price: 4 },
        { id: "pepperoni", name: "Pepperoni", price: 5 },
        { id: "mushrooms", name: "Ciuperci", price: 3 },
        { id: "olives", name: "Măsline", price: 2 }
      ]
    },
    {
      type: "size",
      name: "Mărime",
      selectMultiple: false,
      items: [
        { id: "small", name: "Mică (25cm)", price: 0 },
        { id: "medium", name: "Medie (32cm)", price: 10 },
        { id: "large", name: "Mare (40cm)", price: 20 }
      ]
    }
  ],
  
  // Băuturi
  "drink_options": [
    {
      type: "size",
      name: "Mărime",
      selectMultiple: false,
      items: [
        { id: "small", name: "Mică (330ml)", price: 0 },
        { id: "medium", name: "Medie (500ml)", price: 3 },
        { id: "large", name: "Mare (750ml)", price: 5 }
      ]
    },
    {
      type: "ice",
      name: "Gheață",
      selectMultiple: false,
      items: [
        { id: "no_ice", name: "Fără gheață", price: 0 },
        { id: "little_ice", name: "Puțină gheață", price: 0 },
        { id: "normal_ice", name: "Gheață normală", price: 0 }
      ]
    }
  ]
};

export default productOptionsData; 