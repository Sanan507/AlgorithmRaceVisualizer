import React, { useState, useRef, useId } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { parseCustomArrayInput } from '../utils/arrayParser';

interface CsvUploaderProps {
  onUploadSuccess: (parsedArray: number[]) => void;
}

export function CsvUploader({ onUploadSuccess }: CsvUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadId = useId();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
      setError('Invalid file type. Please upload a .csv or .txt file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== 'string') {
        setError('Failed to read file content.');
        return;
      }

      // Replace newlines and tabs with commas to handle multiline or tab-separated data
      const normalizedText = text.replace(/[\r\n\t]+/g, ',');
      const parsed = parseCustomArrayInput(normalizedText);

      if (parsed.length === 0) {
        setError('No valid numbers found in the file.');
      } else {
        onUploadSuccess(parsed);
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.onerror = () => {
      setError('Error reading file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  return (
    <div className="csv-uploader-wrap">
      <input
        type="file"
        accept=".csv,.txt"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
        id={uploadId}
      />
      <label
        htmlFor={uploadId}
        className="csv-upload-btn"
        title="Upload .csv or .txt file containing numbers separated by commas or newlines"
      >
        <Upload size={15} />
        <span>Upload</span>
      </label>
      {error && (
        <div className="csv-upload-error">
          <AlertCircle size={14} /> {error}
        </div>
      )}
    </div>
  );
}
