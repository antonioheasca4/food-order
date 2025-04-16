import mongoose from 'mongoose';
import foodModel from '../models/foodModel.js';
import 'dotenv/config';
import { connectDB } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obține calea curentă
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Produsele care vor fi adăugate
const productsToAdd = [
  {
    name: "Salata de Cazarmă",
    description: "Salată proaspătă inspirată din meniurile cazone, dar cu gust și aspect îmbunătățit considerabil.",
    price: 25,
    category: "Gamelă Verde",
    imageName: "food_1.png"
  },
  {
    name: "Verdeața Locotenentului",
    description: "Salată vegetariană aprobată de medicul unității, cu mix de legume și dressing special.",
    price: 22,
    category: "Gamelă Verde",
    imageName: "food_2.png"
  },
  {
    name: "Camuflaj de Legume",
    description: "Salată colorată care ar fi făcut mândru și bucătarul regimentului.",
    price: 20,
    category: "Gamelă Verde",
    imageName: "food_3.png"
  },
  {
    name: "Ordin de Pui",
    description: "Salată cu pui la grătar, mult mai bună decât cea servită vreodată în orice unitate militară.",
    price: 28,
    category: "Gamelă Verde",
    imageName: "food_4.png"
  },
  {
    name: "Cartuș Umplut",
    description: "Rulouri consistente care ți-ar fi dat energie pentru o zi întreagă de instrucție.",
    price: 30,
    category: "Hrană de Rezervă",
    imageName: "food_5.png"
  },
  {
    name: "Muniție Picantă",
    description: "Rulouri picante care ar fi trezit și cel mai obosit soldat după garda de noapte.",
    price: 25,
    category: "Hrană de Rezervă",
    imageName: "food_6.png"
  },
  {
    name: "Grenadă cu Pui",
    description: "Rulouri explozive cu pui, care nu se compară cu cele din rația de luptă.",
    price: 27,
    category: "Hrană de Rezervă",
    imageName: "food_7.png"
  },
  {
    name: "Rezerva Strategică",
    description: "Rulouri vegetariene care ar fi înlocuit cu succes conservele din rația de urgență.",
    price: 22,
    category: "Hrană de Rezervă",
    imageName: "food_8.png"
  },
  {
    name: "Medalie Înghețată",
    description: "Desert răcoritor ce ar fi fost rezervat doar pentru generalii în vizită.",
    price: 15,
    category: "Recompense",
    imageName: "food_9.png"
  },
  {
    name: "Permisie Dulce",
    description: "Înghețată de fructe care te transportă departe de cazarmă.",
    price: 18,
    category: "Recompense",
    imageName: "food_10.png"
  },
  {
    name: "Bocanci Dulci",
    description: "Desert servit în borcan, mult prea bun pentru a fi găsit vreodată la popotă.",
    price: 20,
    category: "Recompense",
    imageName: "food_11.png"
  },
  {
    name: "Deșertul Vanilat",
    description: "Înghețată clasică de vanilie servită într-un mod neobișnuit pentru standarde militare.",
    price: 12,
    category: "Recompense",
    imageName: "food_12.png"
  },
  {
    name: "Aprovizionare cu Pui",
    description: "Sandwich cu pui care ar fi fost furat din orice magazie de alimente militare.",
    price: 23,
    category: "Rații de Campanie",
    imageName: "food_13.png"
  },
  {
    name: "Rația Ecologistului",
    description: "Sandwich vegan pentru soldații care refuză mâncarea standard din motive ideologice.",
    price: 19,
    category: "Rații de Campanie",
    imageName: "food_14.png"
  },
  {
    name: "Raport de Luptă",
    description: "Sandwich la grătar care ar fi fost considerat hrană de lux în orice campanie militară.",
    price: 21,
    category: "Rații de Campanie",
    imageName: "food_15.png"
  },
  {
    name: "Pâine de Front",
    description: "Sandwich clasic care nu seamănă deloc cu sandvișurile uscate din pachetul de luptă.",
    price: 18,
    category: "Rații de Campanie",
    imageName: "food_16.png"
  },
  {
    name: "Decorația Dulce",
    description: "Brioșe delicioase care ar fi fost servite doar la evenimentele speciale.",
    price: 10,
    category: "Festin de Permisie",
    imageName: "food_17.png"
  },
  {
    name: "Tort de Camuflaj",
    description: "Prăjitură vegană care nu s-ar fi găsit niciodată în vreo cantină militară.",
    price: 18,
    category: "Festin de Permisie",
    imageName: "food_18.png"
  },
  {
    name: "Tort de Grade",
    description: "Tort stratificat demn de ceremonia de avansare a oricărui ofițer superior.",
    price: 25,
    category: "Festin de Permisie",
    imageName: "food_19.png"
  },
  {
    name: "Prăjitura Recruților",
    description: "Desert care face ca dormitorul de cazarmă să pară un vis frumos.",
    price: 20,
    category: "Festin de Permisie",
    imageName: "food_20.png"
  },
  {
    name: "Asalt de Ciuperci",
    description: "Ciuperci la tigaie cu usturoi care ar fi îmbunătățit orice meniu de campanie.",
    price: 24,
    category: "Pentru Vegetarieni",
    imageName: "food_21.png"
  },
  {
    name: "Conopidă în Misiune",
    description: "Conopidă pane care nu a trecut niciodată prin cantina vreunei unități militare.",
    price: 22,
    category: "Pentru Vegetarieni",
    imageName: "food_22.png"
  },
  {
    name: "Pluton de Legume",
    description: "Orez cu legume într-o combinație pe care niciun bucătar militar nu ar fi putut să o conceapă.",
    price: 25,
    category: "Pentru Vegetarieni",
    imageName: "food_23.png"
  },
  {
    name: "Tactică Verde",
    description: "Orez cu dovlecel perfect camuflat pentru a păcăli chiar și cel mai atent sergent.",
    price: 20,
    category: "Pentru Vegetarieni",
    imageName: "food_24.png"
  },
  {
    name: "Ordin de Brânzeturi",
    description: "Paste cu sos cremos de brânzeturi, mult peste standardele oricărei popote militare.",
    price: 26,
    category: "De Zi cu Zi",
    imageName: "food_25.png"
  },
  {
    name: "Rația Comandantului",
    description: "Paste cu sos de roșii proaspete și busuioc, probabil servite doar generalilor.",
    price: 24,
    category: "De Zi cu Zi",
    imageName: "food_26.png"
  },
  {
    name: "Uniforma Albă",
    description: "Paste cu sos cremos de smântână care ar face pe oricine să uite de meniul zilnic din armată.",
    price: 28,
    category: "De Zi cu Zi",
    imageName: "food_27.png"
  },
  {
    name: "Manevră de Pui",
    description: "Paste cu bucăți de pui și sos, o alternativă demnă la conservele din dotare.",
    price: 30,
    category: "De Zi cu Zi",
    imageName: "food_28.png"
  },
  {
    name: "Tăiței de Transmisiuni",
    description: "Tăiței în sos de unt care transmit mesaje clare papilelor gustative.",
    price: 22,
    category: "Ranforsări",
    imageName: "food_29.png"
  },
  {
    name: "Detașament Verde",
    description: "Tăiței prăjiți cu legume, mai buni decât orice masă de duminică din cazarmă.",
    price: 24,
    category: "Ranforsări",
    imageName: "food_30.png"
  },
  {
    name: "Tăiței de Paradă",
    description: "Tăiței fini japonezi aliniați perfect ca o formație de paradă.",
    price: 25,
    category: "Ranforsări",
    imageName: "food_31.png"
  },
  {
    name: "Bază de Operațiuni",
    description: "Tăiței simpli, o bază solidă pentru orice misiune culinară.",
    price: 20,
    category: "Ranforsări",
    imageName: "food_32.png"
  }
];

