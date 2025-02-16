
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ProductImageUploadProps {
  onImageChange: (file: File) => void;
  required?: boolean;
}

export const ProductImageUpload = ({ onImageChange, required = false }: ProductImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if file is an allowed image type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a JPEG, JPG or PNG image.');
        return;
      }

      setPreviewUrl(URL.createObjectURL(file));
      onImageChange(file);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image">Product Image (JPEG, JPG, PNG)</Label>
      <Input
        id="image"
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleImageChange}
        required={required}
      />
      {previewUrl && (
        <div className="mt-2">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-md"
          />
        </div>
      )}
    </div>
  );
};
