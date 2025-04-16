import mongoose from 'mongoose';
import foodModel from '../models/foodModel.js';
import 'dotenv/config';
import { connectDB } from '../config/db.js';

// Definirea opțiunilor pentru fiecare categorie de produse
const categoryOptionsData = {
  // Salate - acum Gamelă Verde
  "Gamelă Verde": [
    {
      type: "dressing",
      name: "Dressing",
      selectMultiple: false,
      items: [
        { id: "none", name: "Fără", price: 0 },
        { id: "olive_oil", name: "Ulei de măsline și lămâie", price: 0 },
        { id: "balsamic", name: "Balsamic", price: 2 },
        { id: "yogurt", name: "Iaurt", price: 2 }
      ]
    },
    {
      type: "extra",
      name: "Extra",
      selectMultiple: true,
      items: [
        { id: "chicken", name: "Extra pui", price: 6 },
        { id: "feta", name: "Brânză feta", price: 4 },
        { id: "nuts", name: "Mix de semințe", price: 3 },
        { id: "avocado", name: "Avocado", price: 5 }
      ]
    },
    {
      type: "size",
      name: "Mărime",
      selectMultiple: false,
      items: [
        { id: "small", name: "Regiment (mică)", price: 0 },
        { id: "medium", name: "Brigadă (medie)", price: 4 },
        { id: "large", name: "Divizie (mare)", price: 8 }
      ]
    }
  ],
  
  // Rolls - acum Hrană de Rezervă
  "Hrană de Rezervă": [
    {
      type: "sauce",
      name: "Sos",
      selectMultiple: false,
      items: [
        { id: "none", name: "Fără", price: 0 },
        { id: "mild", name: "Tactic (moderat picant)", price: 0 },
        { id: "spicy", name: "Exploziv (picant)", price: 0 },
        { id: "garlic", name: "Aliat (usturoi)", price: 2 }
      ]
    },
    {
      type: "extra",
      name: "Extra",
      selectMultiple: true,
      items: [
        { id: "cheese", name: "Brânză", price: 3 },
        { id: "vegetables", name: "Legume", price: 3 },
        { id: "meat", name: "Carne extra", price: 5 }
      ]
    },
    {
      type: "quantity",
      name: "Cantitate",
      selectMultiple: false,
      items: [
        { id: "2pcs", name: "2 bucăți (Soldat)", price: 0 },
        { id: "4pcs", name: "4 bucăți (Caporal)", price: 5 },
        { id: "6pcs", name: "6 bucăți (Sergent)", price: 10 }
      ]
    }
  ],
  
  // Deserts - acum Recompense
  "Recompense": [
    {
      type: "topping",
      name: "Topping",
      selectMultiple: true,
      items: [
        { id: "none", name: "Fără", price: 0 },
        { id: "caramel", name: "Caramel", price: 2 },
        { id: "chocolate", name: "Ciocolată", price: 2 },
        { id: "fruits", name: "Fructe", price: 3 }
      ]
    },
    {
      type: "size",
      name: "Mărime",
      selectMultiple: false,
      items: [
        { id: "small", name: "Medalie de bronz (mică)", price: 0 },
        { id: "medium", name: "Medalie de argint (medie)", price: 4 },
        { id: "large", name: "Medalie de aur (mare)", price: 7 }
      ]
    }
  ],
  
  // Sandwich - acum Rații de Campanie
  "Rații de Campanie": [
    {
      type: "bread",
      name: "Tip pâine",
      selectMultiple: false,
      items: [
        { id: "white", name: "Albă", price: 0 },
        { id: "whole", name: "Integrală", price: 0 },
        { id: "ciabatta", name: "Ciabatta", price: 2 },
        { id: "bagel", name: "Bagel", price: 2 }
      ]
    },
    {
      type: "add_on",
      name: "Adaos",
      selectMultiple: true,
      items: [
        { id: "cheese", name: "Brânză", price: 3 },
        { id: "bacon", name: "Bacon", price: 4 },
        { id: "egg", name: "Ou", price: 3 },
        { id: "avocado", name: "Avocado", price: 5 }
      ]
    },
    {
      type: "sauce",
      name: "Sos",
      selectMultiple: false,
      items: [
        { id: "none", name: "Fără", price: 0 },
        { id: "mayo", name: "Maioneză", price: 0 },
        { id: "mustard", name: "Muștar", price: 0 },
        { id: "bbq", name: "BBQ", price: 0 }
      ]
    }
  ],
  
  // Cake - acum Festin de Permisie
  "Festin de Permisie": [
    {
      type: "flavor",
      name: "Aromă",
      selectMultiple: false,
      items: [
        { id: "vanilla", name: "Vanilie", price: 0 },
        { id: "chocolate", name: "Ciocolată", price: 0 },
        { id: "red_velvet", name: "Red Velvet", price: 2 },
        { id: "caramel", name: "Caramel", price: 2 }
      ]
    },
    {
      type: "topping",
      name: "Topping",
      selectMultiple: true,
      items: [
        { id: "none", name: "Fără", price: 0 },
        { id: "cream", name: "Frișcă", price: 2 },
        { id: "fruits", name: "Fructe", price: 3 },
        { id: "nuts", name: "Nuci", price: 3 }
      ]
    },
    {
      type: "size",
      name: "Mărime",
      selectMultiple: false,
      items: [
        { id: "slice", name: "Felie (Permisie de o zi)", price: 0 },
        { id: "small", name: "Mică (Permisie de weekend)", price: 10 },
        { id: "medium", name: "Medie (Permisie de 7 zile)", price: 20 }
      ]
    }
  ],
  
  // Pure Veg - acum Pentru Vegetarieni
  "Pentru Vegetarieni": [
    {
      type: "spice_level",
      name: "Nivel condimentare",
      selectMultiple: false,
      items: [
        { id: "mild", name: "Recrut (blând)", price: 0 },
        { id: "medium", name: "Sergent (mediu)", price: 0 },
        { id: "hot", name: "Comandant (picant)", price: 0 }
      ]
    },
    {
      type: "add_on",
      name: "Adaos",
      selectMultiple: true,
      items: [
        { id: "paneer", name: "Brânză tofu", price: 4 },
        { id: "mushroom", name: "Ciuperci extra", price: 3 },
        { id: "cashew", name: "Caju", price: 3 }
      ]
    },
    {
      type: "rice",
      name: "Orez",
      selectMultiple: false,
      items: [
        { id: "none", name: "Fără", price: 0 },
        { id: "white", name: "Alb", price: 3 },
        { id: "brown", name: "Brun", price: 4 }
      ]
    }
  ],
  
  // Paste - acum De Zi cu Zi
  "De Zi cu Zi": [
    {
      type: "pasta_type",
      name: "Tip paste",
      selectMultiple: false,
      items: [
        { id: "spaghetti", name: "Spaghetti", price: 0 },
        { id: "penne", name: "Penne", price: 0 },
        { id: "fettuccine", name: "Fettuccine", price: 0 },
        { id: "fusilli", name: "Fusilli", price: 0 }
      ]
    },
    {
      type: "extra",
      name: "Extra",
      selectMultiple: true,
      items: [
        { id: "cheese", name: "Parmezan extra", price: 3 },
        { id: "chicken", name: "Pui", price: 6 },
        { id: "shrimp", name: "Creveți", price: 8 },
        { id: "mushrooms", name: "Ciuperci", price: 3 }
      ]
    },
    {
      type: "sauce",
      name: "Sos",
      selectMultiple: false,
      items: [
        { id: "tomato", name: "Roșii", price: 0 },
        { id: "alfredo", name: "Alfredo", price: 3 },
        { id: "pesto", name: "Pesto", price: 3 },
        { id: "arrabbiata", name: "Arrabbiata", price: 2 }
      ]
    }
  ],
  
  // Tăiței - acum Ranforsări
  "Ranforsări": [
    {
      type: "noodle_type",
      name: "Tip tăiței",
      selectMultiple: false,
      items: [
        { id: "egg", name: "Ou", price: 0 },
        { id: "rice", name: "Orez", price: 0 },
        { id: "udon", name: "Udon", price: 2 },
        { id: "soba", name: "Soba", price: 2 }
      ]
    },
    {
      type: "protein",
      name: "Proteină",
      selectMultiple: false,
      items: [
        { id: "none", name: "Fără", price: 0 },
        { id: "chicken", name: "Pui", price: 6 },
        { id: "beef", name: "Vită", price: 8 },
        { id: "tofu", name: "Tofu", price: 4 }
      ]
    },
    {
      type: "extras",
      name: "Extra",
      selectMultiple: true,
      items: [
        { id: "egg", name: "Ou", price: 2 },
        { id: "extra_veggies", name: "Legume extra", price: 3 },
        { id: "chili", name: "Ardei iute", price: 1 }
      ]
    }
  ]
};

