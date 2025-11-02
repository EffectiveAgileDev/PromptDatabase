/**
 * Seed Loader Manual Test
 * 
 * This file demonstrates how to manually test the seed loader functions.
 * Run these in the browser console to verify seed data loads correctly.
 */

import { loadSeedCategories, loadSeedPrompts, getAvailableSeedPacks, loadAllSeedData } from './seedLoader';

// Test 1: Load categories
console.log('Test 1: Load all categories');
const categories = loadSeedCategories();
console.log(`✅ Loaded ${categories.length} categories:`, categories);

// Test 2: Load individual seed packs
console.log('\nTest 2: Load individual seed packs');
const devPrompts = loadSeedPrompts(['development']);
console.log(`✅ Development pack: ${devPrompts.length} prompts`, devPrompts);

const writingPrompts = loadSeedPrompts(['writing']);
console.log(`✅ Writing pack: ${writingPrompts.length} prompts`, writingPrompts);

const analysisPrompts = loadSeedPrompts(['analysis']);
console.log(`✅ Analysis pack: ${analysisPrompts.length} prompts`, analysisPrompts);

// Test 3: Load multiple packs
console.log('\nTest 3: Load multiple seed packs');
const allPrompts = loadSeedPrompts(['development', 'writing', 'analysis']);
console.log(`✅ All prompts: ${allPrompts.length} prompts loaded`);

// Test 4: Get available packs
console.log('\nTest 4: Available seed packs');
const packs = getAvailableSeedPacks();
console.log(`✅ Available packs:`, packs);

// Test 5: Load all seed data
console.log('\nTest 5: Load all seed data');
const allSeedData = loadAllSeedData();
console.log(`✅ Categories: ${allSeedData.categories.length}`);
console.log(`✅ Prompts: ${allSeedData.prompts.length}`);
console.log('Complete seed data:', allSeedData);

// Test 6: Verify data integrity
console.log('\nTest 6: Data integrity checks');
const categoryNames = new Set(categories.map(c => c.name));
const promptsUsingCategories = allPrompts.filter(p => !categoryNames.has(p.category));
console.log(`✅ All prompts use valid categories: ${promptsUsingCategories.length === 0 ? 'PASS' : 'FAIL'}`);

export { loadSeedCategories, loadSeedPrompts, getAvailableSeedPacks, loadAllSeedData };