// Copiază fișiere de imagine din folder-ul de resurse în folder-ul de upload
async function copyImagesToUploads() {
  try {
    // Calea către folderul de resurse - corectată
    const resourcePath = path.resolve(__dirname, '../../food-del-assets/assets/frontend_assets');
    // Calea către folderul de upload
    const uploadsPath = path.resolve(__dirname, '../uploads');
    
    // Verifică dacă folderul de upload există, dacă nu, creează-l
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }
    
    console.log('Copierea imaginilor...');
    console.log('Folder resurse:', resourcePath);
    console.log('Folder upload:', uploadsPath);
    
    // Verifică ce fișiere există în folder-ul de resurse
    if (fs.existsSync(resourcePath)) {
      console.log('Fișiere în folderul de resurse:');
      const files = fs.readdirSync(resourcePath);
      console.log(files.filter(file => file.startsWith('food_')).join(', '));
    } else {
      console.log('Folderul de resurse nu există:', resourcePath);
    }
    
    // Copiază fiecare imagine
    for (const product of productsToAdd) {
      const sourcePath = path.join(resourcePath, product.imageName);
      const destinationPath = path.join(uploadsPath, product.imageName);
      
      // Verifică dacă fișierul sursă există
      if (fs.existsSync(sourcePath)) {
        // Copiază fișierul
        fs.copyFileSync(sourcePath, destinationPath);
        console.log(`Imagine copiată: ${product.imageName}`);
      } else {
        console.log(`Imaginea nu a fost găsită: ${sourcePath}`);
      }
    }
    
    console.log('Copierea imaginilor finalizată.');
  } catch (error) {
    console.error('Eroare la copierea imaginilor:', error);
  }
}

// Adaugă produsele în baza de date
async function addProducts() {
  try {
    // Conectare la baza de date
    console.log('Conectare la baza de date...');
    await connectDB();
    
    // Copiază imaginile
    await copyImagesToUploads();
    
    console.log('Adăugare produse în baza de date...');
    
    let addedCount = 0;
    
    // Adaugă fiecare produs
    for (const productData of productsToAdd) {
      // Verifică dacă produsul există deja (după nume)
      const existingProduct = await foodModel.findOne({ name: productData.name });
      
      if (existingProduct) {
        console.log(`Produsul "${productData.name}" există deja. Se actualizează.`);
        
        // Actualizează produsul existent
        await foodModel.findByIdAndUpdate(existingProduct._id, {
          description: productData.description,
          price: productData.price,
          category: productData.category,
          image: productData.imageName
        });
      } else {
        // Creează un nou produs
        const newProduct = new foodModel({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          image: productData.imageName
        });
        
        await newProduct.save();
        addedCount++;
        console.log(`Produs adăugat: ${productData.name}`);
      }
    }
    
    console.log(`Proces finalizat. S-au adăugat ${addedCount} produse noi.`);
  } catch (error) {
    console.error('Eroare:', error);
  } finally {
    // Închide conexiunea la baza de date
    await mongoose.connection.close();
    console.log('Conexiune la baza de date închisă.');
  }
}

// Rulează scriptul
addProducts(); 