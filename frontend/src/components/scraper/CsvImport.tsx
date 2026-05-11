import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Upload, FileText, X, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

interface CsvImportProps {
  onSubmit: (data: { file: File; mappingConfig: Record<string, string> }) => void;
  loading?: boolean;
}

export default function CsvImport({ onSubmit, loading }: CsvImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'upload' | 'map' | 'preview'>('upload');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.csv'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      const f = acceptedFiles[0];
      if (!f) return;
      setFile(f);
      Papa.parse<Record<string, string>>(f, {
        header: true,
        preview: 10,
        skipEmptyLines: true,
        complete: (result) => {
          setHeaders(result.meta.fields || []);
          setPreviewRows(result.data);
          // Auto-mapping (same name)
          const autoMap: Record<string, string> = {};
          (result.meta.fields || []).forEach((h) => { autoMap[h] = h; });
          setMapping(autoMap);
          setStep('map');
        },
      });
    },
  });

  function handleSubmit() {
    if (!file) return;
    onSubmit({ file, mappingConfig: mapping });
  }

  if (step === 'upload') {
    return (
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-brand-blue bg-brand-blue/5' : 'border-border hover:border-border-light hover:bg-bg-tertiary/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-300">
          {isDragActive ? 'Drop the CSV file here...' : 'Drag & drop CSV file, or click to browse'}
        </p>
        <p className="text-xs text-gray-600 mt-1">Max 50MB · CSV format</p>
      </div>
    );
  }

  if (step === 'map') {
    return (
      <div className="space-y-4">
        {/* File info */}
        <div className="flex items-center gap-3 p-3 card-sm">
          <FileText className="w-5 h-5 text-brand-blue flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{file?.name}</p>
            <p className="text-xs text-gray-500">{headers.length} columns detected</p>
          </div>
          <button onClick={() => { setFile(null); setStep('upload'); }} className="text-gray-500 hover:text-gray-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Column mapping */}
        <div>
          <p className="label mb-3">Column Mapping</p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {headers.map((header) => (
              <div key={header} className="flex items-center gap-2">
                <div className="flex-1 code-text py-2 px-3 truncate">{header}</div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                <input
                  className="input flex-1"
                  value={mapping[header] || ''}
                  onChange={(e) => setMapping((m) => ({ ...m, [header]: e.target.value }))}
                  placeholder={header}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div>
          <p className="label mb-2">Preview (first {previewRows.length} rows)</p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-bg-tertiary">
                  {headers.map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-gray-500 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i} className="border-t border-border hover:bg-bg-tertiary/50">
                    {headers.map((h) => (
                      <td key={h} className="px-3 py-1.5 text-gray-300 whitespace-nowrap max-w-32 truncate">{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button
          id="csv-submit"
          onClick={handleSubmit}
          disabled={loading || !file}
          className="btn-primary w-full justify-center"
        >
          {loading ? 'Importing...' : `Import ${file?.name}`}
        </button>
      </div>
    );
  }

  return null;
}
