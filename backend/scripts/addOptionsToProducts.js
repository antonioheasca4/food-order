import mongoose from 'mongoose';
import foodModel from '../models/foodModel.js';
import 'dotenv/config';
import { connectDB } from '../config/db.js';

// Date pentru optiunile produselor
const productOptionsData = {  
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

// Mapare intre categorii si optiunile disponibile
const categoryMap = {
  'salads': 'salad_options',
  'salata': 'salad_options',
  'desert': 'dessert_options',
  'deserts': 'dessert_options',
  'sweets': 'dessert_options',
  'pizza': 'pizza_options',
  'Drinks': 'drink_options',
  'bauturi': 'drink_options'
};

async function addOptionsToProducts() {
  try {
    // Conectare la baza de date
    console.log('Conectare la baza de date...');
    await connectDB();
    
    // Obtine toate produsele
    const products = await foodModel.find({});
    console.log(`S-au gasit ${products.length} produse in baza de date.`);
    
    let updatedCount = 0;
    
    // Itereaza prin produse si adauga optiuni
    for (const product of products) {
      // Verifica daca produsul are deja optiuni
      if (product.options && product.options.length > 0) {
        console.log(`Produsul ${product.name} are deja optiuni. Se sare peste.`);
        continue;
      }
      
      // Verifica daca exista optiuni pentru categoria produsului
      const categoryKey = product.category.toLowerCase();
      let options = null;
      
      if (categoryMap[categoryKey] && productOptionsData[categoryMap[categoryKey]]) {
        options = productOptionsData[categoryMap[categoryKey]];
      } else {
        // Cauta o potrivire partiala in categorii
        for (const key in categoryMap) {
          if (categoryKey.includes(key) || key.includes(categoryKey)) {
            options = productOptionsData[categoryMap[key]];
            break;
          }
        }
      }
      
      if (options) {
        // Actualizeaza produsul cu optiunile gasite
        await foodModel.findByIdAndUpdate(product._id, { options });
        console.log(`Optiuni adaugate pentru produsul ${product.name} (categoria ${product.category}).`);
        updatedCount++;
      } else {
        console.log(`Nu s-au gasit optiuni pentru produsul ${product.name} (categoria ${product.category}).`);
      }
    }
    
    console.log(`Proces finalizat. S-au actualizat ${updatedCount} produse din ${products.length}.`);
  } catch (error) {
    console.error('Eroare:', error);
  } finally {
    // Inchidem conexiunea la baza de date
    await mongoose.connection.close();
    console.log('Conexiune la baza de date inchisa.');
  }
}

addOptionsToProducts(); 