import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, Check, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ocrApi, productApi } from '../services/api';
import { useCategories } from '../hooks/useCategories';
import { formatCurrency } from '../utils/format';
import type { OcrItem, OcrResult } from '../types';

export default function BillScanner() {
  const [mode, setMode] = useState<'choose' | 'camera' | 'review'>('choose');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [editableItems, setEditableItems] = useState<OcrItem[]>([]);
  const [saving, setSaving] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { categories } = useCategories();

  const processFile = async (file: File) => {
    setScanning(true);
    try {
      const ocrResult = await ocrApi.scan(file);
      setResult(ocrResult);
      setEditableItems(ocrResult.items.map(item => ({ ...item })));
      setMode('review');
      if (ocrResult.warnings.length > 0) {
        ocrResult.warnings.forEach(w => toast(w, { icon: '!' }));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const handleCapture = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (screenshot) {
      fetch(screenshot)
        .then(res => res.blob())
        .then(blob => processFile(new File([blob], 'bill.jpg', { type: 'image/jpeg' })));
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const updateItem = (index: number, field: keyof OcrItem, value: string | number) => {
    setEditableItems(items => items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (index: number) => {
    setEditableItems(items => items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (editableItems.length === 0) {
      toast.error('No items to save');
      return;
    }
    setSaving(true);
    const defaultCategory = categories[0];
    let successCount = 0;
    for (const item of editableItems) {
      try {
        await productApi.create({
          name: item.name,
          categoryId: defaultCategory?.id || 1,
          type: 'Belt',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
        successCount++;
      } catch {
        toast.error(`Failed to add: ${item.name}`);
      }
    }
    setSaving(false);
    if (successCount > 0) {
      toast.success(`Added ${successCount} items to inventory`);
      setMode('choose');
      setResult(null);
      setEditableItems([]);
    }
  };

  if (scanning) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 size={32} className="animate-spin text-blue-800" />
        <p className="text-gray-600">Scanning bill...</p>
      </div>
    );
  }

  if (mode === 'camera') {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Capture Bill</h2>
        <div className="bg-black rounded-xl overflow-hidden">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: { ideal: 'environment' } }}
            className="w-full"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCapture}
            className="flex-1 py-3 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 flex items-center justify-center gap-2"
          >
            <Camera size={20} /> Take Photo
          </button>
          <button
            onClick={() => setMode('choose')}
            className="px-6 py-3 border rounded-lg font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'review' && result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Review Scanned Items</h2>
          <button
            onClick={() => { setMode('choose'); setResult(null); }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Scan Again
          </button>
        </div>

        {editableItems.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border">
            <p className="text-gray-500">No items could be extracted from the bill.</p>
            <button
              onClick={() => setMode('choose')}
              className="mt-3 text-blue-700 text-sm hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {editableItems.map((item, index) => (
                <div key={index} className="bg-white rounded-xl border p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                      item.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {Math.round(item.confidence * 100)}% match
                    </span>
                    <button
                      onClick={() => removeItem(index)}
                      className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="Item name"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">Qty</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Price (Rs.)</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl border p-4">
              <p className="text-sm text-gray-600">
                Total: {editableItems.length} items,{' '}
                {formatCurrency(editableItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0))}
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              {saving ? 'Saving...' : 'Confirm & Add to Inventory'}
            </button>
          </>
        )}

        {result.rawText && (
          <details className="text-sm">
            <summary className="text-gray-500 cursor-pointer hover:text-gray-700">
              View raw OCR text
            </summary>
            <pre className="mt-2 p-3 bg-gray-50 border rounded-lg text-xs overflow-auto max-h-48 whitespace-pre-wrap">
              {result.rawText}
            </pre>
          </details>
        )}
      </div>
    );
  }

  // Choose mode
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Scan Bill</h2>
      <p className="text-sm text-gray-500">
        Take a photo of your purchase bill or upload an image. We'll try to extract item details automatically.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <button
          onClick={() => setMode('camera')}
          className="flex flex-col items-center gap-3 p-8 bg-white rounded-xl border-2 border-dashed hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <Camera size={40} className="text-blue-800" />
          <span className="font-medium text-gray-900">Use Camera</span>
          <span className="text-sm text-gray-500">Take a photo of the bill</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-3 p-8 bg-white rounded-xl border-2 border-dashed hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <Upload size={40} className="text-blue-800" />
          <span className="font-medium text-gray-900">Upload Image</span>
          <span className="text-sm text-gray-500">Select from your device</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
