import { pipeline, env, RawImage } from "@xenova/transformers";

// Configure the Transformers.js environment
env.allowLocalModels = false;
// Configure cache settings
env.cacheDir = "./public/model-cache"; // Store models in a public folder
env.useBrowserCache = true; // Enable browser cache for models
// Add logging for troubleshooting
console.log("Transformers.js environment configured");

// Singleton pattern to ensure we only load the model once
class BirdClassifier {
  private static instance: BirdClassifier;
  private classifier: any = null;
  private loading = false;
  private loadingPromise: Promise<void> | null = null;
  private modelError: Error | null = null;

  private constructor() {}

  public static getInstance(): BirdClassifier {
    if (!BirdClassifier.instance) {
      BirdClassifier.instance = new BirdClassifier();
    }
    return BirdClassifier.instance;
  }

  public async getClassifier() {
    // Don't run in server-side rendering
    if (typeof window === "undefined") {
      return null;
    }

    // If the classifier is already loaded, return it
    if (this.classifier !== null) {
      return this.classifier;
    }

    // If we had an error before, throw it again
    if (this.modelError) {
      throw this.modelError;
    }

    // If the classifier is currently loading, wait for it to finish
    if (this.loading) {
      await this.loadingPromise;
      return this.classifier;
    }

    // Otherwise, load the classifier
    this.loading = true;
    this.loadingPromise = this.loadModel();
    await this.loadingPromise;
    return this.classifier;
  }

  private async loadModel() {
    try {
      console.log("Loading image classifier model...");

      // Use a reliable web-optimized model
      this.classifier = await pipeline(
        "image-classification",
        "Xenova/vit-base-patch16-224" // Use a reliable general image classifier
      );

      console.log("Image classifier model loaded successfully!");
    } catch (error) {
      console.error("Error loading the model:", error);
      this.modelError = error as Error;
      throw error;
    } finally {
      this.loading = false;
    }
  }
}

export interface ClassificationResult {
  label: string;
  commonName: string;
  score: number;
}

export async function classifyBirdImage(
  imageFile: File
): Promise<ClassificationResult[]> {
  try {
    // Don't run in server-side rendering
    if (typeof window === "undefined") {
      throw new Error("Cannot run classification on the server");
    }

    // Get the classifier instance
    const classifier = await BirdClassifier.getInstance().getClassifier();

    if (!classifier) {
      throw new Error("Classifier not available");
    }

    // Create a URL for the image file
    const imageUrl = URL.createObjectURL(imageFile);

    // Convert to a data URL that can be directly processed
    const dataUrl = await fileToDataUrl(imageFile);

    try {
      // Run the classification with the data URL
      console.log("Running classification on image...");
      const results = await classifier(dataUrl);
      console.log("Classification results:", results);

      // Parse the results
      const processedResults = results.map((result: any) => {
        const label = result.label;
        // Clean up label format (usually in format: label_name)
        const cleanedLabel = label
          .replace(/_/g, " ")
          .replace(/^n\d+\s/, "")
          .trim();
        // Capitalize first letter of each word
        const formattedLabel = cleanedLabel
          .split(" ")
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        return {
          label: label,
          commonName: formattedLabel,
          score: result.score,
        };
      });

      return processedResults;
    } finally {
      // Clean up the URL
      URL.revokeObjectURL(imageUrl);
    }
  } catch (error) {
    console.error("Error classifying image:", error);
    throw error;
  }
}

// Convert a File to a data URL
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
