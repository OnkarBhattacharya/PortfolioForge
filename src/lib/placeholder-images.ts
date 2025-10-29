
import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

export const getPlaceholderImage = (id?: string) => {
    if (!id) return PlaceHolderImages.find((img) => img.id === "project-1");
    return PlaceHolderImages.find((img) => img.id === id);
};
