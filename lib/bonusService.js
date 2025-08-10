import { supabase } from './supabase';

// Bonus data service
export const bonusService = {
  // Parse bonus JSON data and extract product information with bonus descriptions
  parseBonusData: (bonusJson) => {
    try {
      // Handle both old "bonusnus" and new "actie" structure
      const items = bonusJson.actie || bonusJson.bonusnus || [];
      
      // Group items by URL to reconstruct complete offers
      const groupedByUrl = {};
      
      items.forEach(item => {
        const url = item.url;
        if (!groupedByUrl[url]) {
          groupedByUrl[url] = [];
        }
        groupedByUrl[url].push(item);
      });

      const parsedProducts = [];

      Object.entries(groupedByUrl).forEach(([url, urlItems]) => {
        // Find the main product name (usually the longest item that doesn't contain common bonus words)
        const mainProductItem = urlItems.find(item => {
          const name = item.name.toLowerCase();
          const bonusKeywords = ['voor', 'korting', 'gratis', 'halve', 'prijs', 'per', 'zak', 'bak', 'stuk', 'stuks', 'pak', 'pakken', 'blik', 'blikken', 'fles', 'flessen', 'liter', 'gram', 'kilo', 'euro', '€', 'vandaag', 'hele', 'week', 'uitgelicht', 'bijv', 'los', 'bakje', 'doos', 'doosje', 'set', 'sets', 'multipack', 'krat', 'kratten'];
          return item.name.length > 10 && !bonusKeywords.some(keyword => name.includes(keyword));
        });

        if (!mainProductItem) return;

        // Extract bonus description by combining relevant items
        const bonusWords = [];
        const priceItems = [];
        
        urlItems.forEach(item => {
          const name = item.name.toLowerCase();
          
          // Collect bonus-related words
          if (['1+1', '2+1', '3+1', '2+2', '3+2', '1+1', '2+1', '3+1', '2+2', '3+2'].includes(item.name)) {
            bonusWords.push(item.name);
          } else if (name.includes('gratis')) {
            bonusWords.push('gratis');
          } else if (name.includes('korting') && !name.includes('bezorg')) {
            // Find percentage or amount before "korting"
            const kortingIndex = urlItems.findIndex(i => i.name === item.name);
            if (kortingIndex > 0) {
              const prevItem = urlItems[kortingIndex - 1];
              if (prevItem.name.includes('%') || prevItem.name.includes('€')) {
                bonusWords.push(`${prevItem.name} korting`);
              }
            }
          } else if (name.includes('voor') && !name.includes('voor') && !name.includes('voor')) {
            // Find "X voor Y" pattern
            const voorIndex = urlItems.findIndex(i => i.name === item.name);
            if (voorIndex > 0 && voorIndex < urlItems.length - 1) {
              const beforeVoor = urlItems[voorIndex - 1].name;
              const afterVoor = urlItems[voorIndex + 1].name;
              if (beforeVoor.match(/^\d+$/) && afterVoor.match(/^\d+\.\d+$/)) {
                bonusWords.push(`${beforeVoor} voor €${afterVoor}`);
              }
            }
          } else if (name.includes('halve prijs')) {
            bonusWords.push('2e halve prijs');
          } else if (name.includes('per') && (name.includes('zak') || name.includes('bak') || name.includes('stuk'))) {
            bonusWords.push(item.name);
          }
          
          // Collect price information
          if (name.match(/^\d+\.\d+$/) && !name.includes('week')) {
            priceItems.push(parseFloat(item.name));
          }
        });

        // Create bonus description
        let bonusDescription = '';
        if (bonusWords.length > 0) {
          bonusDescription = bonusWords.join(' ');
        } else if (priceItems.length >= 2) {
          // If we have multiple prices, it might be a "X voor Y" deal
          const sortedPrices = priceItems.sort((a, b) => a - b);
          if (sortedPrices.length >= 2) {
            bonusDescription = `${sortedPrices.length} voor €${sortedPrices[0].toFixed(2)}`;
          }
        }

        // Extract prices
        const prices = priceItems.filter(price => price > 0 && price < 1000); // Filter out unreasonable prices
        const currentPrice = prices.length > 0 ? Math.min(...prices) : null;
        const originalPrice = prices.length > 1 ? Math.max(...prices) : null;

        // Calculate discount percentage if we have both prices
        let discountPercentage = null;
        if (currentPrice && originalPrice && originalPrice > currentPrice) {
          discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
        }

        // Determine store name from URL
        let store = 'Albert Heijn';
        if (url.includes('ah.nl')) {
          store = 'Albert Heijn';
        }

        const product = {
          name: mainProductItem.name,
          store: store,
          price: currentPrice,
          original_price: originalPrice,
          discount_percentage: discountPercentage,
          bonus_description: bonusDescription || null,
          url: url,
          category: bonusService.categorizeProduct(mainProductItem.name),
          week: null // Set to null for auto-import, will be handled by conflict resolution
        };

        parsedProducts.push(product);
      });

      console.log(`Parsed ${parsedProducts.length} bonus products`);
      return parsedProducts;
    } catch (error) {
      console.error('Error parsing bonus data:', error);
      return [];
    }
  },

  // Categorize products based on name
  categorizeProduct: (productName) => {
    const name = productName.toLowerCase();
    
    if (name.includes('appel') || name.includes('banaan') || name.includes('sinaasappel') || 
        name.includes('peer') || name.includes('druif') || name.includes('aardbei') || 
        name.includes('blauwe bes') || name.includes('framboos') || name.includes('meloen') ||
        name.includes('kiwi') || name.includes('mango') || name.includes('ananas')) {
      return 'Fruit';
    }
    
    if (name.includes('tomaat') || name.includes('komkommer') || name.includes('paprika') || 
        name.includes('wortel') || name.includes('ui') || name.includes('knoflook') || 
        name.includes('sla') || name.includes('spinazie') || name.includes('courgette') ||
        name.includes('aubergine') || name.includes('prei') || name.includes('boon') ||
        name.includes('bloemkool') || name.includes('broccoli') || name.includes('champignon')) {
      return 'Groente';
    }
    
    if (name.includes('brood') || name.includes('stokbrood') || name.includes('focaccia') || 
        name.includes('croissant') || name.includes('pizza') || name.includes('quiche')) {
      return 'Brood & Bakkerij';
    }
    
    if (name.includes('kaas') || name.includes('ham') || name.includes('salami') || 
        name.includes('filet') || name.includes('paté') || name.includes('worst')) {
      return 'Vleeswaren';
    }
    
    if (name.includes('melk') || name.includes('yoghurt') || name.includes('boter') || 
        name.includes('room') || name.includes('kwark') || name.includes('eier')) {
      return 'Zuivel';
    }
    
    if (name.includes('kip') || name.includes('rund') || name.includes('varken') || 
        name.includes('gehakt') || name.includes('rib') || name.includes('hamburger')) {
      return 'Vlees';
    }
    
    if (name.includes('vis') || name.includes('zalm') || name.includes('tonijn') || 
        name.includes('garnaal') || name.includes('haring') || name.includes('kabeljauw')) {
      return 'Vis';
    }
    
    if (name.includes('bier') || name.includes('wijn') || name.includes('prosecco') || 
        name.includes('port') || name.includes('whisky') || name.includes('gin')) {
      return 'Alcoholische dranken';
    }
    
    if (name.includes('cola') || name.includes('fanta') || name.includes('sprite') || 
        name.includes('ice tea') || name.includes('sap') || name.includes('water')) {
      return 'Frisdrank';
    }
    
    if (name.includes('chips') || name.includes('noot') || name.includes('popcorn') || 
        name.includes('borrel') || name.includes('snack')) {
      return 'Chips & Nootjes';
    }
    
    if (name.includes('chocola') || name.includes('koek') || name.includes('snoep') || 
        name.includes('m&m') || name.includes('haribo') || name.includes('stroopwafel')) {
      return 'Snoep & Koek';
    }
    
    if (name.includes('diepvries') || name.includes('ijs') || name.includes('frozen')) {
      return 'Diepvries';
    }
    
    if (name.includes('muesli') || name.includes('cornflake') || name.includes('ontbijt')) {
      return 'Ontbijtgranen';
    }
    
    return 'Overig';
  },

  // Match product names with bonus items
  findMatchingBonus: (productName, bonusProducts) => {
    const normalizedName = productName.toLowerCase().trim();
    
    // Get product category for context-aware matching
    const productCategory = bonusService.categorizeProduct(normalizedName);
    
    return bonusProducts.find(bonus => {
      const bonusName = bonus.name.toLowerCase();
      
      // Exact match (highest priority)
      if (bonusName === normalizedName) return true;
      
      // Get bonus category for context-aware matching
      const bonusCategory = bonus.category || bonusService.categorizeProduct(bonusName);
      
      // Extract key product words (ignore common words and misleading words)
      const commonWords = ['ah', 'alle', 'bijv', 'voor', 'van', 'de', 'het', 'een', 'en', 'of', 'met', 'zonder', 'gram', 'kilo', 'liter', 'stuk', 'stuks', 'pak', 'pakken', 'zak', 'zakken', 'bak', 'bakken', 'fles', 'flessen', 'blik', 'blikken', 'doos', 'dozen', 'set', 'sets'];
      
      // Words that often cause false matches (only the really problematic ones)
      const misleadingWords = ['kaas', 'wine'];
      
      // Special handling for "kaas" - only filter it when it's in compound words like "pindakaas"
      const shouldFilterKaas = normalizedName.includes('pindakaas') || normalizedName.includes('notenkaas');
      const shouldFilterWine = normalizedName.includes('winegums') || normalizedName.includes('wine');
      
      const productWords = normalizedName.split(/\s+/).filter(word => {
        if (word.length <= 2 || commonWords.includes(word)) return false;
        if (word === 'kaas' && shouldFilterKaas) return false;
        if (word === 'wine' && shouldFilterWine) return false;
        return true;
      });
      
      const bonusWords = bonusName.split(/\s+/).filter(word => 
        word.length > 2 && !commonWords.includes(word) && !misleadingWords.includes(word)
      );
      
      // Context-aware matching: only prevent the most obvious false matches
      // Pindakaas (Broodbeleg) should not match with Kaas (Zuivel)
      // Winegums (Snoep) should not match with Wijn (Alcoholische dranken)
      if ((productCategory === 'Broodbeleg' && bonusCategory === 'Zuivel') ||
          (productCategory === 'Snoep & Koek' && bonusCategory === 'Alcoholische dranken')) {
        return false;
      }
      
      // Check if at least 2 significant words match exactly
      const matchingWords = productWords.filter(productWord => 
        bonusWords.some(bonusWord => 
          productWord === bonusWord || 
          (productWord.length > 4 && bonusWord.length > 4 && 
           (productWord.includes(bonusWord) || bonusWord.includes(productWord)))
        )
      );
      
      // Require at least 2 matching words for a valid match
      if (matchingWords.length >= 2) {
        return true;
      }
      
      // Special case: single word products (like "appels", "melk")
      if (productWords.length === 1 && bonusWords.length >= 1) {
        const productWord = productWords[0];
        const hasExactMatch = bonusWords.some(bonusWord => 
          productWord === bonusWord || 
          (productWord.length > 3 && bonusWord.length > 3 && 
           (productWord.includes(bonusWord) || bonusWord.includes(productWord)))
        );
        
        if (hasExactMatch) {
          return true;
        }
      }
      
      return false;
    });
  },

  // Save bonus data to database
  saveBonusData: async (userId, bonusProducts) => {
    try {
      console.log(`Saving ${bonusProducts.length} bonus products for user ${userId}`);
      
      // First, delete existing bonus data for this user to avoid conflicts
      const { error: deleteError } = await supabase
        .from('bonus_products')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error('Error deleting existing bonus data:', deleteError);
        return { data: null, error: deleteError };
      }
      
      console.log('Deleted existing bonus data for user');
      
      // Then insert new bonus data
      const { data, error } = await supabase
        .from('bonus_products')
        .insert(
          bonusProducts.map(product => ({
            user_id: userId,
            name: product.name,
            price: product.price,
            original_price: product.original_price,
            discount: product.discount,
            discount_percentage: product.discount_percentage,
            bonus_description: product.bonus_description,
            store: product.store,
            week: product.week || null,
            category: product.category,
            url: product.url,
            created_at: new Date().toISOString()
          }))
        );
      
      if (error) {
        console.error('Error in saveBonusData:', error);
        return { data: null, error };
      }
      
      console.log(`Successfully saved ${bonusProducts.length} bonus products`);
      return { data, error: null };
    } catch (error) {
      console.error('Error saving bonus data:', error);
      return { data: null, error };
    }
  },

  // Get bonus data for user
  getBonusData: async (userId, week = null) => {
    try {
      let query = supabase
        .from('bonus_products')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (week) {
        query = query.eq('week', week);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error('Error getting bonus data:', error);
      return { data: null, error };
    }
  },

  // Auto-import bonus data from the provided JSON
  autoImportBonusData: async (userId) => {
    try {
      console.log(`Starting auto-import for user ${userId}`);
      
      // Import the bonus data from the updated JSON file
      const bonusData = require('../bonuskleineupdate.json');
      console.log(`Loaded bonus data with ${bonusData.actie?.length || 0} items`);
      
      const parsedData = bonusService.parseBonusData(bonusData);
      console.log(`Parsed ${parsedData.length} bonus products`);
      
      // Log some examples of parsed products
      if (parsedData.length > 0) {
        console.log('Sample parsed products:');
        parsedData.slice(0, 5).forEach((product, index) => {
          console.log(`${index + 1}. ${product.name} - ${product.category} - €${product.price}`);
        });
      }
      
      if (parsedData.length === 0) {
        console.log('No bonus data to import');
        return { success: true, count: 0 };
      }
      
      // Save to database
      const { error } = await bonusService.saveBonusData(userId, parsedData);
      if (error) {
        console.error('Error saving bonus data:', error);
        return { success: false, error };
      }
      
      console.log(`Successfully imported ${parsedData.length} bonus products`);
      return { success: true, count: parsedData.length };
    } catch (error) {
      console.error('Error auto-importing bonus data:', error);
      return { success: false, error };
    }
  },

  // Update bonus data - removes old data and imports new data
  updateBonusData: async (userId, newBonusJson) => {
    try {
      console.log('Starting bonus data update...');
      
      // Step 1: Parse new bonus data
      const parsedData = bonusService.parseBonusData(newBonusJson);
      
      if (parsedData.length === 0) {
        console.log('No new bonus data to import');
        return { success: true, message: 'No new data to import' };
      }
      
      // Step 2: Save new bonus data (this will automatically delete old data)
      const { error: saveError } = await bonusService.saveBonusData(userId, parsedData);
      
      if (saveError) {
        console.error('Error saving new bonus data:', saveError);
        return { success: false, error: saveError };
      }
      
      console.log(`Successfully updated bonus data: ${parsedData.length} products imported`);
      return { success: true, count: parsedData.length };
      
    } catch (error) {
      console.error('Error updating bonus data:', error);
      return { success: false, error };
    }
  },

  // Get bonus suggestions for a product
  getBonusSuggestions: async (userId, productName) => {
    try {
      const { data: bonusData, error } = await bonusService.getBonusData(userId);
      if (error) return { suggestions: [], error };
      
      const matchingBonus = bonusService.findMatchingBonus(productName, bonusData || []);
      return { suggestions: matchingBonus ? [matchingBonus] : [], error: null };
    } catch (error) {
      console.error('Error getting bonus suggestions:', error);
      return { suggestions: [], error };
    }
  }
};
