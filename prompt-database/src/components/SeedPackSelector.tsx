/**
 * SeedPackSelector Component
 * 
 * Allows users to select which seed data packs to load
 * during the first-time setup experience.
 */

import { useMemo } from 'react';
import { getAvailableSeedPacks, loadSeedPrompts } from '@/lib/seedLoader';

interface SeedPackInfo {
  id: string;
  name: string;
  description: string;
  promptCount: number;
}

interface SeedPackSelectorProps {
  selectedPacks: string[];
  onSelectionChange: (packs: string[]) => void;
}

const SEED_PACK_INFO: Record<string, SeedPackInfo> = {
  development: {
    id: 'development',
    name: 'Development',
    description: 'Programming, coding, and development tasks',
    promptCount: 6
  },
  writing: {
    id: 'writing',
    name: 'Writing',
    description: 'Content writing, copywriting, and communication',
    promptCount: 6
  },
  analysis: {
    id: 'analysis',
    name: 'Analysis',
    description: 'Data analysis, research, and insights',
    promptCount: 6
  }
};

export function SeedPackSelector({
  selectedPacks,
  onSelectionChange
}: SeedPackSelectorProps) {
  const availablePacks = useMemo(() => {
    return getAvailableSeedPacks().map(packId => SEED_PACK_INFO[packId]);
  }, []);

  const handlePackToggle = (packId: string) => {
    const newSelection = selectedPacks.includes(packId)
      ? selectedPacks.filter(p => p !== packId)
      : [...selectedPacks, packId];
    onSelectionChange(newSelection);
  };

  const handleLoadAll = () => {
    onSelectionChange(['development', 'writing', 'analysis']);
  };

  const handleSkip = () => {
    onSelectionChange([]);
  };

  const selectionCount = selectedPacks.length;
  const selectionText = selectionCount === 0
    ? 'No packs selected'
    : selectionCount === 1
    ? '1 pack selected'
    : `${selectionCount} packs selected`;

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Load Seed Prompts
      </h2>
      <p className="text-gray-600 mb-6">
        Choose which prompt packs you'd like to start with, or skip to begin with an empty database.
      </p>

      {/* Seed Pack Selection */}
      <div className="space-y-4 mb-6">
        {availablePacks.map(pack => (
          <label
            key={pack.id}
            className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedPacks.includes(pack.id)}
              onChange={() => handlePackToggle(pack.id)}
              className="w-5 h-5 text-blue-600 mt-1 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900">{pack.name}</div>
              <div className="text-sm text-gray-600">{pack.description}</div>
              <div className="text-xs text-gray-500 mt-1">
                {pack.promptCount} prompts
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Selection Summary */}
      <div className="text-sm font-medium text-gray-600 mb-6">
        {selectionText}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleLoadAll}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Load All
        </button>
        <button
          onClick={handleSkip}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          💡 <strong>Tip:</strong> You can add more prompts anytime by creating them manually or importing from a file.
        </p>
      </div>
    </div>
  );
}
