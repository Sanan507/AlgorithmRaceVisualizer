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
    <div className="csv-uploader" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <input
        type="file"
        accept=".csv,.txt"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
        id={uploadId}
      />
      <label htmlFor={uploadId} className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', height: '38px', whiteSpace: 'nowrap' }}>
        <Upload size={16} /> Upload
      </label>
      {error && (
        <div style={{ color: 'var(--rose)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}
    </div>
  );
}