// Actualizează opțiunile pentru fiecare produs
async function updateProductOptions() {
  try {
    // Conectare la baza de date
    console.log('Conectare la baza de date...');
    await connectDB();
    
    // Obține toate produsele
    const products = await foodModel.find({});
    console.log(`S-au găsit ${products.length} produse în baza de date.`);
    
    let updatedCount = 0;
    
    // Iterează prin produse și adaugă opțiuni
    for (const product of products) {
      // Verifică dacă există opțiuni pentru categoria produsului
      if (categoryOptionsData[product.category]) {
        // Actualizează produsul cu opțiunile specifice categoriei
        await foodModel.findByIdAndUpdate(product._id, { 
          options: categoryOptionsData[product.category] 
        });
        
        console.log(`Opțiuni actualizate pentru produsul "${product.name}" (categoria ${product.category}).`);
        updatedCount++;
      } else {
        console.log(`Nu s-au găsit opțiuni definite pentru categoria "${product.category}". Produs: "${product.name}".`);
      }
    }
    
    console.log(`Proces finalizat. S-au actualizat ${updatedCount} produse din ${products.length}.`);
  } catch (error) {
    console.error('Eroare:', error);
  } finally {
    // Închide conexiunea la baza de date
    await mongoose.connection.close();
    console.log('Conexiune la baza de date închisă.');
  }
}

// Rulează scriptul
updateProductOptions(); 