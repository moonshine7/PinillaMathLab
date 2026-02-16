// FIX: Moved AIStudio interface into declare global to prevent redeclaration errors.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // FIX: Made aistudio optional to fix "All declarations of 'aistudio' must have identical modifiers" error.
    aistudio?: AIStudio;
  }
}

// FIX: Added GroundingSource type definition used in WebSearch component.
// This also makes this file a module, fixing the "Augmentations for the global scope" error.
export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}
