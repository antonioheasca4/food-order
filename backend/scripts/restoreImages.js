import mongoose from 'mongoose';
import foodModel from '../models/foodModel.js';
import 'dotenv/config';
import { connectDB } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtinem calea curenta
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapare intre numele produselor militare si imaginile originale
const originalImageMapping = {
  // Salate - Gamela Verde  
  "Salata de Cazarmă": "food_1.png",
  "Verdeața Locotenentului": "food_2.png",
  "Camuflaj de Legume": "food_3.png",
  "Ordin de Pui": "food_4.png",
  
  // Rolls - Hrana de Rezerva
  "Cartuș Umplut": "food_5.png", 
  "Muniție Picantă": "food_6.png",
  "Grenadă cu Pui": "food_7.png",
  "Rezerva Strategică": "food_8.png",
  
  // Deserts - Recompense
  "Medalie Înghețată": "food_9.png",
  "Permisie Dulce": "food_10.png",
  "Bocanci Dulci": "food_11.png",
  "Deșertul Vanilat": "food_12.png",
  
  // Sandwich - Rații de Campanie
  "Aprovizionare cu Pui": "food_13.png",
  "Rația Ecologistului": "food_14.png",
  "Raport de Luptă": "food_15.png",
  "Pâine de Front": "food_16.png",
  
  // Cake - Festin de Permisie
  "Decorația Dulce": "food_17.png",
  "Tort de Camuflaj": "food_18.png",
  "Tort de Grade": "food_19.png",
  "Prăjitura Recruților": "food_20.png",
  
  // Pure Veg - Pentru Vegetarieni
  "Asalt de Ciuperci": "food_21.png",
  "Conopidă în Misiune": "food_22.png",
  "Pluton de Legume": "food_23.png",
  "Tactică Verde": "food_24.png",
  
  // Pasta - De Zi cu Zi
  "Ordin de Brânzeturi": "food_25.png",
  "Rația Comandantului": "food_26.png",
  "Uniforma Albă": "food_27.png",
  "Manevră de Pui": "food_28.png",
  
  // Noodles - Ranforsări
  "Tăiței de Transmisiuni": "food_29.png",
  "Detașament Verde": "food_30.png",
  "Tăiței de Paradă": "food_31.png",
  "Bază de Operațiuni": "food_32.png"
};

async function restoreOriginalImages() {
  try {
    // Conectare la baza de date
    console.log('Conectare la baza de date...');
    await connectDB();
    
    // Obține toate produsele din baza de date
    const products = await foodModel.find({});
    console.log(`S-au găsit ${products.length} produse în baza de date.`);
    
    let updatedCount = 0;
    
    // Verifică directorul de upload
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      console.log('Crearea directorului de upload...');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Directorul sursă pentru imagini originale
    const sourceImagesDir = path.join(__dirname, '..', '..', 'food-del-assets', 'assets', 'frontend_assets');
    
    // Verifică și copiază imaginile în directorul uploads dacă nu există deja
    for (const imgName of Object.values(originalImageMapping)) {
      const sourcePath = path.join(sourceImagesDir, imgName);
      const destPath = path.join(uploadsDir, imgName);
      
      if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Imagine copiată: ${imgName}`);
      }
    }
    
    // Actualizează imaginile produselor în baza de date
    for (const product of products) {
      if (originalImageMapping[product.name]) {
        // Verifică dacă imaginea actuală nu este deja cea corectă
        if (product.image !== originalImageMapping[product.name]) {
          await foodModel.findByIdAndUpdate(product._id, {
            image: originalImageMapping[product.name]
          });
          console.log(`Imagine restaurată pentru produsul "${product.name}": ${originalImageMapping[product.name]}`);
          updatedCount++;
        } else {
          console.log(`Produsul "${product.name}" are deja imaginea corectă: ${product.image}`);
        }
      } else {
        console.log(`Nu s-a găsit o mapare pentru produsul: "${product.name}"`);
      }
    }
    
    console.log(`Proces finalizat. S-au actualizat ${updatedCount} produse.`);
  } catch (error) {
    console.error('Eroare:', error);
  } finally {
    // Închide conexiunea la baza de date
    await mongoose.connection.close();
    console.log('Conexiune la baza de date închisă.');
  }
}

restoreOriginalImages(); 